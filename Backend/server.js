/**
 * BACKEND SERVER — server.js
 * Node.js + Express + MongoDB (Mongoose)
 * Port: 5000
 *
 * HOW TO RUN:
 *   1. Install MongoDB from https://www.mongodb.com/try/download/community
 *   2. cd Backend && npm install mongoose
 *   3. npm run dev
 */

const express  = require("express");
const cors     = require("cors");
const axios    = require("axios");
const multer   = require("multer");
const path     = require("path");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));


// ── CONNECT TO MONGODB ────────────────────────────────────────
mongoose.connect("mongodb://localhost:27017/civicai")
  .then(() => console.log("✅  MongoDB connected — database: civicai"))
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    console.error("    Download from: https://www.mongodb.com/try/download/community");
  });


// ── COMPLAINT SCHEMA ──────────────────────────────────────────
const complaintSchema = new mongoose.Schema({
  id:             { type: String, required: true, unique: true },
  title:          { type: String, required: true, trim: true },
  description:    { type: String, required: true, trim: true },
  category:       { type: String, default: "Uncategorized" },
  ai_category:    { type: String, default: "Uncategorized" },
  severity_score: { type: Number, default: 5, min: 1, max: 10 },
  priority_level: { type: String, default: "Medium", enum: ["Critical", "High", "Medium", "Low"] },
  status:         { type: String, default: "Pending", enum: ["Pending", "In Progress", "Resolved"] },
  reported_by:    { type: String, default: "Anonymous" },
  location: {
    lat:     { type: Number, default: 28.6139 },
    lng:     { type: Number, default: 77.2090 },
    address: { type: String, default: "Not specified" },
  },
  image: { type: String, default: null },
}, { timestamps: true });

const Complaint = mongoose.model("Complaint", complaintSchema);


// ── SEED SAMPLE DATA ──────────────────────────────────────────
// Only seeds if the database is completely empty (first run)
async function seedDatabase() {
  try {
    const count = await Complaint.countDocuments();
    if (count > 0) {
      console.log(`📊  Database has ${count} complaints — skipping seed`);
      return;
    }
    console.log("🌱  Empty database — seeding 10 sample complaints...");
    await Complaint.insertMany([
      {
        id: "CMP-001", title: "Critical Pothole on NH-48",
        description: "Massive pothole near Dhaula Kuan flyover. At least 4 vehicles damaged this week.",
        category: "Road Damage", ai_category: "Road Damage",
        severity_score: 9, priority_level: "Critical", status: "In Progress",
        reported_by: "Rahul Sharma",
        location: { lat: 28.591, lng: 77.156, address: "NH-48, Dhaula Kuan" },
      },
      {
        id: "CMP-002", title: "Garbage Overflow — Sector 12 Market",
        description: "Bins not emptied for 5 days. Visible rats near food stalls. Foul smell spreading.",
        category: "Garbage", ai_category: "Garbage",
        severity_score: 7, priority_level: "High", status: "Pending",
        reported_by: "Priya Nair",
        location: { lat: 28.614, lng: 77.218, address: "Sector 12 Market" },
      },
      {
        id: "CMP-003", title: "Burst Water Main — MG Road",
        description: "Underground pipe burst, water flooding both lanes. Traffic completely blocked.",
        category: "Water Leakage", ai_category: "Water Leakage",
        severity_score: 8, priority_level: "Critical", status: "Resolved",
        reported_by: "Amit Verma",
        location: { lat: 28.632, lng: 77.220, address: "MG Road, Connaught Place" },
      },
      {
        id: "CMP-004", title: "Streetlights Out — Lajpat Nagar Block C",
        description: "Entire block dark for 3 nights. A robbery was reported. Urgent fix needed.",
        category: "Electricity Issue", ai_category: "Electricity Issue",
        severity_score: 8, priority_level: "High", status: "Pending",
        reported_by: "Sunita Mehra",
        location: { lat: 28.569, lng: 77.243, address: "Lajpat Nagar Block C" },
      },
      {
        id: "CMP-005", title: "Signal Failure — ITO Junction",
        description: "All 4 signals dead since morning. Near-miss accidents. Police manually deployed.",
        category: "Traffic Issue", ai_category: "Traffic Issue",
        severity_score: 9, priority_level: "Critical", status: "In Progress",
        reported_by: "Deepak Joshi",
        location: { lat: 28.627, lng: 77.241, address: "ITO Junction" },
      },
      {
        id: "CMP-006", title: "Broken Road — Vasant Kunj Sector D",
        description: "Road surface completely deteriorated. Several vehicles have damaged tyres.",
        category: "Road Damage", ai_category: "Road Damage",
        severity_score: 6, priority_level: "Medium", status: "Pending",
        reported_by: "Kavya Reddy",
        location: { lat: 28.521, lng: 77.157, address: "Vasant Kunj Sector D" },
      },
      {
        id: "CMP-007", title: "Sewage Leakage — Civil Lines",
        description: "Sewage pipe cracked and leaking onto pavement. Health hazard for school children.",
        category: "Water Leakage", ai_category: "Water Leakage",
        severity_score: 7, priority_level: "High", status: "Resolved",
        reported_by: "Ravi Kumar",
        location: { lat: 28.677, lng: 77.225, address: "Civil Lines, Old Delhi" },
      },
      {
        id: "CMP-008", title: "Illegal Waste Dumping — Saket",
        description: "Construction debris dumped illegally near residential complex.",
        category: "Garbage", ai_category: "Garbage",
        severity_score: 5, priority_level: "Medium", status: "Pending",
        reported_by: "Anita Singh",
        location: { lat: 28.529, lng: 77.214, address: "Saket District Centre" },
      },
      {
        id: "CMP-009", title: "Fallen Live Wire — Karol Bagh",
        description: "Live electrical wire fallen on road after storm. EXTREMELY DANGEROUS.",
        category: "Electricity Issue", ai_category: "Electricity Issue",
        severity_score: 10, priority_level: "Critical", status: "Resolved",
        reported_by: "Mohit Arora",
        location: { lat: 28.652, lng: 77.190, address: "Karol Bagh Main Market" },
      },
      {
        id: "CMP-010", title: "Pothole Cluster — Dwarka Sector 10",
        description: "8 potholes in a 200m stretch. Floods completely during rain.",
        category: "Road Damage", ai_category: "Road Damage",
        severity_score: 7, priority_level: "High", status: "In Progress",
        reported_by: "Nisha Gupta",
        location: { lat: 28.576, lng: 77.048, address: "Dwarka Sector 10" },
      },
    ]);
    console.log("✅  Seeded 10 sample complaints");
  } catch (err) {
    console.error("❌  Seeding failed:", err.message);
  }
}
mongoose.connection.once("open", seedDatabase);


