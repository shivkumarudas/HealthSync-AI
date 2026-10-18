"""
HealthSync AI - Flask Backend
Main application file containing all routes, database models, and AI integrations.
"""

import os
import io
import json
import base64
import logging
from datetime import datetime, timedelta
from functools import wraps

from flask import (
    Flask, render_template, request, redirect, url_for,
    session, jsonify, flash, abort
)
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

import google.generativeai as genai
import PyPDF2
from PIL import Image

# ---------------------------------------------------------------------------
# Configuration & App Setup
# ---------------------------------------------------------------------------

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, supports_credentials=True)

secret_key = os.getenv("SECRET_KEY", "").strip()
if len(secret_key) < 32 or secret_key == "heltsync-secret-key-change-in-production":
    raise RuntimeError(
        "Set SECRET_KEY in backend/.env to a random value with at least 32 characters; "
        "the previous built-in fallback is not safe to use. "
        "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
    )
app.config["SECRET_KEY"] = secret_key
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max upload
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "webp"}

db = SQLAlchemy(app)

# ---------------------------------------------------------------------------
# Gemini AI Setup
# ---------------------------------------------------------------------------

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3.8-flash"
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    text_model = genai.GenerativeModel(GEMINI_MODEL)
    vision_model = genai.GenerativeModel(GEMINI_MODEL)
    logger.info("Gemini AI configured successfully.")
else:
    text_model = None
    vision_model = None
    logger.warning("GEMINI_API_KEY not set. AI features will return placeholder responses.")


def get_ai_response(prompt: str, image_data=None, mime_type: str = None) -> str:
    """
    Generate a response from Gemini AI.
    Supports both text-only and multimodal (text + image) requests.
    Returns a friendly error string if the model is unavailable.
    """
    if not text_model:
        return (
            "⚠️ AI features are currently unavailable. "
            "Please set a valid GEMINI_API_KEY in the .env file."
        )
    try:
        if image_data and mime_type:
            response = vision_model.generate_content([
                {"mime_type": mime_type, "data": image_data},
                prompt,
            ])
        else:
            response = text_model.generate_content(prompt)
        return response.text
    except Exception as exc:
        logger.error("Gemini API error: %s", exc)
        return f"❌ AI service error: {exc}"


# ---------------------------------------------------------------------------
# Database Models
# ---------------------------------------------------------------------------

class User(db.Model):
    """Registered application user."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default="user", nullable=False)  # "user" | "admin"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    profile = db.relationship("UserProfile", backref="user", uselist=False, cascade="all, delete-orphan")
    history = db.relationship("AnalysisHistory", backref="user", cascade="all, delete-orphan")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat(),
        }


class UserProfile(db.Model):
    """Extended health profile for a user."""
    __tablename__ = "user_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    age = db.Column(db.Integer)
    weight = db.Column(db.Float)       # kg
    height = db.Column(db.Float)       # cm
    gender = db.Column(db.String(20))
    blood_group = db.Column(db.String(10))
    medical_conditions = db.Column(db.Text, default="")
    allergies = db.Column(db.Text, default="")
    fitness_goal = db.Column(db.String(100), default="")
    activity_level = db.Column(db.String(50), default="moderate")
    dietary_preference = db.Column(db.String(50), default="none")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "age": self.age,
            "weight": self.weight,
            "height": self.height,
            "gender": self.gender,
            "blood_group": self.blood_group,
            "medical_conditions": self.medical_conditions,
            "allergies": self.allergies,
            "fitness_goal": self.fitness_goal,
            "activity_level": self.activity_level,
            "dietary_preference": self.dietary_preference,
        }


class AnalysisHistory(db.Model):
    """Stores records of AI analysis performed by a user."""
    __tablename__ = "analysis_history"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    analysis_type = db.Column(db.String(50), nullable=False)  # "report" | "diet" | "exercise" | "chat" | "doctors"
    input_summary = db.Column(db.Text, default="")
    result = db.Column(db.Text, default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": self.analysis_type,
            "input_summary": self.input_summary,
            "result": self.result[:300] + "..." if len(self.result) > 300 else self.result,
            "created_at": self.created_at.isoformat(),
        }


# ---------------------------------------------------------------------------
# Auth Helpers & Decorators
# ---------------------------------------------------------------------------

def login_required(f):
    """Redirect to login if user is not authenticated."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            flash("Please log in to access this page.", "warning")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Restrict access to admin users only."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            flash("Please log in.", "warning")
            return redirect(url_for("login"))
        user = db.session.get(User, session["user_id"])
        if not user or user.role != "admin":
            abort(403)
        return f(*args, **kwargs)
    return decorated


