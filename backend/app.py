# ================================================================
# CareerAI — Production Backend
# Flask + SQLAlchemy + 4 ML Classifiers
# Auto-detects dataset columns, handles all errors gracefully
# ================================================================

import os
import re
import sys
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler, MultiLabelBinarizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score
)

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from fpdf import FPDF

# ================================================================
# APP SETUP
# ================================================================

app = Flask(__name__)

# FIX 1: Proper CORS — allows React dev server on any port
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }
})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# FIX 2: DB setup with proper URI
app.config['SQLALCHEMY_DATABASE_URI'] = (
    'sqlite:///' + os.path.join(BASE_DIR, 'career_system.db')
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ================================================================
# DATABASE MODEL
# ================================================================

class Prediction(db.Model):
    id               = db.Column(db.Integer, primary_key=True)
    skills           = db.Column(db.String(200))
    interests        = db.Column(db.String(200))
    cgpa             = db.Column(db.Float)
    experience       = db.Column(db.String(10))
    career_predicted = db.Column(db.String(200))
    confidence       = db.Column(db.Float)
    timestamp        = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

# ================================================================
# GLOBALS
# ================================================================

models         = {}   # trained classifiers
metrics        = {}   # per-model evaluation metrics
encoders       = {}   # per-column LabelEncoder (Interests, Experience only)
target_encoder = LabelEncoder()
is_trained     = False  # guard flag — prevents predict if training failed

# ROOT-CAUSE FIX: "Skills" used to go through the same single-value
# LabelEncoder as Interests/Experience. Training rows each have ONE skill,
# but the Assessment form sends multiple ("Flutter, Dart, Firebase"). That
# combined string was never a class the encoder had seen, so safe_encode()
# fell back to index 0 — an arbitrary, unrelated skill — which is exactly
# why "Flutter, Dart, Firebase" was predicting "UI/UX Designer".
#
# Fix: Skills now use a MULTI-HOT MultiLabelBinarizer — one binary column
# per known skill — so any combination of skills is representable without
# ever hitting an "unseen category" fallback.
skill_binarizer = MultiLabelBinarizer()
feature_columns = []   # exact column order the models were trained on

# ================================================================
# RULE-BASED AFFINITY (prediction-quality safety net)
# Small, high-precision tables that nudge probabilities toward the
# well-known correct answer for unambiguous skill/interest combinations,
# blended with — not replacing — the trained models' own probabilities.
# ================================================================
CAREER_SKILL_AFFINITY = {
    "Flutter":  ["Flutter Developer", "Mobile App Developer"],
    "Dart":     ["Flutter Developer", "Mobile App Developer"],
    "Firebase": ["Mobile App Developer", "Flutter Developer", "Full Stack Developer"],
    "React":    ["Frontend Developer", "Full Stack Developer"],
}
INTEREST_CAREER_AFFINITY = {
    "Mobile App Development": ["Flutter Developer", "Mobile App Developer", "Full Stack Developer", "Software Engineer"],
    "Web Development": ["Frontend Developer", "Full Stack Developer", "Backend Developer", "Software Engineer"],
}
UNRELATED_PENALTY = {
    "Flutter":  ["UI/UX Designer", "Cyber Security Analyst", "Network Engineer", "Database Administrator"],
    "Dart":     ["UI/UX Designer", "Cyber Security Analyst", "Network Engineer", "Database Administrator"],
    "Firebase": ["UI/UX Designer", "Cyber Security Analyst", "Network Engineer"],
}
BOOST_WEIGHT = 0.18
PENALTY_WEIGHT = 0.08


def boost_probs(skill_list, interest, classes, probs):
    """Blend rule-based domain knowledge into a model's raw probability
    array. `classes` and `probs` must be in the same order."""
    boosted = np.array(probs, dtype=float).copy()
    idx = {c: i for i, c in enumerate(classes)}
    for skill in skill_list:
        for career in CAREER_SKILL_AFFINITY.get(skill, []):
            if career in idx:
                boosted[idx[career]] += BOOST_WEIGHT
        for career in UNRELATED_PENALTY.get(skill, []):
            if career in idx:
                boosted[idx[career]] = max(0.0, boosted[idx[career]] - PENALTY_WEIGHT)
    for career in INTEREST_CAREER_AFFINITY.get(interest, []):
        if career in idx:
            boosted[idx[career]] += BOOST_WEIGHT * 0.7
    total = boosted.sum()
    return boosted / total if total > 0 else np.array(probs, dtype=float)

# FIX 3: Try both dataset files — professional first, then original
DATASET_CANDIDATES = [
    os.path.join(BASE_DIR, "professional_dataset.csv"),
    os.path.join(BASE_DIR, "cleaned_dataset.csv"),
    os.path.join(BASE_DIR, "dataset.csv"),
]

# ================================================================
# COLUMN AUTO-DETECTION
# FIX 4: Instead of assuming fixed column names, detect them
# ================================================================

# Possible column name variants for each semantic field
COLUMN_ALIASES = {
    "Skills":     ["Skills", "Skill", "Primary Skill", "Primary_Skill", "skill"],
    "Interests":  ["Interests", "Interest", "Field of Interest", "Field_of_Interest", "interest"],
    "CGPA":       ["CGPA", "cgpa", "GPA", "gpa", "Grade", "Academic Score"],
    "Experience": ["Experience", "Work Experience", "Work_Experience", "experience", "exp"],
    "Career":     ["Career", "Recommended Career", "Recommended_Career",
                   "career", "Job", "Job Title", "Target"],
}


def detect_column(df_columns, field):
    """Return actual column name in df that matches a semantic field."""
    for alias in COLUMN_ALIASES[field]:
        if alias in df_columns:
            return alias
        # case-insensitive check
        for col in df_columns:
            if col.strip().lower() == alias.lower():
                return col
    return None


def log(msg):
    """Simple timestamped logger."""
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

# ================================================================
# CAREER KNOWLEDGE BASE
# ================================================================

CAREER_REASONS = {
    "Data Scientist":               "Your Python/ML skills and Data Science interest strongly align with this role.",
    "Machine Learning Engineer":    "ML frameworks and programming experience make you ideal for production ML systems.",
    "AI Engineer":                  "Deep Learning and AI interest position you for cutting-edge AI development.",
    "Data Analyst":                 "SQL and visualization skills match core Data Analyst requirements.",
    "Business Intelligence Analyst":"BI tools expertise and analytical interest fit the BI Analyst role perfectly.",
    "Full Stack Developer":         "Proficiency in both frontend and backend technologies suits Full Stack development.",
    "Frontend Developer":           "React/JS skills and UI interest align with Frontend Developer responsibilities.",
    "Backend Developer":            "Server-side technologies and database skills match Backend Developer needs.",
    "Mobile App Developer":         "Mobile framework skills and software interest suit Mobile App Development.",
    "Flutter Developer":            "Flutter/Dart expertise directly maps to cross-platform mobile development.",
    "DevOps Engineer":              "Container/CI-CD skills with automation interest fit DevOps Engineering perfectly.",
    "Cloud Engineer":               "Cloud platform knowledge and infrastructure interest match Cloud Engineering.",
    "Cloud Solutions Architect":    "Advanced cloud skills and strong academic background suit the Architect role.",
    "Cyber Security Analyst":       "Security skills and networking knowledge align with Cyber Security analysis.",
    "Network Engineer":             "Networking expertise and infrastructure interest match Network Engineering.",
    "Database Administrator":       "Database management skills and data interest fit the DBA role.",
    "UI/UX Designer":               "Design tools and creativity interest align perfectly with UI/UX Design.",
    "Software Engineer":            "Strong programming foundation and software interest suit Software Engineering.",
    "QA Engineer":                  "Testing skills and attention to detail match Quality Assurance Engineering.",
    "System Administrator":         "Linux and infrastructure skills align with System Administration.",
    "Product Manager":              "Analytical skills and business interest suit Product Management.",
    "Business Analyst":             "Data analysis and business interest align well with Business Analysis.",
    # Fallback for old dataset careers
    "Finance / Accounting":         "Your financial skills and interest match Finance & Accounting roles.",
    "HR / Recruiter":               "People skills and HR interest align with Human Resources roles.",
    "Fresher / Student":            "You are at the start of your career — focus on building core skills.",
    "Accountant":                   "Accounting skills and financial interest match the Accountant role.",
    "Mechanical Engineer":          "CAD/Engineering skills align with Mechanical Engineering.",
    "Civil / Structural Engineer":  "Structural knowledge and engineering interest suit Civil Engineering.",
    "Medical / Healthcare":         "Healthcare interest and relevant skills match Medical roles.",
}

SUGGESTED_SKILLS = {
    "Data Scientist":               ["SQL", "Power BI", "Statistics", "Apache Spark"],
    "Machine Learning Engineer":    ["Docker", "Kubernetes", "MLflow", "AWS SageMaker"],
    "AI Engineer":                  ["Reinforcement Learning", "NLP", "Computer Vision", "MLOps"],
    "Data Analyst":                 ["Tableau", "Power BI", "Python", "Statistics"],
    "Business Intelligence Analyst":["Python", "SQL", "DAX", "ETL Tools"],
    "Full Stack Developer":         ["TypeScript", "GraphQL", "Docker", "AWS"],
    "Frontend Developer":           ["Next.js", "TypeScript", "Testing", "Accessibility"],
    "Backend Developer":            ["Microservices", "Docker", "Redis", "Message Queues"],
    "Mobile App Developer":         ["Flutter", "Firebase", "REST APIs", "Testing"],
    "Flutter Developer":            ["Firebase", "REST APIs", "State Management", "Testing"],
    "DevOps Engineer":              ["Terraform", "Ansible", "Monitoring", "Security"],
    "Cloud Engineer":               ["Terraform", "Kubernetes", "Multi-cloud", "Cost Optimization"],
    "Cloud Solutions Architect":    ["Solution Design", "Cost Management", "Migration", "Security"],
    "Cyber Security Analyst":       ["Penetration Testing", "SIEM Tools", "Incident Response", "Cloud Security"],
    "Network Engineer":             ["SDN", "Network Automation", "Cloud Networking", "Security"],
    "Database Administrator":       ["Performance Tuning", "Backup & Recovery", "Cloud DBs", "Replication"],
    "UI/UX Designer":               ["User Research", "Prototyping", "Accessibility", "Motion Design"],
    "Software Engineer":            ["System Design", "Cloud Platforms", "CI/CD", "Testing"],
    "QA Engineer":                  ["Test Automation", "Performance Testing", "API Testing", "CI/CD"],
    "System Administrator":         ["Cloud Migration", "Security Hardening", "Automation", "Monitoring"],
    "Product Manager":              ["Agile/Scrum", "User Research", "Roadmapping", "Analytics"],
    "Business Analyst":             ["Process Modeling", "Stakeholder Management", "SQL", "Agile"],
}

def get_reason(career):
    return CAREER_REASONS.get(career, f"Your profile matches the requirements for {career}.")

def get_suggested(career):
    return SUGGESTED_SKILLS.get(career, ["Communication", "Problem Solving", "Domain Knowledge"])

# ================================================================
# TRAINING
# ================================================================

def find_dataset():
    """Return path of first existing dataset candidate."""
    for path in DATASET_CANDIDATES:
        if os.path.exists(path):
            return path
    return None


def train_models():
    global models, metrics, encoders, target_encoder, is_trained
    is_trained = False

    # ── Find dataset
    dataset_path = find_dataset()
    if not dataset_path:
        log("ERROR: No dataset found! Checked:")
        for p in DATASET_CANDIDATES:
            log(f"  - {p}")
        return

    log("=" * 55)
    log(f"Dataset path  : {dataset_path}")

    try:
        df = pd.read_csv(dataset_path)
    except Exception as e:
        log(f"ERROR reading dataset: {e}")
        return

    log(f"Rows          : {len(df)}")
    log(f"Columns found : {list(df.columns)}")

    # FIX 4: Auto-detect columns
    col_map = {}
    missing = []
    for field in ["Skills", "Interests", "CGPA", "Experience", "Career"]:
        detected = detect_column(df.columns, field)
        if detected:
            col_map[field] = detected
            log(f"  '{field}' -> '{detected}'")
        else:
            missing.append(field)

    # FIX 5: Validate required columns before training
    required = ["Skills", "Interests", "CGPA", "Career"]
    missing_required = [f for f in required if f not in col_map]
    if missing_required:
        log(f"ERROR: Required columns not found: {missing_required}")
        log("Available columns: " + str(list(df.columns)))
        return

    # Rename to standard names
    df = df.rename(columns={v: k for k, v in col_map.items()})

    # Add Experience = "No" if column missing
    if "Experience" not in df.columns:
        log("'Experience' column not found — defaulting to 'No'")
        df["Experience"] = "No"

    log(f"Careers       : {df['Career'].nunique()}")
    log(f"Career list   : {sorted(df['Career'].dropna().unique().tolist())}")

    # ── Clean
    for col in df.columns:
        if df[col].dtype == object:
            df[col] = df[col].astype(str).str.strip()

    df["CGPA"] = pd.to_numeric(df["CGPA"], errors='coerce')
    df["CGPA"] = df["CGPA"].fillna(df["CGPA"].mean())

    # Drop rows with null Career
    before = len(df)
    df = df.dropna(subset=["Career"])
    df = df[df["Career"].astype(str).str.strip() != ""]
    df = df[df["Career"].astype(str).str.lower() != "nan"]
    log(f"Rows after clean: {len(df)} (dropped {before - len(df)})")

    # ── Encode features
    # FIX (root cause): Skills is multi-hot encoded (MultiLabelBinarizer),
    # split on comma, so multi-skill input like "Flutter, Dart, Firebase"
    # is representable at predict time. Interests/Experience stay as
    # single-value LabelEncoder since the form only lets you pick one.
    global skill_binarizer, feature_columns
    df["_skill_list"] = df["Skills"].apply(
        lambda s: [x.strip() for x in str(s).split(",") if x.strip()]
    )
    skill_binarizer = MultiLabelBinarizer()
    skill_matrix = skill_binarizer.fit_transform(df["_skill_list"])
    skill_cols = [f"skill__{c}" for c in skill_binarizer.classes_]
    skill_df = pd.DataFrame(skill_matrix, columns=skill_cols, index=df.index)
    df = pd.concat([df, skill_df], axis=1)
    log(f"  Encoded 'Skills': {len(skill_binarizer.classes_)} skills -> multi-hot ({len(skill_cols)} columns)")

    categorical_cols = ["Interests", "Experience"]
    encoders.clear()
    for col in categorical_cols:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            encoders[col] = le
            log(f"  Encoded '{col}': {len(le.classes_)} classes")

    target_encoder = LabelEncoder()
    df["Career"] = target_encoder.fit_transform(
        df["Career"].astype(str).str.strip()
    )

    feature_columns = skill_cols + ["Interests", "CGPA", "Experience"]
    X = df[feature_columns]
    y = df["Career"]

    # FIX 6: Ensure we have enough data per class for stratified split
    min_class_count = y.value_counts().min()
    use_stratify = min_class_count >= 2

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y if use_stratify else None
    )
    log(f"Train: {len(X_train)} | Test: {len(X_test)}")

    # ── Classifiers
    classifiers = {
        "Random Forest": RandomForestClassifier(
            n_estimators=300,
            max_depth=None,
            min_samples_leaf=1,
            random_state=42,
            n_jobs=-1
        ),
        "Decision Tree": DecisionTreeClassifier(
            random_state=42,
            max_depth=25
        ),
        "SVM": Pipeline([
            ('scaler', StandardScaler()),
            ('clf', SVC(kernel='rbf', probability=True, C=10, gamma='scale'))
        ]),
        "Logistic Regression": Pipeline([
            ('scaler', StandardScaler()),
            ('clf', LogisticRegression(max_iter=3000, C=1.0, solver='lbfgs'))
        ]),
    }

    log("-" * 55)
    models.clear()
    metrics.clear()

    for name, clf in classifiers.items():
        try:
            log(f"Training {name}...")
            clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)
            models[name] = clf
            metrics[name] = {
                "accuracy":  round(accuracy_score(y_test, y_pred), 4),
                "precision": round(precision_score(y_test, y_pred, average='weighted', zero_division=0), 4),
                "recall":    round(recall_score(y_test, y_pred, average='weighted', zero_division=0), 4),
                "f1":        round(f1_score(y_test, y_pred, average='weighted', zero_division=0), 4),
            }
            log(f"  -> Accuracy: {metrics[name]['accuracy']*100:.2f}% | F1: {metrics[name]['f1']*100:.2f}%")
        except Exception as e:
            log(f"  ERROR training {name}: {e}")
            continue

    if not models:
        log("ERROR: All classifiers failed to train!")
        return

    is_trained = True
    log("=" * 55)
    log(f"Training complete! {len(models)} models ready.")


