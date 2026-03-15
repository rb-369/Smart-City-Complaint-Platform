# 🏙️ CivicAI — Smart City Complaint & Issue Prediction Platform

> AI-powered civic complaint management with real-time classification,
> priority routing, and interactive city heatmap visualization.

---

## 📐 Project Architecture

```
Citizens (Browser)
      │
      ▼
┌─────────────────────────────────┐
│  FRONTEND  (React + Vite)       │
│  Port: 5173                     │
│  • Landing Page                 │
│  • Dashboard (charts + table)   │
│  • Report Issue (AI form)       │
│  • City Heatmap (Leaflet map)   │
└──────────────┬──────────────────┘
               │  HTTP / Axios
               ▼
┌─────────────────────────────────┐
│  BACKEND  (Node.js + Express)   │
│  Port: 5000                     │
│  • POST /complaint              │
│  • GET  /complaints             │
│  • GET  /analytics              │
└──────────────┬──────────────────┘
               │  HTTP / Axios
               ▼
┌─────────────────────────────────┐
│  AI SERVICE  (Python + Flask)   │
│  Port: 5001                     │
│  • POST /predict                │
│  • GET  /health                 │
│  Model: TF-IDF + Logistic Reg.  │
└─────────────────────────────────┘
```

**Simple Explanation:**
- Think of the **Frontend** as the restaurant dining room (what you see)
- The **Backend** is the kitchen (processes everything, talks to database)
- The **AI Service** is the head chef's special recipe machine (predicts categories)

---

## 📁 Folder Structure

```
SMART-CITY-COMPLAINT-PLATFORM/
│
├── Ai-services/
│   └── eq.py               ← Python AI (Flask API + ML model)
│
├── Backend/
│   ├── package.json        ← Node.js dependencies list
│   └── server.js           ← Express API server (all routes)
│
└── Frontend/
    └── Smart-app/
        ├── index.html          ← Entry HTML (React injects here)
        ├── package.json        ← React dependencies list
        ├── vite.config.js      ← Build tool configuration
        ├── tailwind.config.js  ← CSS framework configuration
        ├── postcss.config.js   ← CSS processor
        └── src/
            ├── main.jsx        ← React app entry point
            ├── App.jsx         ← Router (which URL → which page)
            ├── index.css       ← Global design system & styles
            ├── data/
            │   └── mockData.js ← Sample complaints for the dashboard
            ├── components/
            │   ├── Sidebar.jsx       ← Left navigation bar
            │   ├── StatCard.jsx      ← Animated counter cards
            │   └── ComplaintTable.jsx← Sortable, filterable table
            └── pages/
                ├── Landing.jsx    ← Hero landing page
                ├── Dashboard.jsx  ← Admin command center
                ├── ReportIssue.jsx← Complaint submission form
                └── MapView.jsx    ← Interactive city heatmap
```

---

## 🛠️ Installation Guide

### Step 1 — Make sure you have these tools installed

Open your terminal and check:

```bash
node --version     # Should show v18 or higher
npm  --version     # Should show v8 or higher
python --version   # Should show Python 3.8 or higher
pip  --version     # Should come with Python
```

If you don't have these:
- **Node.js**: Download from https://nodejs.org (choose LTS version)
- **Python**: Download from https://python.org (choose Python 3.11+)

---

### Step 2 — Install Python AI Service dependencies

Open terminal. Navigate to the Ai-services folder:

```bash
cd Ai-services
pip install flask flask-cors scikit-learn numpy
```

**What are these?**
- `flask` = the web server that makes Python accessible as an API
- `flask-cors` = allows our Node.js backend to call our Python service
- `scikit-learn` = the machine learning library (TF-IDF + Logistic Regression)
- `numpy` = math library used by scikit-learn

---

### Step 3 — Install Node.js Backend dependencies

```bash
cd Backend
npm install
```

This reads `package.json` and downloads all listed packages into a `node_modules` folder.

**What does this install?**
- `express` = the web framework (handles routes like GET /complaints)
- `cors` = allows the React frontend to call our API
- `axios` = for the backend to call the Python AI service
- `multer` = handles image file uploads
- `uuid` = generates unique IDs for complaints

---

### Step 4 — Install React Frontend dependencies

```bash
cd Frontend/Smart-app
npm install
```

**What does this install?**
- `react` = the UI library
- `recharts` = for drawing beautiful charts
- `react-leaflet` = for the interactive city map
- `framer-motion` = for smooth animations
- `tailwindcss` = for utility CSS styling
- `lucide-react` = for icons
- `axios` = for calling our backend API