def current_user():
    """Return the currently logged-in User object, or None."""
    if "user_id" in session:
        return db.session.get(User, session["user_id"])
    return None


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_pdf_text(file_bytes: bytes) -> str:
    """Extract plain text from a PDF file's bytes."""
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        return text.strip()
    except Exception as exc:
        logger.error("PDF extraction error: %s", exc)
        return ""


def bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return "Underweight"
    if bmi < 25:
        return "Normal weight"
    if bmi < 30:
        return "Overweight"
    return "Obese"


# ---------------------------------------------------------------------------
# Page Routes — Authentication
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    user = current_user()
    return render_template("index.html", user=user)


# ---------------------------------------------------------------------------
# JSON API Auth (used by Next.js frontend)
# ---------------------------------------------------------------------------

@app.route("/api/auth/login", methods=["POST"])
def api_login():
    """JSON login endpoint for Next.js frontend."""
    data = request.get_json() or {}
    identifier = data.get("identifier", "").strip()
    password = data.get("password", "")

    user = User.query.filter(
        (User.username == identifier) | (User.email == identifier)
    ).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid username/email or password."}), 401

    session.permanent = True
    session["user_id"] = user.id
    session["username"] = user.username
    session["role"] = user.role

    resp = jsonify({
        "success": True,
        "user": user.to_dict(),
    })
    # Set cookies for Next.js middleware to read
    resp.set_cookie("hs_session", str(user.id), max_age=60*60*24*7, samesite="Lax", httponly=False)
    if user.role == "admin":
        resp.set_cookie("hs_admin", "true", max_age=60*60*24*7, samesite="Lax", httponly=False)
    return resp


@app.route("/api/auth/register", methods=["POST"])
def api_register():
    """JSON register endpoint for Next.js frontend."""
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    errors = []
    if not username or len(username) < 3:
        errors.append("Username must be at least 3 characters.")
    if not email or "@" not in email:
        errors.append("Please enter a valid email address.")
    if len(password) < 6:
        errors.append("Password must be at least 6 characters.")
    if User.query.filter_by(username=username).first():
        errors.append("Username already taken.")
    if User.query.filter_by(email=email).first():
        errors.append("Email already registered.")

    if errors:
        return jsonify({"error": " ".join(errors)}), 400

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.flush()
    profile = UserProfile(user_id=user.id)
    db.session.add(profile)
    db.session.commit()

    session.permanent = True
    session["user_id"] = user.id
    session["username"] = user.username
    session["role"] = user.role

    resp = jsonify({"success": True, "user": user.to_dict()})
    resp.set_cookie("hs_session", str(user.id), max_age=60*60*24*7, samesite="Lax", httponly=False)
    return resp


@app.route("/api/auth/logout", methods=["POST"])
def api_logout():
    """JSON logout endpoint for Next.js frontend."""
    session.clear()
    resp = jsonify({"success": True})
    resp.delete_cookie("hs_session")
    resp.delete_cookie("hs_admin")
    return resp