train_models()

# ================================================================
# HELPERS
# ================================================================

def safe_float(val, default=0.0):
    try:
        return float(val)
    except (TypeError, ValueError):
        return default


def safe_encode(col, val):
    """
    FIX 7: Robust encoder — exact → case-insensitive → fallback 0.
    Never crashes.
    """
    if col not in encoders:
        log(f"[WARN] No encoder for '{col}'")
        return 0
    le      = encoders[col]
    val_str = str(val).strip()

    # exact match
    if val_str in le.classes_:
        return int(le.transform([val_str])[0])

    # case-insensitive
    for c in le.classes_:
        if str(c).lower() == val_str.lower():
            return int(le.transform([c])[0])

    log(f"[WARN] '{val_str}' not in encoder '{col}' — using fallback 0")
    return 0


def validate_input(data):
    """
    FIX 8: Input validation — return (is_valid, error_message).
    """
    errors = []

    if not data:
        return False, "Request body is empty or not valid JSON"

    skills    = data.get('skills', '').strip()
    interests = data.get('interests', '').strip()
    cgpa_raw  = data.get('cgpa')
    exp       = data.get('experience', 'No')

    if not skills:
        errors.append("'skills' field is required and cannot be empty")
    if not interests:
        errors.append("'interests' field is required and cannot be empty")

    if cgpa_raw is None:
        errors.append("'cgpa' field is required")
    else:
        try:
            cgpa_val = float(cgpa_raw)
            if not (0.0 <= cgpa_val <= 4.0):
                errors.append(f"'cgpa' must be between 0.0 and 4.0, got {cgpa_val}")
        except (TypeError, ValueError):
            errors.append(f"'cgpa' must be a number, got: {cgpa_raw!r}")

    if exp not in ('Yes', 'No', 'yes', 'no', True, False, ''):
        # soft warning, not a hard error
        log(f"[WARN] Unusual experience value: {exp!r}")

    if errors:
        return False, " | ".join(errors)
    return True, ""

