import os
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
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

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///career_system.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Prediction(db.Model):
    id               = db.Column(db.Integer, primary_key=True)
    skills           = db.Column(db.String(100))
    interests        = db.Column(db.String(100))
    cgpa             = db.Column(db.Float)
    career_predicted = db.Column(db.String(100))
    metrics_acc      = db.Column(db.Float)
    timestamp        = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

models         = {}
metrics        = {}
encoders       = {}
target_encoder = LabelEncoder()

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "cleaned_dataset.csv")

def train_models():
    global models, metrics, encoders, target_encoder
    try:
        print("Loading Dataset...")
        if not os.path.exists(DATASET_PATH):
            print("Dataset not found!")
            return

        df = pd.read_csv(DATASET_PATH)
        # FIX: Use FULL dataset — all 4995 rows, all 19 careers
        print(f"Dataset Loaded: {len(df)} rows, {df['Career'].nunique()} careers")

        # Clean
        for col in df.columns:
            if df[col].dtype == object:
                df[col] = df[col].astype(str).str.strip()

        df["CGPA"] = pd.to_numeric(df["CGPA"], errors='coerce')
        df["CGPA"] = df["CGPA"].fillna(df["CGPA"].mean())

        # Encode categorical columns
        categorical_cols = [
            "Skills", "Interests", "Certifications", "Experience",
            "Domain_Preference", "Workshops", "Hackathons",
            "Self_Learning", "Extra_Courses"
        ]
        for col in categorical_cols:
            if col in df.columns:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                encoders[col] = le

        df["Career"] = target_encoder.fit_transform(
            df["Career"].astype(str).str.strip()
        )

        feature_cols = [
            "Skills", "Interests", "CGPA", "Certifications", "Experience",
            "Domain_Preference", "Workshops", "Hackathons",
            "Self_Learning", "Extra_Courses"
        ]

        X = df[feature_cols]
        y = df["Career"]

        # 80% train, 20% test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        print(f"Train: {len(X_train)} rows | Test: {len(X_test)} rows")

        # Classifiers — SVM & LR use Pipeline with scaler for better accuracy
        classifiers = {
            "Random Forest": RandomForestClassifier(
                n_estimators=200,
                max_depth=None,
                min_samples_leaf=1,
                random_state=42,
                n_jobs=-1
            ),
            "Decision Tree": DecisionTreeClassifier(
                random_state=42,
                max_depth=20
            ),
            "SVM": Pipeline([
                ('scaler', StandardScaler()),
                ('clf', SVC(kernel='rbf', probability=True, C=10, gamma='scale'))
            ]),
            "Logistic Regression": Pipeline([
                ('scaler', StandardScaler()),
                ('clf', LogisticRegression(max_iter=2000, C=1.0, solver='lbfgs'))
            ])
        }

        for name, clf in classifiers.items():
            print(f"Training {name}...")
            clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)
            models[name] = clf
            metrics[name] = {
                "accuracy":  round(accuracy_score(y_test, y_pred), 4),
                "precision": round(precision_score(y_test, y_pred, average='weighted', zero_division=0), 4),
                "recall":    round(recall_score(y_test, y_pred, average='weighted', zero_division=0), 4),
                "f1":        round(f1_score(y_test, y_pred, average='weighted', zero_division=0), 4),
            }
            print(f"  -> {name}: accuracy={metrics[name]['accuracy']:.4f}")

        print("All models trained!")

    except Exception as e:
        print("TRAIN ERROR:", str(e))
        import traceback; traceback.print_exc()

train_models()

@app.route('/')
def home():
    return jsonify({"message": "Career Recommendation Backend Running"})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        def safe_float(val):
            try:
                return float(val)
            except:
                return 0.0

        def safe_encode(col, val):
            if col not in encoders:
                print(f"[WARN] No encoder for col '{col}'")
                return 0
            le      = encoders[col]
            val_str = str(val).strip()
            if val_str in le.classes_:
                return int(le.transform([val_str])[0])
            val_lower = val_str.lower()
            for c in le.classes_:
                try:
                    if str(c).lower() == val_lower:
                        return int(le.transform([c])[0])
                except Exception:
                    continue
            print(f"[WARN] '{val_str}' not in encoder '{col}', using fallback index 0")
            return 0

        encoded = {
            "Skills":            safe_encode("Skills",            data.get('skills', '')),
            "Interests":         safe_encode("Interests",         data.get('interests', '')),
            "CGPA":              safe_float(data.get('cgpa', 0)),
            "Certifications":    safe_encode("Certifications",    data.get('certifications', 'No')),
            "Experience":        safe_encode("Experience",        str(data.get('experience', 'No'))),
            "Domain_Preference": safe_encode("Domain_Preference", data.get('domain', '')),
            "Workshops":         safe_encode("Workshops",         data.get('workshops', 'No')),
            "Hackathons":        safe_encode("Hackathons",        data.get('hackathons', 'No')),
            "Self_Learning":     safe_encode("Self_Learning",     data.get('self_learning', 'No')),
            "Extra_Courses":     safe_encode("Extra_Courses",     data.get('extra_courses', 'nan')),
        }

        feature_cols = [
            "Skills", "Interests", "CGPA", "Certifications", "Experience",
            "Domain_Preference", "Workshops", "Hackathons",
            "Self_Learning", "Extra_Courses"
        ]

        features = pd.DataFrame([encoded])[feature_cols]

        all_predictions = {}
        for model_name, clf in models.items():
            try:
                pred_idx   = clf.predict(features)[0]
                probs      = clf.predict_proba(features)
                confidence = float(np.max(probs))
                career     = target_encoder.inverse_transform([pred_idx])[0]
                all_predictions[model_name] = {
                    "career":     career,
                    "confidence": round(confidence, 4)
                }
            except Exception as me:
                print(f"[WARN] {model_name} prediction failed: {me}")
                continue

        # Always use Random Forest as primary (best accuracy, no overfitting)
        rf_result       = all_predictions.get("Random Forest", {})
        best_career     = rf_result.get("career", list(all_predictions.values())[0]["career"])
        best_confidence = rf_result.get("confidence", 0)
        best_model_name = "Random Forest"

        if not best_career:
            return jsonify({"error": "All models failed to predict"}), 500

        pred_entry = Prediction(
            skills=data.get('skills'),
            interests=data.get('interests'),
            cgpa=safe_float(data.get('cgpa')),
            career_predicted=best_career,
            metrics_acc=best_confidence
        )
        db.session.add(pred_entry)
        db.session.commit()

        return jsonify({
            "career":          best_career,
            "model_used":      best_model_name,
            "metrics":         {**metrics[best_model_name], "confidence": round(best_confidence, 4)},
            "all_predictions": all_predictions,
            "id":              pred_entry.id
        })

    except Exception as e:
        print("PREDICT ERROR:", str(e))
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/comparison')
def comparison():
    return jsonify(metrics)