@app.route("/login", methods=["GET", "POST"])
def login():
    if "user_id" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        identifier = request.form.get("identifier", "").strip()
        password = request.form.get("password", "")

        # Allow login by username or email
        user = User.query.filter(
            (User.username == identifier) | (User.email == identifier)
        ).first()

        if user and user.check_password(password):
            session.permanent = True
            session["user_id"] = user.id
            session["username"] = user.username
            session["role"] = user.role
            flash(f"Welcome back, {user.username}! 👋", "success")
            if user.role == "admin":
                return redirect(url_for("admin"))
            return redirect(url_for("dashboard"))

        flash("Invalid username/email or password.", "danger")

    return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if "user_id" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirm = request.form.get("confirm_password", "")

        # Validation
        errors = []
        if not username or len(username) < 3:
            errors.append("Username must be at least 3 characters.")
        if not email or "@" not in email:
            errors.append("Please enter a valid email address.")
        if len(password) < 6:
            errors.append("Password must be at least 6 characters.")
        if password != confirm:
            errors.append("Passwords do not match.")
        if User.query.filter_by(username=username).first():
            errors.append("Username already taken.")
        if User.query.filter_by(email=email).first():
            errors.append("Email already registered.")

        if errors:
            for err in errors:
                flash(err, "danger")
            return render_template("login.html", register=True)

        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()  # get user.id before commit

        # Create empty profile
        profile = UserProfile(user_id=user.id)
        db.session.add(profile)
        db.session.commit()

        session.permanent = True
        session["user_id"] = user.id
        session["username"] = user.username
        session["role"] = user.role
        flash("Account created successfully! Let's set up your profile.", "success")
        return redirect(url_for("dashboard"))

    return render_template("login.html", register=True)


@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("index"))


# ---------------------------------------------------------------------------
# Page Routes — Dashboard & Features
# ---------------------------------------------------------------------------

@app.route("/dashboard")
@login_required
def dashboard():
    user = current_user()
    profile = user.profile
    history_query = (
        AnalysisHistory.query
        .filter_by(user_id=user.id)
        .order_by(AnalysisHistory.created_at.desc())
    )
    activity_history = history_query.filter(
        AnalysisHistory.analysis_type != "chat"
    ).limit(10).all()
    chat_history = history_query.filter_by(analysis_type="chat").limit(10).all()

    # Calculate BMI if profile is complete
    bmi = None
    bmi_cat = None
    if profile and profile.weight and profile.height:
        height_m = profile.height / 100
        bmi = round(profile.weight / (height_m ** 2), 1)
        bmi_cat = bmi_category(bmi)

    return render_template(
        "dashboard.html",
        user=user,
        profile=profile,
        activity_history=activity_history,
        chat_history=chat_history,
        bmi=bmi,
        bmi_cat=bmi_cat,
    )


@app.route("/report-analyzer")
@login_required
def report_analyzer():
    return render_template("report_analyzer.html", user=current_user())


@app.route("/diet-planner")
@login_required
def diet_planner():
    return render_template("diet_planner.html", user=current_user())


@app.route("/exercise-planner")
@login_required
def exercise_planner():
    return render_template("exercise_planner.html", user=current_user())


@app.route("/chatbot")
@login_required
def chatbot():
    return render_template("chatbot.html", user=current_user())


@app.route("/doctors")
@login_required
def doctors():
    return render_template("doctors.html", user=current_user())


@app.route("/admin")
@admin_required
def admin():
    users = User.query.order_by(User.created_at.desc()).all()
    total_analyses = AnalysisHistory.query.count()
    recent_analyses = (
        AnalysisHistory.query
        .order_by(AnalysisHistory.created_at.desc())
        .limit(20)
        .all()
    )
    return render_template(
        "admin.html",
        user=current_user(),
        users=users,
        total_analyses=total_analyses,
        recent_analyses=recent_analyses,
    )


# ---------------------------------------------------------------------------
# API Routes — User Profile
# ---------------------------------------------------------------------------

@app.route("/api/profile", methods=["GET"])
@login_required
def get_profile():
    user = current_user()
    if not user.profile:
        return jsonify({"profile": None})
    return jsonify({"profile": user.profile.to_dict()})


@app.route("/api/me", methods=["GET"])
@login_required
def api_me():
    """Return current user basic info for the Next.js frontend."""
    user = current_user()
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
    })