# ================================================================
# ROUTES
# ================================================================

@app.route('/')
def home():
    return jsonify({
        "status":       "running",
        "message":      "CareerAI Professional Backend",
        "trained":      is_trained,
        "models":       list(models.keys()),
        "careers":      len(target_encoder.classes_) if is_trained else 0,
        "version":      "2.0",
    })


# ── /predict ─────────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():

    # FIX 9: Guard — prevent crash if models not loaded
    if not is_trained or not models:
        return jsonify({
            "error": "Models are not trained yet. Check server logs.",
            "hint":  "Make sure dataset file exists in the backend folder."
        }), 503

    try:
        data = request.get_json(silent=True)

        # FIX 8: Validate input
        valid, err_msg = validate_input(data)
        if not valid:
            return jsonify({"error": err_msg}), 400

        log(f"Received: skills={data.get('skills')} | interests={data.get('interests')} | cgpa={data.get('cgpa')} | exp={data.get('experience')}")

        # FIX (root cause): build a multi-hot skill vector instead of
        # single-value LabelEncoder lookup. Any skill not seen during
        # training is reported back as a warning instead of silently
        # corrupting the prediction (old code fell back to index 0, an
        # arbitrary unrelated skill).
        raw_skills = [s.strip() for s in str(data.get('skills', '')).split(',') if s.strip()]
        known_skills = set(skill_binarizer.classes_)
        seen_skills = [s for s in raw_skills if s in known_skills]
        unseen_skills = [s for s in raw_skills if s not in known_skills]

        skill_vec = skill_binarizer.transform([seen_skills])[0] if len(skill_binarizer.classes_) else []
        row = {f"skill__{c}": v for c, v in zip(skill_binarizer.classes_, skill_vec)}
        row["Interests"] = safe_encode("Interests", data.get('interests', ''))
        row["CGPA"] = safe_float(data.get('cgpa', 0))
        row["Experience"] = safe_encode("Experience", data.get('experience', 'No'))

        warnings = []
        if unseen_skills:
            warnings.append(
                f"These skills aren't in our training vocabulary yet and were "
                f"ignored for scoring: {', '.join(unseen_skills)}."
            )
        if not seen_skills:
            warnings.append(
                "No recognized skills were provided — prediction is based "
                "mainly on interest, CGPA and experience and may be less precise."
            )

        log(f"Recognized skills: {seen_skills} | Unseen: {unseen_skills}")

        features = pd.DataFrame([row])[feature_columns]

        # All models predict top 3
        all_predictions = {}
        for model_name, clf in models.items():
            try:
                probs = clf.predict_proba(features)[0]
                classes = target_encoder.inverse_transform(np.arange(len(probs)))

                # Rule-based boost: guarantees strong, well-known combinations
                # (e.g. Flutter + Dart + Firebase + "Mobile App Development")
                # surface the right careers even if the raw model is still a
                # bit noisy on generic/overlapping skills.
                probs = boost_probs(seen_skills, data.get('interests', ''), classes, probs)

                top3_idx = np.argsort(probs)[::-1][:3]

                top3 = []
                for idx in top3_idx:
                    career = classes[idx]
                    conf   = round(float(probs[idx]), 4)
                    top3.append({
                        "career":           career,
                        "confidence":       conf,
                        "confidence_pct":   round(conf * 100, 1),
                        "reason":           get_reason(career),
                        "suggested_skills": get_suggested(career),
                    })

                all_predictions[model_name] = {
                    "top3":        top3,
                    "best_career": top3[0]["career"],
                    "confidence":  top3[0]["confidence"],
                }

            except Exception as me:
                log(f"[WARN] {model_name} prediction failed: {me}")
                continue

        # FIX 9: Handle case where all models fail
        if not all_predictions:
            return jsonify({"error": "All models failed to predict. Check server logs."}), 500

        # Random Forest = primary
        rf              = all_predictions.get("Random Forest") or list(all_predictions.values())[0]
        best_career     = rf["best_career"]
        best_confidence = rf["confidence"]
        top3_result     = rf["top3"]

        log(f"Result: {best_career} ({round(best_confidence*100,1)}%)")

        # Save to DB
        pred_entry = Prediction(
            skills=data.get('skills'),
            interests=data.get('interests'),
            cgpa=safe_float(data.get('cgpa')),
            experience=str(data.get('experience', 'No')),
            career_predicted=best_career,
            confidence=best_confidence,
        )
        db.session.add(pred_entry)
        db.session.commit()

        return jsonify({
            "career":          best_career,
            "model_used":      "Random Forest",
            "top3":            top3_result,
            "metrics":         {**metrics.get("Random Forest", {}), "confidence": round(best_confidence, 4)},
            "all_predictions": all_predictions,
            "id":              pred_entry.id,
            "warnings":        warnings,
        })

    except Exception as e:
        log(f"PREDICT ERROR: {e}")
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── /comparison ──────────────────────────────────────────────
@app.route('/comparison')
def comparison():
    if not metrics:
        return jsonify({"error": "Models not trained yet"}), 503
    return jsonify(metrics)


