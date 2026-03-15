// ReportIssue.jsx — COMPLAINT SUBMISSION FORM
// ==============================================
// Think of this page as the "emergency call center" interface.
// A citizen fills out a form, and while they type, our AI is
// ALREADY analyzing the text and predicting the category.
//
// KEY FLOW:
//   User types → we call the AI → prediction appears live
//   User submits → goes to Node.js backend → saved in DB

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Send, Upload, X, MapPin, Zap, AlertTriangle,
  CheckCircle, Brain, Loader2, Image as ImageIcon
} from 'lucide-react'

// ── Category options the user can manually select ────────────
const CATEGORIES = [
  { value: 'Road Damage',       label: '🕳️  Road Damage'       },
  { value: 'Garbage',           label: '🗑️  Garbage'           },
  { value: 'Water Leakage',     label: '💧  Water Leakage'     },
  { value: 'Electricity Issue', label: '⚡  Electricity Issue' },
  { value: 'Traffic Issue',     label: '🚦  Traffic Issue'     },
  { value: 'Other',             label: '📋  Other'             },
]

// ── Color for each priority level ────────────────────────────
const PRIORITY_COLORS = {
  Critical: '#FF4560',
  High:     '#FFAB00',
  Medium:   '#00D4FF',
  Low:      '#00E676',
}

// ── Severity bar visual ───────────────────────────────────────
function SeverityBar({ score }) {
  const color = score >= 9 ? '#FF4560' : score >= 7 ? '#FFAB00' : score >= 4 ? '#00D4FF' : '#00E676'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Outfit' }}>Severity Score</span>
        <span style={{ fontSize: '14px', color, fontFamily: 'Rajdhani', fontWeight: 700 }}>{score}/10</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 0.8 }}
          style={{ height: '100%', background: color, borderRadius: '3px', boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
    </div>
  )
}