@app.route("/api/profile", methods=["POST"])
@login_required
def save_profile():
    user = current_user()
    data = request.get_json() or {}

    profile = user.profile or UserProfile(user_id=user.id)

    profile.age = data.get("age", profile.age)
    profile.weight = data.get("weight", profile.weight)
    profile.height = data.get("height", profile.height)
    profile.gender = data.get("gender", profile.gender)
    profile.blood_group = data.get("blood_group", profile.blood_group)
    profile.medical_conditions = data.get("medical_conditions", profile.medical_conditions)
    profile.allergies = data.get("allergies", profile.allergies)
    profile.fitness_goal = data.get("fitness_goal", profile.fitness_goal)
    profile.activity_level = data.get("activity_level", profile.activity_level)
    profile.dietary_preference = data.get("dietary_preference", profile.dietary_preference)
    profile.updated_at = datetime.utcnow()

    if not user.profile:
        db.session.add(profile)
    db.session.commit()

    return jsonify({"success": True, "message": "Profile saved successfully."})


# ---------------------------------------------------------------------------
# API Routes — AI Features
# ---------------------------------------------------------------------------

@app.route("/api/chat", methods=["POST"])
@login_required
def api_chat():
    """AI Health Assistant chatbot endpoint."""
    data = request.get_json() or {}
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "Message cannot be empty."}), 400

    user = current_user()
    profile_context = ""
    if user.profile:
        p = user.profile
        profile_context = f"""
User Health Profile:
- Age: {p.age}, Gender: {p.gender}
- Weight: {p.weight} kg, Height: {p.height} cm
- Medical Conditions: {p.medical_conditions or 'None'}
- Allergies: {p.allergies or 'None'}
- Fitness Goal: {p.fitness_goal or 'Not specified'}
"""

    prompt = f"""You are HealthSync AI — a professional, empathetic, and knowledgeable AI health assistant.
Your role is to provide accurate, helpful, and safe health information.

IMPORTANT GUIDELINES:
- Always recommend consulting a qualified healthcare professional for medical decisions.
- Do not diagnose conditions or prescribe medication.
- Be supportive, clear, and concise.
- Use bullet points and structure when helpful.
- If the question is unrelated to health, politely redirect.

{profile_context}

User's Question: {user_message}

Provide a helpful, professional response:"""

    response_text = get_ai_response(prompt)

    # Save to history
    history_entry = AnalysisHistory(
        user_id=user.id,
        analysis_type="chat",
        input_summary=user_message[:200],
        result=response_text,
    )
    db.session.add(history_entry)
    db.session.commit()

    return jsonify({"response": response_text})


