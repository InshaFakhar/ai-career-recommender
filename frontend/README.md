# Smart Career Recommendation System (Professional Edition)

An enterprise-grade full-stack application that leverages 5,000+ data samples and 4 optimized ML classifiers to predict career trajectories with high precision.

## 🌟 Professional Features
- **Large Scale Dataset**: Trained on 5,000+ samples modeled after Kaggle's Career Prediction datasets.
- **Enhanced Feature Set**: Includes Hackathons, Workshops, Self-Learning capacity, and Online Certifications.
- **Viva Preparation**: Includes a `PROJECT_VIVA_GUIDE.md` for supervisor defense.
- **High-Fidelity PDF**: Automated career analytics reports with branded headers and performance charts.
- **Persistence Layer**: Robust SQLite implementation via SQLAlchemy ORM.

## Tech Stack
- **Frontend**: React (Vite), Axios, Recharts, Framer Motion, Vanilla CSS.
- **Backend**: Python Flask, Flask-SQLAlchemy, Scikit-learn, Pandas, FPDF2.
- **Database**: SQLite.

---

## Setup Instructions

### 1. Backend Setup
Navigate to the backend directory:
```bash
cd backend
```
Install dependencies:
```bash
pip install -r requirements.txt
```
Generate the dataset (3000+ samples):
```bash
python create_dataset.py
```
Run the Flask server:
```bash
python app.py
```
*The backend will run on http://localhost:5000*

### 2. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
```
Install dependencies:
```bash
npm install
```
Run the development server:
```bash
npm run dev
```
*The frontend will run on http://localhost:5173*

---

## Project Structure
- `backend/`: Contains Flask API, ML models, and dataset scripts.
- `frontend/`: Contains React components, pages, and services.
- `cleaned_dataset.csv`: The synthetic dataset generated for training.
- `career_system.db`: SQLite database for prediction history.