// ── FILE UPLOAD ───────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });


// ── HELPER: Generate complaint ID ────────────────────────────
async function generateId() {
  const count = await Complaint.countDocuments();
  return `CMP-${String(count + 1).padStart(3, "0")}`;
}


// ════════════════════════════════════════════════════════════
//  ROUTES
// ════════════════════════════════════════════════════════════

// GET /health
app.get("/health", async (req, res) => {
  const count = await Complaint.countDocuments();
  res.json({
    status:     "Backend running 🚀",
    database:   mongoose.connection.readyState === 1 ? "MongoDB connected ✅" : "MongoDB disconnected ❌",
    complaints: count,
  });
});


// POST /complaint — submit a new complaint
app.post("/complaint", upload.single("image"), async (req, res) => {
  try {
    const { title, description, category, reported_by, lat, lng, address } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    // Call Python AI service
    let ai_category = category || "Uncategorized";
    let severity_score = 5;
    let priority_level = "Medium";

    try {
      const aiRes = await axios.post("http://localhost:5001/predict", {
        text: `${title}. ${description}`,
      }, { timeout: 5000 });
      ai_category    = aiRes.data.category;
      severity_score = aiRes.data.severity;
      priority_level = aiRes.data.priority;
    } catch {
      console.warn("⚠️  AI service unavailable — saving without prediction");
    }

    const newComplaint = new Complaint({
      id:          await generateId(),
      title:       title.trim(),
      description: description.trim(),
      category:    category || ai_category,
      ai_category,
      severity_score,
      priority_level,
      reported_by: reported_by || "Anonymous",
      location: {
        lat:     parseFloat(lat)  || 28.6139,
        lng:     parseFloat(lng)  || 77.2090,
        address: address || "Not specified",
      },
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newComplaint.save();
    console.log(`✅  Saved to MongoDB: [${newComplaint.priority_level}] ${newComplaint.title}`);
    res.status(201).json({ message: "Complaint submitted successfully", complaint: newComplaint });

  } catch (err) {
    console.error("❌  Error:", err.message);
    res.status(500).json({ error: "Server error, please try again" });
  }
});


// GET /complaints — list all (with optional filters)
app.get("/complaints", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)   filter.status         = req.query.status;
    if (req.query.category) filter.ai_category    = req.query.category;
    if (req.query.priority) filter.priority_level = req.query.priority;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json({ complaints, total: complaints.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /complaints/:id — single complaint
app.get("/complaints/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ id: req.params.id });
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PATCH /complaints/:id/status — update status
app.patch("/complaints/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["Pending", "In Progress", "Resolved"];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: `Status must be: ${valid.join(", ")}` });
    }
    const updated = await Complaint.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Complaint not found" });
    res.json({ message: "Status updated", complaint: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /analytics — dashboard statistics
app.get("/analytics", async (req, res) => {
  try {
    const total    = await Complaint.countDocuments();
    const pending  = await Complaint.countDocuments({ status: "Pending" });
    const progress = await Complaint.countDocuments({ status: "In Progress" });
    const resolved = await Complaint.countDocuments({ status: "Resolved" });
    const critical = await Complaint.countDocuments({ priority_level: "Critical" });

    const categoryAgg = await Complaint.aggregate([
      { $group: { _id: "$ai_category", count: { $sum: 1 } } }
    ]);
    const byCategory = {};
    categoryAgg.forEach(i => { byCategory[i._id] = i.count; });

    const priorityAgg = await Complaint.aggregate([
      { $group: { _id: "$priority_level", count: { $sum: 1 } } }
    ]);
    const byPriority = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    priorityAgg.forEach(i => { byPriority[i._id] = i.count; });

    // Last 7 days trend
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = await Complaint.countDocuments({
        createdAt: {
          $gte: new Date(`${dateStr}T00:00:00.000Z`),
          $lt:  new Date(`${dateStr}T23:59:59.999Z`),
        }
      });
      trend.push({
        date:  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        count,
      });
    }

    res.json({ total, pending, progress, resolved, critical, byCategory, byPriority, trend });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── START SERVER ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Backend running on http://localhost:${PORT}`);
  console.log(`    GET  /health`);
  console.log(`    POST /complaint`);
  console.log(`    GET  /complaints`);
  console.log(`    PATCH /complaints/:id/status`);
  console.log(`    GET  /analytics\n`);
});