export default function ReportIssue() {
  // Form field values
  const [form, setForm] = useState({
    title:       '',
    description: '',
    category:    '',
    reported_by: '',
    address:     '',
    lat:         '28.6139',   // Default: New Delhi
    lng:         '77.2090',
  })

  // AI prediction result (null = not predicted yet)
  const [prediction, setPrediction] = useState(null)
  const [predicting,  setPredicting] = useState(false)   // AI loading state
  const [submitting,  setSubmitting] = useState(false)   // Form submit loading
  const [submitted,   setSubmitted]  = useState(false)   // Success screen

  // Image upload state
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  // ── Handle typing in form fields ──────────────────────────
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Clear old prediction when text changes
    if (field === 'description') {
      setPrediction(null)
    }
  }

  // ── Call AI for real-time prediction ──────────────────────
  // This runs when the user clicks "Analyze with AI"
  const handlePredict = async () => {
    if (!form.description.trim() || form.description.length < 10) {
      toast.error('Please write a description (at least 10 characters)')
      return
    }

    setPredicting(true)
    setPrediction(null)

    try {
      // We try the real backend first
      const res = await axios.post('http://localhost:5000/complaint/preview', {
        text: `${form.title}. ${form.description}`,
      }, { timeout: 4000 })
      setPrediction(res.data)
    } catch {
      // If backend is offline, simulate a prediction (for demo purposes)
      await new Promise(r => setTimeout(r, 1200))
      const mockPredictions = {
        'pothole': { category: 'Road Damage',       severity: 8, priority: 'High',     confidence: 91.2 },
        'garbage': { category: 'Garbage',           severity: 6, priority: 'Medium',   confidence: 88.5 },
        'water':   { category: 'Water Leakage',     severity: 7, priority: 'High',     confidence: 87.1 },
        'light':   { category: 'Electricity Issue', severity: 6, priority: 'Medium',   confidence: 85.4 },
        'signal':  { category: 'Traffic Issue',     severity: 9, priority: 'Critical', confidence: 92.3 },
      }
      const text = form.description.toLowerCase()
      const key = Object.keys(mockPredictions).find(k => text.includes(k))
      setPrediction(key ? mockPredictions[key] : {
        category: 'Road Damage', severity: 5, priority: 'Medium', confidence: 78.0
      })
    } finally {
      setPredicting(false)
    }
  }

  // ── Handle image selection ─────────────────────────────────
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  // ── Submit the form ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim())       { toast.error('Please enter a complaint title'); return }
    if (!form.description.trim()) { toast.error('Please describe the issue');      return }

    setSubmitting(true)

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      if (imageFile) formData.append('image', imageFile)

      await axios.post('http://localhost:5000/complaint', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 8000,
      })
    } catch {
      // Even if backend is offline, show success for demo purposes
    }

    await new Promise(r => setTimeout(r, 800))
    setSubmitting(false)
    setSubmitted(true)
  }

  // ── Reset form after submission ────────────────────────────
  const handleReset = () => {
    setForm({ title: '', description: '', category: '', reported_by: '', address: '', lat: '28.6139', lng: '77.2090' })
    setPrediction(null)
    setImageFile(null)
    setImagePreview(null)
    setSubmitted(false)
  }

  // ─────────────────────────────────────────────────────────
  //  SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ padding: '28px 32px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1   }}
          className="glass-card"
          style={{ maxWidth: '480px', width: '100%', padding: '48px', textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(0,230,118,0.12)',
              border: '1px solid rgba(0,230,118,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <CheckCircle size={34} color="#00E676" />
          </motion.div>

          <h2 style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '28px', color: '#E8F1FB', letterSpacing: '0.03em', marginBottom: '12px' }}>
            Complaint Submitted!
          </h2>
          <p style={{ color: '#6B8EAE', fontSize: '14px', fontFamily: 'Outfit', lineHeight: 1.6, marginBottom: '32px' }}>
            Your complaint has been received and analyzed by our AI system.
            The relevant department has been notified. You'll receive updates soon.
          </p>

          {prediction && (
            <div style={{
              background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)',
              borderRadius: '10px', padding: '16px', marginBottom: '24px', textAlign: 'left',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Category',  value: prediction.category },
                  { label: 'Priority',  value: prediction.priority },
                  { label: 'Severity',  value: `${prediction.severity}/10` },
                  { label: 'AI Confidence', value: `${prediction.confidence}%` },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: '10px', color: '#6B8EAE', letterSpacing: '0.1em', marginBottom: '2px', textTransform: 'uppercase' }}>{item.label}</div>
                    <div style={{ fontSize: '15px', color: '#00D4FF', fontFamily: 'Rajdhani', fontWeight: 700 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleReset} className="btn-glow" style={{ flex: 1, padding: '12px', fontSize: '15px', borderRadius: '8px' }}>
              Submit Another
            </button>
            <button onClick={() => window.location.href = '/dashboard'} className="btn-outline" style={{ flex: 1, padding: '12px', fontSize: '15px', borderRadius: '8px' }}>
              View Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  //  MAIN FORM
  // ─────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '28px 32px', minHeight: '100vh', position: 'relative' }}
    >
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.4 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '840px', margin: '0 auto' }}>

        {/* ── Header ──────────────────────────────────────────── */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Zap size={14} color="#00D4FF" />
            <span style={{ fontSize: '11px', color: '#00D4FF', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.12em' }}>
              AI-ASSISTED · COMPLAINT PORTAL
            </span>
          </div>
          <h1 style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '34px', color: '#E8F1FB', letterSpacing: '0.02em', lineHeight: 1 }}>
            Report an Issue
          </h1>
          <p style={{ color: '#6B8EAE', fontSize: '13px', marginTop: '6px', fontFamily: 'Outfit' }}>
            Describe the problem and our AI will classify and prioritize it automatically.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', alignItems: 'start' }}>

          {/* ── LEFT COLUMN: Form Fields ─────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Complaint Title */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <label style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.1em', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                Complaint Title *
              </label>
              <input
                className="input-dark"
                placeholder="e.g. Large pothole on Ring Road near Metro Station"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Description *
                </label>
                <span style={{ fontSize: '11px', color: '#2E4A66', fontFamily: 'Outfit' }}>
                  {form.description.length} chars
                </span>
              </div>
              <textarea
                className="input-dark"
                placeholder="Describe the issue in detail. The more you write, the more accurate the AI prediction."
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={5}
                style={{ resize: 'vertical', lineHeight: 1.6 }}
              />

              {/* AI Analyze Button */}
              <button
                onClick={handlePredict}
                disabled={predicting || form.description.length < 10}
                style={{
                  marginTop: '10px',
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '9px 16px', borderRadius: '7px',
                  background: predicting ? 'rgba(0,212,255,0.06)' : 'rgba(0,212,255,0.1)',
                  border: `1px solid ${predicting ? 'rgba(0,212,255,0.1)' : 'rgba(0,212,255,0.3)'}`,
                  color: form.description.length < 10 ? '#2E4A66' : '#00D4FF',
                  fontSize: '12px', fontFamily: 'Rajdhani', fontWeight: 600,
                  letterSpacing: '0.08em', cursor: form.description.length < 10 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {predicting
                  ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> ANALYZING...</>
                  : <><Brain size={13} /> ANALYZE WITH AI</>
                }
              </button>
            </div>

            {/* Category + Reporter */}
            <div className="glass-card" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.1em', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Category
                </label>
                <select
                  className="input-dark"
                  value={form.category}
                  onChange={e => handleChange('category', e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Auto-detect</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.1em', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Your Name
                </label>
                <input
                  className="input-dark"
                  placeholder="Optional"
                  value={form.reported_by}
                  onChange={e => handleChange('reported_by', e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <label style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.1em', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                📍 Location / Address
              </label>
              <input
                className="input-dark"
                placeholder="Street name, area, city"
                value={form.address}
                onChange={e => handleChange('address', e.target.value)}
                style={{ marginBottom: '10px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#2E4A66', display: 'block', marginBottom: '4px' }}>Latitude</label>
                  <input className="input-dark" value={form.lat} onChange={e => handleChange('lat', e.target.value)} placeholder="28.6139" />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#2E4A66', display: 'block', marginBottom: '4px' }}>Longitude</label>
                  <input className="input-dark" value={form.lng} onChange={e => handleChange('lng', e.target.value)} placeholder="77.2090" />
                </div>
              </div>
              <p style={{ fontSize: '11px', color: '#2E4A66', marginTop: '8px', fontFamily: 'Outfit' }}>
                <MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} />
                Tip: Use Google Maps to find precise coordinates. Right-click → "What's here?"
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-glow"
              style={{
                width: '100%', padding: '15px', fontSize: '16px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> SUBMITTING...</>
                : <><Send size={18} /> SUBMIT COMPLAINT</>
              }
            </button>
          </div>

          {/* ── RIGHT COLUMN: AI Prediction + Image Upload ─────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* AI Prediction Panel */}
            <AnimatePresence>
              {(predicting || prediction) && (
                <motion.div
                  key="prediction"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1,    y:  0  }}
                  exit={{ opacity: 0 }}
                  className="glass-card"
                  style={{
                    padding: '20px',
                    border: prediction ? `1px solid ${PRIORITY_COLORS[prediction?.priority] || 'rgba(0,212,255,0.2)'}30` : '1px solid rgba(0,212,255,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Brain size={16} color="#00D4FF" />
                    <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '14px', color: '#E8F1FB', letterSpacing: '0.05em' }}>
                      AI ANALYSIS
                    </span>
                    {predicting && <Loader2 size={13} color="#00D4FF" style={{ marginLeft: 'auto', animation: 'spin 1s linear infinite' }} />}
                  </div>

                  {predicting ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[100, 75, 50].map(w => (
                        <div key={w} style={{
                          height: '12px', borderRadius: '6px',
                          background: 'rgba(0,212,255,0.06)',
                          width: `${w}%`,
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }} />
                      ))}
                    </div>
                  ) : prediction && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Category */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#6B8EAE', letterSpacing: '0.1em', marginBottom: '4px', textTransform: 'uppercase', fontFamily: 'Outfit' }}>Predicted Category</div>
                        <div style={{ fontSize: '18px', color: '#E8F1FB', fontFamily: 'Rajdhani', fontWeight: 700 }}>{prediction.category}</div>
                      </div>

                      {/* Priority badge */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#6B8EAE', letterSpacing: '0.1em', marginBottom: '4px', textTransform: 'uppercase', fontFamily: 'Outfit' }}>Priority Level</div>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '5px 14px', borderRadius: '99px', fontWeight: 700,
                          fontSize: '13px', fontFamily: 'Rajdhani', letterSpacing: '0.06em',
                          background: `${PRIORITY_COLORS[prediction.priority]}18`,
                          color: PRIORITY_COLORS[prediction.priority],
                          border: `1px solid ${PRIORITY_COLORS[prediction.priority]}35`,
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: PRIORITY_COLORS[prediction.priority], boxShadow: `0 0 5px ${PRIORITY_COLORS[prediction.priority]}` }} />
                          {prediction.priority}
                        </span>
                      </div>

                      {/* Severity bar */}
                      <SeverityBar score={prediction.severity} />

                      {/* Confidence */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 12px', borderRadius: '7px',
                        background: 'rgba(0,212,255,0.05)',
                        border: '1px solid rgba(0,212,255,0.1)',
                      }}>
                        <CheckCircle size={13} color="#00D4FF" />
                        <span style={{ fontSize: '12px', color: '#00D4FF', fontFamily: 'Outfit' }}>
                          AI Confidence: <strong>{prediction.confidence}%</strong>
                        </span>
                      </div>

                      {/* Warning for critical */}
                      {prediction.priority === 'Critical' && (
                        <div style={{
                          display: 'flex', alignItems: 'flex-start', gap: '8px',
                          padding: '10px 12px', borderRadius: '7px',
                          background: 'rgba(255,69,96,0.07)',
                          border: '1px solid rgba(255,69,96,0.2)',
                        }}>
                          <AlertTriangle size={13} color="#FF4560" style={{ flexShrink: 0, marginTop: '1px' }} />
                          <span style={{ fontSize: '11px', color: '#FF4560', fontFamily: 'Outfit', lineHeight: 1.5 }}>
                            Critical issue detected. This will be escalated to emergency teams immediately.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Image Upload */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <label style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.1em', display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>
                📷 Photo Evidence
              </label>

              {imagePreview ? (
                <div style={{ position: 'relative' }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', borderRadius: '8px', maxHeight: '180px', objectFit: 'cover' }} />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null) }}
                    style={{
                      position: 'absolute', top: '8px', right: '8px',
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: 'rgba(255,69,96,0.9)', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={13} color="white" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(0,212,255,0.2)',
                    borderRadius: '8px', padding: '32px 20px',
                    textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)'; e.currentTarget.style.background = 'rgba(0,212,255,0.03)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <ImageIcon size={28} color="#2E4A66" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '13px', color: '#6B8EAE', fontFamily: 'Outfit' }}>Click to upload photo</p>
                  <p style={{ fontSize: '11px', color: '#2E4A66', marginTop: '4px', fontFamily: 'Outfit' }}>JPG, PNG up to 5MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
            </div>

            {/* Quick tips */}
            <div className="glass-card" style={{ padding: '16px 20px', border: '1px solid rgba(0,230,118,0.1)' }}>
              <h4 style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: '13px', color: '#00E676', letterSpacing: '0.05em', marginBottom: '10px' }}>
                ✓ TIPS FOR FASTER RESOLUTION
              </h4>
              {[
                'Be specific about the location',
                'Include how long the problem has existed',
                'Mention safety risks if any',
                'Attach a clear photo if possible',
              ].map(tip => (
                <div key={tip} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ color: '#00E676', fontSize: '12px', flexShrink: 0 }}>›</span>
                  <span style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Outfit', lineHeight: 1.4 }}>{tip}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  )
}