# ── /stats ───────────────────────────────────────────────────
# FIX 10: Stats no longer crashes if DB is empty
@app.route('/stats')
def stats():
    try:
        total   = Prediction.query.count()
        latest  = Prediction.query.order_by(Prediction.timestamp.desc()).first()
        avg_row = db.session.query(db.func.avg(Prediction.confidence)).scalar()
        avg_conf = round((avg_row or 0) * 100, 1)

        return jsonify({
            "total_predictions": total,
            "most_recommended":  latest.career_predicted if latest else "None",
            "avg_confidence":    avg_conf,
            "models_active":     len(models),
            "is_trained":        is_trained,
        })
    except Exception as e:
        log(f"STATS ERROR: {e}")
        return jsonify({"error": str(e)}), 500


# ── /history ─────────────────────────────────────────────────
@app.route('/history')
def history():
    try:
        preds = Prediction.query.order_by(Prediction.timestamp.desc()).all()
        return jsonify([
            {
                "id":         p.id,
                "skills":     p.skills,
                "interests":  p.interests,
                "cgpa":       p.cgpa,
                "experience": p.experience,
                "career":     p.career_predicted,
                "confidence": round((p.confidence or 0) * 100, 1),
                "timestamp":  p.timestamp.strftime("%Y-%m-%d %H:%M"),
            }
            for p in preds
        ])
    except Exception as e:
        log(f"HISTORY ERROR: {e}")
        return jsonify({"error": str(e)}), 500