@app.route("/api/analyze", methods=["POST"])
@login_required
def api_analyze():
    """Medical report analysis — accepts PDF or image file."""
    user = current_user()

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400

    file = request.files["file"]
    if not file or not file.filename:
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type. Please upload a PDF, PNG, JPG, JPEG, or WEBP."}), 400

    filename = secure_filename(file.filename)
    file_bytes = file.read()
    ext = filename.rsplit(".", 1)[1].lower()

    analysis_prompt = """You are a medical report analysis AI. Analyze the provided medical report and produce a structured, easy-to-understand summary.

Your response MUST follow this exact structure:

## 📋 Report Summary
[Brief overview of the report type and key findings]

## 🔬 Key Findings
[Bullet list of important results, values, and observations]

## ✅ Normal Values
[List any results that are within normal range]

## ⚠️ Abnormal / Concerning Values
[List any results outside normal range, with what the normal range should be]

## 💡 Recommendations
[Actionable suggestions based on the findings]

## ⚕️ Important Disclaimer
Always consult a qualified healthcare professional before making any medical decisions based on this analysis.

Be thorough, accurate, and compassionate. Use plain language wherever possible."""

    if ext == "pdf":
        # Extract text from PDF and send as text prompt
        pdf_text = extract_pdf_text(file_bytes)
        if not pdf_text:
            return jsonify({"error": "Could not extract text from PDF. Please try uploading an image of the report."}), 422

        full_prompt = f"{analysis_prompt}\n\n--- REPORT CONTENT ---\n{pdf_text}"
        result = get_ai_response(full_prompt)
    else:
        # Image-based analysis
        image_b64 = base64.b64encode(file_bytes).decode("utf-8")
        mime_map = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp"}
        mime = mime_map.get(ext, "image/jpeg")
        result = get_ai_response(analysis_prompt, image_data=image_b64, mime_type=mime)

    # Save to history
    entry = AnalysisHistory(
        user_id=user.id,
        analysis_type="report",
        input_summary=f"File: {filename}",
        result=result,
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify({"result": result, "filename": filename})


@app.route("/api/diet-plan", methods=["POST"])
@login_required
def api_diet_plan():
    """Generate a personalized diet plan."""
    user = current_user()
    data = request.get_json() or {}

    # Accept explicit params or fall back to saved profile
    profile = user.profile
    age = data.get("age") or (profile.age if profile else None)
    weight = data.get("weight") or (profile.weight if profile else None)
    height = data.get("height") or (profile.height if profile else None)
    gender = data.get("gender") or (profile.gender if profile else "Not specified")
    conditions = data.get("medical_conditions") or (profile.medical_conditions if profile else "None")
    allergies = data.get("allergies") or (profile.allergies if profile else "None")
    goal = data.get("fitness_goal") or (profile.fitness_goal if profile else "General wellness")
    activity = data.get("activity_level") or (profile.activity_level if profile else "moderate")
    diet_pref = data.get("dietary_preference") or (profile.dietary_preference if profile else "none")
    duration_days = data.get("duration_days", 7)
    calories_target = data.get("calories_target", "")

    bmi = None
    if weight and height:
        bmi = round(float(weight) / ((float(height) / 100) ** 2), 1)

    prompt = f"""You are a certified nutritionist AI. Create a detailed, personalized {duration_days}-day diet plan.

USER PROFILE:
- Age: {age} | Gender: {gender}
- Weight: {weight} kg | Height: {height} cm | BMI: {bmi}
- Activity Level: {activity}
- Medical Conditions: {conditions or 'None'}
- Allergies / Intolerances: {allergies or 'None'}
- Dietary Preference: {diet_pref}
- Goal: {goal}
- Target Calories: {calories_target or 'Calculate appropriate amount'}

Create a structured {duration_days}-day meal plan with the following format:

## 🥗 Personalized {duration_days}-Day Diet Plan

### 📊 Nutritional Overview
- Daily Calorie Target: [X kcal]
- Macro Breakdown: Protein X% | Carbs X% | Fats X%
- Key Focus Areas: [based on goals and conditions]

### 🗓️ Daily Meal Plan
For each day provide:
**Day N:**
- 🌅 Breakfast: [meal] — [kcal]
- 🍎 Mid-Morning Snack: [snack] — [kcal]
- ☀️ Lunch: [meal] — [kcal]
- 🍊 Afternoon Snack: [snack] — [kcal]
- 🌙 Dinner: [meal] — [kcal]

### 💧 Hydration Guide
[Water intake recommendations]

### ⚠️ Foods to Avoid
[Based on conditions and allergies]

### 💡 Nutrition Tips
[3-5 personalized tips]

### ⚕️ Disclaimer
Consult a registered dietitian before starting any new diet plan."""

    result = get_ai_response(prompt)

    entry = AnalysisHistory(
        user_id=user.id,
        analysis_type="diet",
        input_summary=f"Goal: {goal}, Duration: {duration_days} days",
        result=result,
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify({"plan": result})


@app.route("/api/exercise-plan", methods=["POST"])
@login_required
def api_exercise_plan():
    """Generate a personalized exercise/workout plan."""
    user = current_user()
    data = request.get_json() or {}

    profile = user.profile
    age = data.get("age") or (profile.age if profile else None)
    weight = data.get("weight") or (profile.weight if profile else None)
    height = data.get("height") or (profile.height if profile else None)
    gender = data.get("gender") or (profile.gender if profile else "Not specified")
    conditions = data.get("medical_conditions") or (profile.medical_conditions if profile else "None")
    goal = data.get("fitness_goal") or (profile.fitness_goal if profile else "General fitness")
    activity = data.get("activity_level") or (profile.activity_level if profile else "moderate")
    fitness_level = data.get("fitness_level", "beginner")
    duration_weeks = data.get("duration_weeks", 4)
    available_equipment = data.get("equipment", "minimal/home gym")
    days_per_week = data.get("days_per_week", 4)

    prompt = f"""You are a certified personal trainer and exercise physiologist AI. Create a detailed {duration_weeks}-week workout plan.

USER PROFILE:
- Age: {age} | Gender: {gender}
- Weight: {weight} kg | Height: {height} cm
- Fitness Level: {fitness_level}
- Activity Level: {activity}
- Medical Conditions / Injuries: {conditions or 'None'}
- Goal: {goal}
- Available Equipment: {available_equipment}
- Training Days Per Week: {days_per_week}

Create a structured workout plan with this format:

## 💪 Personalized {duration_weeks}-Week Workout Plan

### 📊 Plan Overview
- Training Frequency: {days_per_week} days/week
- Fitness Level: {fitness_level}
- Primary Goal: {goal}
- Estimated Duration per Session: [X minutes]

### 🗓️ Weekly Schedule Template
[Show which days are workout vs rest days]

### 🏋️ Workout Routines
For each workout type (e.g., Upper Body, Lower Body, Cardio, Full Body):

**[Workout Name]:**
| Exercise | Sets | Reps/Duration | Rest | Notes |
|----------|------|---------------|------|-------|
| [Exercise] | X | X reps | Xs | [form tips] |

### 📈 Progression Plan
[How to increase intensity over the {duration_weeks} weeks]

### 🔥 Warm-Up Routine (5-10 min)
[Dynamic stretches and activation exercises]

### 🧘 Cool-Down Routine (5-10 min)
[Static stretches and recovery]

### ⚠️ Safety Precautions
[Based on medical conditions and fitness level]

### 💡 Recovery Tips
[Sleep, nutrition timing, foam rolling, etc.]

### ⚕️ Disclaimer
Consult a healthcare professional before starting a new exercise program, especially with pre-existing conditions."""

    result = get_ai_response(prompt)

    entry = AnalysisHistory(
        user_id=user.id,
        analysis_type="exercise",
        input_summary=f"Goal: {goal}, Level: {fitness_level}, Weeks: {duration_weeks}",
        result=result,
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify({"plan": result})


@app.route("/api/doctors", methods=["POST"])
@login_required
def api_doctors():
    """Find and recommend doctors based on specialty and location."""
    user = current_user()
    data = request.get_json() or {}

    specialty = data.get("specialty", "General Physician").strip()
    location = data.get("location", "").strip()
    condition = data.get("condition", "").strip()
    insurance = data.get("insurance", "").strip()
    preference = data.get("preference", "").strip()  # e.g., "female doctor", "evening appointments"

    prompt = f"""You are a healthcare navigation AI assistant. Help the user find appropriate medical specialists.

USER REQUEST:
- Specialty Needed: {specialty}
- Location: {location or 'Not specified'}
- Medical Condition/Concern: {condition or 'General consultation'}
- Insurance: {insurance or 'Not specified'}
- Additional Preferences: {preference or 'None'}

Provide a comprehensive response in this format:

## 🏥 Doctor & Specialist Recommendations

### 🔍 Why You Need a {specialty}
[Brief explanation of what this specialist treats]

### 📋 What to Look For in a {specialty}
[3-5 key qualifications and certifications to check]

### 🌐 How to Find Verified Doctors in {location or 'Your Area'}
[Step-by-step guide to finding verified doctors — include platforms like Practo, Google Health, Zocdoc, NHS, etc. based on location]

### ✅ Top Questions to Ask Your Doctor
[5-7 important questions to ask during consultation]

### 📝 How to Prepare for Your Appointment
[What documents to bring, symptoms to note, etc.]

### 💡 Red Flags to Watch Out For
[Warning signs of unqualified practitioners]

### 🆘 When to Seek Emergency Care
[Symptoms that require immediate ER/emergency visit]

### ⚕️ Disclaimer
This is AI-generated guidance only. Always verify doctor credentials through official medical board registries."""

    result = get_ai_response(prompt)

    entry = AnalysisHistory(
        user_id=user.id,
        analysis_type="doctors",
        input_summary=f"Specialty: {specialty}, Location: {location}",
        result=result,
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify({"result": result})


# ---------------------------------------------------------------------------
# API Routes — Admin
# ---------------------------------------------------------------------------

@app.route("/api/users", methods=["GET"])
@admin_required
def api_get_users():
    """Return all users with basic info (admin only)."""
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({
        "users": [u.to_dict() for u in users],
        "total": len(users),
    })


@app.route("/api/users/<int:user_id>", methods=["DELETE"])
@admin_required
def api_delete_user(user_id: int):
    """Delete a user account (admin only). Cannot delete own account."""
    if user_id == session.get("user_id"):
        return jsonify({"error": "Cannot delete your own account."}), 400
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"success": True, "message": f"User '{user.username}' deleted."})


@app.route("/api/history", methods=["GET"])
@login_required
def api_get_history():
    """Return analysis history for the current user."""
    user = current_user()
    limit = request.args.get("limit", 20, type=int)
    history = (
        AnalysisHistory.query
        .filter_by(user_id=user.id)
        .order_by(AnalysisHistory.created_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify({"history": [h.to_dict() for h in history]})


# ---------------------------------------------------------------------------
# Error Handlers
# ---------------------------------------------------------------------------

@app.errorhandler(403)
def forbidden(e):
    return render_template("index.html", error="403 — Access Forbidden"), 403


@app.errorhandler(404)
def not_found(e):
    return render_template("index.html", error="404 — Page Not Found"), 404


@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large. Maximum size is 16 MB."}), 413


# ---------------------------------------------------------------------------
# Database Initialization & Seeding
# ---------------------------------------------------------------------------

def seed_admin():
    """Create an admin account from explicit environment settings, if configured."""
    admin_user = User.query.filter_by(role="admin").first()
    if admin_user:
        # The previous version shipped with this password as its default. Require
        # an explicit replacement before allowing that seeded account to remain.
        if admin_user.check_password("admin123"):
            replacement_password = os.getenv("ADMIN_PASSWORD", "")
            if len(replacement_password) < 12:
                raise RuntimeError(
                    "The existing admin account still uses the old default password. "
                    "Set ADMIN_PASSWORD to a new value of at least 12 characters in "
                    "backend/.env, then restart the app."
                )
            admin_user.set_password(replacement_password)
            db.session.commit()
            logger.warning("Replaced the legacy default password for the existing admin account.")
        return

    if not admin_user:
        admin_username = os.getenv("ADMIN_USERNAME", "").strip()
        admin_password = os.getenv("ADMIN_PASSWORD", "")
        admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()

        if not admin_username or not admin_password or not admin_email:
            logger.warning(
                "Admin account not created. Set ADMIN_USERNAME, ADMIN_EMAIL, and "
                "ADMIN_PASSWORD in backend/.env before starting the app."
            )
            return
        if len(admin_password) < 12:
            raise RuntimeError("ADMIN_PASSWORD must be at least 12 characters long.")

        admin_user = User(
            username=admin_username,
            email=admin_email,
            role="admin",
        )
        admin_user.set_password(admin_password)
        db.session.add(admin_user)

        db.session.flush()
        db.session.add(UserProfile(user_id=admin_user.id))
        db.session.commit()
        logger.info("Admin account created: %s", admin_username)


# ---------------------------------------------------------------------------
# Application Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        seed_admin()
        logger.info("✅ Database initialized.")
        logger.info("🚀 HealthSync AI backend running...")

    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )
