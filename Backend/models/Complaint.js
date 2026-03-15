const mongoose = require("mongoose");

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