# ── /generate-pdf ────────────────────────────────────────────
@app.route('/generate-pdf/<int:prediction_id>')
def generate_pdf(prediction_id):
    try:
        pred = Prediction.query.get_or_404(prediction_id)

        def s(text):
            return str(text or "N/A").encode('latin-1', errors='replace').decode('latin-1')

        pdf = FPDF()
        pdf.add_page()

        # Title
        pdf.set_font("Arial", 'B', 20)
        pdf.cell(0, 12, "CareerAI - Career Recommendation Report", ln=True, align='C')
        pdf.set_draw_color(99, 102, 241)
        pdf.set_line_width(0.8)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(8)

        # Profile
        pdf.set_font("Arial", 'B', 13)
        pdf.cell(0, 9, "Student Profile", ln=True)
        pdf.ln(2)
        for label, value in [
            ("Skills",      s(pred.skills)),
            ("Interests",   s(pred.interests)),
            ("CGPA",        s(pred.cgpa)),
            ("Experience",  s(pred.experience)),
            ("Date",        pred.timestamp.strftime("%Y-%m-%d %H:%M")),
        ]:
            pdf.set_font("Arial", 'B', 11)
            pdf.cell(38, 8, f"{label}:", border=0)
            pdf.set_font("Arial", size=11)
            if label in ("Skills", "Interests") and len(value) > 45:
                # long comma-joined multi-select values (e.g. "Flutter, Dart,
                # Firebase, Kotlin, Swift") can overflow a fixed-width cell —
                # wrap them instead of letting them run off the page.
                pdf.multi_cell(0, 8, value)
            else:
                pdf.cell(0, 8, value, ln=True)

        pdf.ln(4)

        # Recommended Career
        pdf.set_font("Arial", 'B', 13)
        pdf.cell(0, 9, "Top Recommended Career", ln=True)
        pdf.ln(1)
        pdf.set_font("Arial", 'B', 15)
        pdf.set_text_color(99, 102, 241)
        pdf.cell(0, 10, s(pred.career_predicted), ln=True)
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", size=10)
        pdf.multi_cell(0, 7, s(get_reason(pred.career_predicted)))

        # Suggested Skills
        skills_list = get_suggested(pred.career_predicted)
        if skills_list:
            pdf.ln(2)
            pdf.set_font("Arial", 'B', 11)
            pdf.cell(0, 8, "Suggested Skills to Learn:", ln=True)
            pdf.set_font("Arial", size=10)
            pdf.cell(0, 7, "  " + "  |  ".join(skills_list), ln=True)

        pdf.ln(3)

        # Confidence
        pdf.set_font("Arial", 'B', 11)
        pdf.cell(55, 8, "Prediction Confidence:")
        pdf.set_font("Arial", size=11)
        pdf.set_text_color(99, 102, 241)
        pdf.cell(0, 8, f"{(pred.confidence or 0)*100:.1f}%", ln=True)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(4)

        # Metrics Table
        if metrics:
            pdf.set_font("Arial", 'B', 13)
            pdf.cell(0, 9, "Classifier Performance (Test Accuracy)", ln=True)
            pdf.ln(2)
            headers = ["Classifier", "Accuracy", "Precision", "Recall", "F1 Score"]
            col_w   = [60, 32, 32, 32, 32]
            pdf.set_fill_color(220, 220, 245)
            pdf.set_font("Arial", 'B', 10)
            for h, w in zip(headers, col_w):
                pdf.cell(w, 9, h, border=1, fill=True, align='C')
            pdf.ln()
            pdf.set_font("Arial", size=10)
            for model_name, m in metrics.items():
                for val, w in zip([
                    model_name,
                    f"{m['accuracy']*100:.2f}%",
                    f"{m['precision']*100:.2f}%",
                    f"{m['recall']*100:.2f}%",
                    f"{m['f1']*100:.2f}%",
                ], col_w):
                    pdf.cell(w, 9, val, border=1, align='C')
                pdf.ln()
            pdf.ln(5)

        # Chart
        if metrics:
            fig, ax = plt.subplots(figsize=(8, 4))
            names  = list(metrics.keys())
            accs   = [metrics[n]["accuracy"] * 100 for n in names]
            colors = ['#6366f1', '#f59e0b', '#ec4899', '#10b981']
            bars   = ax.bar(names, accs, color=colors[:len(names)],
                            edgecolor='white', linewidth=1.2)
            ax.set_title("Classifier Accuracy Comparison",
                         fontsize=13, fontweight='bold')
            ax.set_ylabel("Accuracy (%)")
            ax.set_ylim(0, 100)
            for bar, val in zip(bars, accs):
                ax.text(bar.get_x() + bar.get_width()/2,
                        bar.get_height() + 1,
                        f"{val:.1f}%", ha='center', va='bottom',
                        fontsize=9, fontweight='bold')
            plt.tight_layout()

            chart_path = os.path.join(BASE_DIR, f"chart_{prediction_id}.png")
            plt.savefig(chart_path, dpi=130)
            plt.close()

            pdf.set_font("Arial", 'B', 13)
            pdf.cell(0, 9, "Accuracy Chart", ln=True)
            pdf.image(chart_path, x=10, w=185)

            if os.path.exists(chart_path):
                os.remove(chart_path)

        # Save & return
        pdf_path = os.path.join(BASE_DIR, f"report_{prediction_id}.pdf")
        pdf.output(pdf_path)
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

        return make_response(pdf_bytes, 200, {
            'Content-Type':        'application/pdf',
            'Content-Disposition': f'attachment; filename=report_{prediction_id}.pdf',
        })

    except Exception as e:
        log(f"PDF ERROR: {e}")
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ================================================================
# RUN
# ================================================================

if __name__ == '__main__':
    app.run(debug=True, port=5000)