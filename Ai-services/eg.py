"""
🧠 AI SERVICE - eq.py
======================
Think of this file as a DOCTOR for city complaints.
A doctor reads your symptoms → gives a diagnosis.
Our AI reads a complaint → gives a category, severity & priority.

HOW IT WORKS:
  1. We give the AI 40+ example complaints with their correct categories (training data)
  2. It converts text into numbers (TF-IDF) — like a word fingerprint
  3. It learns patterns (Logistic Regression) — like learning from flashcards
  4. When a NEW complaint arrives, it predicts the category!

HOW TO RUN THIS FILE:
  pip install flask flask-cors scikit-learn numpy
  python eq.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import numpy as np

# Flask is like the WAITER of our AI service
# It takes requests from the Node.js backend and returns answers
app = Flask(__name__)
CORS(app)  # Allow other servers (like our Node.js backend) to talk to us


# ============================================================
# 📚 TRAINING DATA — The AI's "textbook"
# Format: ("complaint text", "correct category")
# The more examples we give, the smarter the AI gets!
# ============================================================
TRAINING_DATA = [
    # ── Road Damage ──────────────────────────────────────────
    ("large pothole on main road causing accidents", "Road Damage"),
    ("road has massive crater near the junction", "Road Damage"),
    ("broken road surface damaging vehicles tyres", "Road Damage"),
    ("deep pothole highway flooding road cracked", "Road Damage"),
    ("road completely destroyed after rain water", "Road Damage"),
    ("street pavement broken cracked vehicles damaged", "Road Damage"),
    ("road near school broken repairs needed urgent", "Road Damage"),
    ("deep pothole near traffic signal extremely dangerous", "Road Damage"),
    ("road surface deteriorated heavy vehicle damage", "Road Damage"),
    ("tar road broken needs immediate repair", "Road Damage"),

    # ── Garbage ──────────────────────────────────────────────
    ("garbage not collected for 3 days overflowing bins", "Garbage"),
    ("trash bins overflowing near market area smell", "Garbage"),
    ("waste piling up on street no collection done", "Garbage"),
    ("garbage dump next to residential area foul smell", "Garbage"),
    ("rubbish not cleared streets filthy dirty", "Garbage"),
    ("illegal dumping of construction waste near park", "Garbage"),
    ("garbage truck has not come in a week", "Garbage"),
    ("waste disposal problem entire colony complaining", "Garbage"),
    ("overflowing garbage bins rats insects problem", "Garbage"),

    # ── Water Leakage ─────────────────────────────────────────
    ("water pipe burst flooding entire street", "Water Leakage"),
    ("underground water leakage causing road damage sinkhole", "Water Leakage"),
    ("pipe broken water wasting continuously for days", "Water Leakage"),
    ("water main burst road completely flooded", "Water Leakage"),
    ("sewage pipe leaking smelly water on street", "Water Leakage"),
    ("water supply pipe damaged leaking everywhere", "Water Leakage"),
    ("drainage blocked water overflow flooding area", "Water Leakage"),
    ("water leaking from broken pipe for three days", "Water Leakage"),

    # ── Electricity Issue ─────────────────────────────────────
    ("streetlight not working dark dangerous road night", "Electricity Issue"),
    ("power outage entire neighborhood dark no electricity", "Electricity Issue"),
    ("electrical wire fallen on road extremely dangerous", "Electricity Issue"),
    ("transformer sparking fire risk noise electrical fault", "Electricity Issue"),
    ("no electricity for 2 days complete area blackout", "Electricity Issue"),
    ("street lights broken not repaired for weeks", "Electricity Issue"),
    ("hanging live wire dangerous electric pole broken", "Electricity Issue"),
    ("power supply transformers damaged burning smell", "Electricity Issue"),

    # ── Traffic Issue ─────────────────────────────────────────
    ("traffic signal not working causing massive jam", "Traffic Issue"),
    ("road blocked construction causing heavy traffic congestion", "Traffic Issue"),
    ("no traffic light at busy intersection accident prone", "Traffic Issue"),
    ("signal failure vehicles honking chaos rush hour", "Traffic Issue"),
    ("traffic jam construction no diversion board signs", "Traffic Issue"),
    ("speeding vehicles near school zone no speed bumps", "Traffic Issue"),
    ("junction signal broken cars nearly colliding", "Traffic Issue"),
]

texts  = [row[0] for row in TRAINING_DATA]
labels = [row[1] for row in TRAINING_DATA]


# ============================================================
# 🔍 SEVERITY KEYWORDS
# Words that tell us HOW SERIOUS a complaint is.
# Like a pain scale: "slight" → 2/10 pain, "emergency" → 10/10 pain.
# ============================================================
SEVERITY_RULES = {
    "critical": ["accident", "dangerous", "emergency", "burst", "sparking",
                 "fallen wire", "live wire", "flooding", "fatal", "collapsed",
                 "fire", "electrocution", "sinkhole"],
    "high":     ["broken", "blocked", "no electricity", "overflowing", "damage",
                 "crater", "junction", "highway", "burst", "blackout", "leaking",
                 "destroyed"],
    "medium":   ["not working", "leaking", "not collected", "piling", "cracked",
                 "signal", "no light", "smell"],
    "low":      ["dirty", "minor", "small", "slight", "sometimes", "slow"],
}


# ============================================================
# 🏗️ BUILD THE AI PIPELINE
# Pipeline = an assembly line:
#   Text → TF-IDF (convert to numbers) → Logistic Regression (classify)
# ============================================================
model = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=8000, sublinear_tf=True)),
    ("clf",   LogisticRegression(max_iter=2000, C=5.0, random_state=42)),
])

model.fit(texts, labels)   # 📖 AI is now "studying" the examples
print("✅  AI Model trained successfully!")
print(f"    Learned categories: {list(model.classes_)}")


# ────────────────────────────────────────────────────────────
def calculate_severity(text: str) -> int:
    """
    Scan the complaint for danger words and compute a 1–10 severity score.
    Think of it as a "seriousness meter".
    """
    lower = text.lower()
    score = 5.0  # Default: medium severity

    for word in SEVERITY_RULES["critical"]:
        if word in lower:
            score = min(score + 2.5, 10)
    for word in SEVERITY_RULES["high"]:
        if word in lower:
            score = min(score + 1.2, 10)
    for word in SEVERITY_RULES["medium"]:
        if word in lower:
            score = min(score + 0.5, 10)
    for word in SEVERITY_RULES["low"]:
        if word in lower:
            score = max(score - 1.0, 1)

    return round(max(1.0, min(10.0, score)))


def get_priority(severity: int) -> str:
    """
    Convert a number (1–10) into a priority label.
    Like a traffic light: green = chill, red = ACT NOW!
    """
    if severity >= 9:  return "Critical"
    if severity >= 7:  return "High"
    if severity >= 4:  return "Medium"
    return "Low"


# ============================================================
# 🌐 API ENDPOINTS  (the "doors" the Node.js backend knocks on)
# ============================================================

@app.route("/predict", methods=["POST"])
def predict():
    """
    The MAIN endpoint.
    The Node.js backend sends complaint text here and gets predictions back.

    Request  (JSON): { "text": "Large pothole on highway causing accidents" }
    Response (JSON): { "category": "Road Damage", "severity": 9,
                       "priority": "Critical", "confidence": 94.2 }
    """
    try:
        data = request.get_json()

        if not data or "text" not in data:
            return jsonify({"error": "Please provide a 'text' field"}), 400

        text = data["text"].strip()
        if len(text) < 5:
            return jsonify({"error": "Complaint text is too short"}), 400

        # 🔮 AI predicts category
        category = model.predict([text])[0]

        # 📊 Get confidence (0–100 %) — how sure is the AI?
        proba      = model.predict_proba([text])[0]
        confidence = round(float(np.max(proba)) * 100, 1)

        # 📈 Calculate severity & priority
        severity = calculate_severity(text)
        priority = get_priority(severity)

        return jsonify({
            "category":   category,
            "severity":   severity,
            "priority":   priority,
            "confidence": confidence,
        })

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/health", methods=["GET"])
def health():
    """Quick check: is the AI service alive?"""
    return jsonify({
        "status":           "running",
        "model":            "TF-IDF + Logistic Regression",
        "categories":       model.classes_.tolist(),
        "training_samples": len(texts),
    })


# ── Start the server ─────────────────────────────────────────
if __name__ == "__main__":
    print("\n🚀  AI Service starting on http://localhost:5001")
    print("    POST /predict  — classify a complaint")
    print("    GET  /health   — check service status\n")
    app.run(host="0.0.0.0", port=5001, debug=True)