@app.route('/stats')
def stats():
    total   = Prediction.query.count()
    latest  = Prediction.query.order_by(Prediction.timestamp.desc()).first()
    avg_acc = db.session.query(db.func.avg(Prediction.metrics_acc)).scalar()
    return jsonify({
        "total_predictions": total,
        "most_recommended":  latest.career_predicted if latest else "None",
        "avg_accuracy":      round(avg_acc or 0, 2),
        "models_active":     len(models)
    })

@app.route('/history')
def history():
    preds = Prediction.query.order_by(Prediction.timestamp.desc()).all()
    return jsonify([
        {
            "id":        p.id,
            "skills":    p.skills,
            "interests": p.interests,
            "cgpa":      p.cgpa,
            "career":    p.career_predicted,
            "timestamp": p.timestamp.strftime("%Y-%m-%d %H:%M")
        }
        for p in preds
    ])

@app.route('/generate-pdf/<int:prediction_id>')
def generate_pdf(prediction_id):
    try:
        pred = Prediction.query.get_or_404(prediction_id)

        def s(text):
            return str(text or "N/A").encode('latin-1', errors='replace').decode('latin-1')

        pdf = FPDF()
        pdf.add_page()

        pdf.set_font("Arial", 'B', 20)
        pdf.cell(0, 12, "Career Recommendation Report", ln=True, align='C')
        pdf.ln(3)
        pdf.set_draw_color(99, 102, 241)
        pdf.set_line_width(0.8)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(8)

        details = [
            ("Skills",             s(pred.skills)),
            ("Interests",          s(pred.interests)),
            ("CGPA",               s(pred.cgpa)),
            ("Recommended Career", s(pred.career_predicted)),
            ("Confidence",         f"{(pred.metrics_acc or 0)*100:.1f}%"),
            ("Date",               pred.timestamp.strftime("%Y-%m-%d %H:%M")),
        ]

        for label, value in details:
            pdf.set_font("Arial", 'B', 12)
            pdf.cell(65, 9, f"{label}:", border=0)
            pdf.set_font("Arial", size=12)
            if label == "Recommended Career":
                pdf.set_text_color(99, 102, 241)
            pdf.cell(0, 9, value, ln=True)
            pdf.set_text_color(0, 0, 0)

        pdf.ln(6)

        pdf.set_font("Arial", 'B', 13)
        pdf.cell(0, 10, "Model Performance Metrics", ln=True)
        pdf.ln(2)

        headers = ["Classifier", "Accuracy", "Precision", "Recall", "F1 Score"]
        col_w   = [58, 33, 33, 33, 33]

        pdf.set_fill_color(220, 220, 245)
        pdf.set_font("Arial", 'B', 10)
        for h, w in zip(headers, col_w):
            pdf.cell(w, 9, h, border=1, fill=True, align='C')
        pdf.ln()

        pdf.set_font("Arial", size=10)
        for model_name, m in metrics.items():
            row = [
                model_name,
                f"{m['accuracy']*100:.2f}%",
                f"{m['precision']*100:.2f}%",
                f"{m['recall']*100:.2f}%",
                f"{m['f1']*100:.2f}%",
            ]
            for val, w in zip(row, col_w):
                pdf.cell(w, 9, val, border=1, align='C')
            pdf.ln()

        pdf.ln(6)

        plt.figure(figsize=(7, 4))
        names  = list(metrics.keys())
        accs   = [metrics[n]["accuracy"] * 100 for n in names]
        colors = ['#6366f1', '#f59e0b', '#ec4899', '#10b981']
        bars   = plt.bar(names, accs, color=colors[:len(names)])
        plt.title("Classifier Accuracy Comparison")
        plt.ylabel("Accuracy (%)")
        plt.ylim(0, 100)
        for bar, val in zip(bars, accs):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height()+1,
                     f"{val:.1f}%", ha='center', va='bottom', fontsize=9)
        plt.tight_layout()

        chart_path = os.path.join(BASE_DIR, f"chart_{prediction_id}.png")
        plt.savefig(chart_path, dpi=120)
        plt.close()

        pdf.set_font("Arial", 'B', 13)
        pdf.cell(0, 10, "Classifier Accuracy Chart", ln=True)
        pdf.image(chart_path, x=15, w=175)

        if os.path.exists(chart_path):
            os.remove(chart_path)

        pdf_path = os.path.join(BASE_DIR, f"report_{prediction_id}.pdf")
        pdf.output(pdf_path)
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

        return make_response(pdf_bytes, 200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'attachment; filename=report_{prediction_id}.pdf'
        })

    except Exception as e:
        print("PDF ERROR:", str(e))
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)