---

## 🚀 Running the Project

You need **3 terminal windows** open simultaneously (one for each service):

---

### Terminal 1 — Start the AI Service

```bash
cd Ai-services
python eq.py
```

✅ You should see:
```
AI Model trained successfully!
Learned categories: ['Electricity Issue', 'Garbage', ...]
AI Service starting on http://localhost:5001
POST /predict  — classify a complaint
GET  /health   — check service status
```

---

### Terminal 2 — Start the Backend

```bash
cd Backend

# Create uploads folder (for images)
mkdir uploads

npm run dev
```

✅ You should see:
```
Backend running on http://localhost:5000
GET  /health             — check status
POST /complaint          — submit complaint
GET  /complaints         — list all
GET  /analytics          — dashboard stats
```

---

### Terminal 3 — Start the Frontend

```bash
cd Frontend/Smart-app
npm run dev
```

✅ You should see:
```
  VITE v5.0.0  ready in 312 ms
  ➜  Local:   http://localhost:5173/
```

---

### Open in Browser

Visit **http://localhost:5173** in Chrome or Firefox.

You should see the CivicAI landing page!

---

## 🔌 How the 3 Services Connect

```
User Types: "pothole on highway causing accidents"
      │
      ▼
React Frontend sends HTTP POST to → http://localhost:5000/complaint
      │
      ▼
Node.js Backend receives it, then calls → http://localhost:5001/predict
      │
      ▼
Python AI Service analyzes the text:
  TF-IDF converts: "pothole highway accidents" → [0.82, 0.0, 0.91, ...]
  Logistic Regression predicts: "Road Damage"
  Returns: { category: "Road Damage", severity: 9, priority: "Critical" }
      │
      ▼
Node.js saves complaint + AI results → sends response to React
      │
      ▼
React shows success + displays prediction to user ✅
```

---

## 🎯 Testing Each API Endpoint

Once the backend is running, you can test it in your browser or with curl:

```bash
# Check if backend is alive
curl http://localhost:5000/health

# Get all complaints
curl http://localhost:5000/complaints

# Get analytics data
curl http://localhost:5000/analytics

# Check if AI service is alive
curl http://localhost:5001/health

# Test AI prediction
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "large pothole on highway causing accidents"}'
```

---

## 📊 AI Model Details

| Property       | Value                                   |
|----------------|-----------------------------------------|
| Algorithm      | Logistic Regression                     |
| Text Encoding  | TF-IDF (Term Frequency–Inverse Doc Freq)|
| Training Data  | 40+ manually labeled complaints         |
| Categories     | 5 (Road Damage, Garbage, Water Leakage, |
|                | Electricity Issue, Traffic Issue)       |
| Severity       | 1–10 (keyword-based scoring)            |
| Priority       | Critical / High / Medium / Low          |

---

## 🚨 Troubleshooting

**Problem: Map doesn't load**
Solution: Make sure you have internet connection (the map tiles load from CartoDB CDN)

**Problem: AI predictions not working when submitting form**
Solution: Make sure Terminal 1 (Python) is running on port 5001

**Problem: `npm install` fails**
Solution: Try `npm install --legacy-peer-deps`

**Problem: Python `ModuleNotFoundError`**
Solution: Run `pip install flask flask-cors scikit-learn numpy` again

**Problem: Port already in use**
Solution: Kill the process using that port:
- Mac/Linux: `kill -9 $(lsof -ti:5000)`
- Windows: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`

---

## 🏆 Project Grade Justification

| Feature                            | Implementation                        |
|------------------------------------|---------------------------------------|
| AI Classification                  | Python TF-IDF + Logistic Regression   |
| Severity Prediction                | Keyword-based scoring (1–10)          |
| Priority Routing                   | Critical / High / Medium / Low        |
| Interactive Heatmap                | Leaflet.js with custom markers        |
| Analytics Dashboard                | Recharts (Area + Pie charts)          |
| Real-time Data Table               | Sortable, searchable, filterable      |
| Animated UI                        | Framer Motion + CSS animations        |
| REST API                           | Node.js + Express (5 endpoints)       |
| Image Upload                       | Multer (multipart/form-data)          |
| Professional UI Design             | Dark tech theme + Rajdhani font       |

---

*Built with React + Vite · Node.js + Express · Python + Flask · Leaflet.js*