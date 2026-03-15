// MapView.jsx — INTERACTIVE CITY HEATMAP
// Fetches live complaints from MongoDB via the backend API

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import { Map, Filter, X, Layers, Loader2 } from 'lucide-react'
import axios from 'axios'
import { MOCK_COMPLAINTS, CATEGORY_CONFIG, PRIORITY_COLORS } from '../data/mockData'

// Fix Leaflet default icon paths (required in Vite)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Create a colored drop-pin marker for each priority level
const createMarkerIcon = (color, size = 14) => L.divIcon({
  className: '',
  html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 12px ${color}90,0 0 4px ${color};position:relative;">
    <div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid ${color};"></div>
  </div>`,
  iconSize:    [size, size + 8],
  iconAnchor:  [size / 2, size + 8],
  popupAnchor: [0, -(size + 8)],
})

const ICONS = {
  Critical: createMarkerIcon('#FF4560', 16),
  High:     createMarkerIcon('#FFAB00', 14),
  Medium:   createMarkerIcon('#00D4FF', 12),
  Low:      createMarkerIcon('#00E676', 11),
}

// Small stat row used in the right sidebar
function MapStat({ label, value, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 12px', borderRadius: '8px',
      background: `${color}0D`, border: `1px solid ${color}22`, marginBottom: '6px',
    }}>
      <span style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Outfit' }}>{label}</span>
      <span style={{ fontSize: '14px', color, fontFamily: 'Rajdhani', fontWeight: 700 }}>{value}</span>
    </div>
  )
}

// Content shown inside each map marker's popup
function PopupContent({ c }) {
  const color = PRIORITY_COLORS[c.priority_level] || '#00D4FF'
  return (
    <div style={{ fontFamily: 'Outfit', minWidth: '220px', padding: '4px 2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '16px' }}>{CATEGORY_CONFIG[c.ai_category]?.icon || '📋'}</span>
        <div>
          <div style={{ fontSize: '13px', fontFamily: 'Rajdhani', fontWeight: 700, color: '#E8F1FB', lineHeight: 1.2 }}>{c.title}</div>
          <div style={{ fontSize: '11px', color: '#6B8EAE', marginTop: '2px' }}>{c.id}</div>
        </div>
      </div>
      <p style={{ fontSize: '12px', color: '#6B8EAE', lineHeight: 1.5, marginBottom: '10px' }}>
        {c.description?.substring(0, 100)}{c.description?.length > 100 ? '...' : ''}
      </p>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: 'Rajdhani' }}>
          {c.priority_level}
        </span>
        <span style={{ fontSize: '12px', color: '#6B8EAE' }}>
          Severity: <strong style={{ color: '#E8F1FB' }}>{c.severity_score}/10</strong>
        </span>
      </div>
      <div style={{ borderTop: '1px solid rgba(0,212,255,0.1)', paddingTop: '8px' }}>
        <div style={{ fontSize: '11px', color: '#6B8EAE', marginBottom: '3px' }}>📍 {c.location?.address}</div>
        <div style={{ fontSize: '11px', color: '#6B8EAE' }}>
          Status: <span style={{ color: c.status === 'Resolved' ? '#00E676' : c.status === 'In Progress' ? '#00D4FF' : '#FFAB00', fontWeight: 600 }}>{c.status}</span>
        </div>
      </div>
    </div>
  )
}

export default function MapView() {
  const [complaints,        setComplaints]        = useState([])
  const [loading,           setLoading]           = useState(true)
  const [selectedCategory,  setSelectedCategory]  = useState('All')
  const [selectedPriority,  setSelectedPriority]  = useState('All')
  const [showHeatzone,      setShowHeatzone]      = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  // Fetch all complaints from MongoDB on page load
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('http://localhost:5000/complaints')
        setComplaints(res.data.complaints)
      } catch {
        console.warn('API unavailable — using mock data')
        setComplaints(MOCK_COMPLAINTS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Apply category + priority filters
  const filtered = useMemo(() => complaints.filter(c => {
    const catOk = selectedCategory === 'All' || c.ai_category === selectedCategory
    const priOk = selectedPriority === 'All' || c.priority_level === selectedPriority
    return catOk && priOk
  }), [complaints, selectedCategory, selectedPriority])

  // Count per priority for the sidebar stats
  const counts = useMemo(() => ({
    Critical: complaints.filter(c => c.priority_level === 'Critical').length,
    High:     complaints.filter(c => c.priority_level === 'High').length,
    Medium:   complaints.filter(c => c.priority_level === 'Medium').length,
    Low:      complaints.filter(c => c.priority_level === 'Low').length,
  }), [complaints])

  const categories = ['All', ...Object.keys(CATEGORY_CONFIG)]
  const priorities = ['All', 'Critical', 'High', 'Medium', 'Low']

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <Loader2 size={36} color="#00D4FF" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6B8EAE', fontFamily: 'Outfit', fontSize: '14px' }}>Loading map data from MongoDB...</p>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '28px 32px', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Map size={14} color="#00D4FF" />
          <span style={{ fontSize: '11px', color: '#00D4FF', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.12em' }}>LIVE · CITY INTELLIGENCE MAP</span>
        </div>
        <h1 style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '34px', color: '#E8F1FB', letterSpacing: '0.02em', lineHeight: 1 }}>City Heatmap</h1>
        <p style={{ color: '#6B8EAE', fontSize: '13px', marginTop: '6px', fontFamily: 'Outfit' }}>
          {complaints.length} complaints loaded from MongoDB · Click any marker for details
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', alignItems: 'start' }}>

        {/* Left: Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Filter toolbar */}
          <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Filter size={13} color="#6B8EAE" />
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="input-dark"
              style={{ width: 'auto', height: '32px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? '📋 All Categories' : `${CATEGORY_CONFIG[c]?.icon} ${c}`}</option>)}
            </select>
            <select value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)} className="input-dark"
              style={{ width: 'auto', height: '32px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>
              {priorities.map(p => <option key={p} value={p}>{p === 'All' ? '🎯 All Priorities' : p}</option>)}
            </select>
            <button onClick={() => setShowHeatzone(h => !h)} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px',
              borderRadius: '6px', cursor: 'pointer',
              background: showHeatzone ? 'rgba(123,97,255,0.12)' : 'transparent',
              border: `1px solid ${showHeatzone ? 'rgba(123,97,255,0.35)' : 'rgba(0,180,220,0.1)'}`,
              color: showHeatzone ? '#7B61FF' : '#6B8EAE',
              fontSize: '11px', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.06em',
            }}>
              <Layers size={12} /> {showHeatzone ? 'HIDE' : 'SHOW'} DENSITY
            </button>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="live-dot" />
              <span style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Outfit' }}>
                Showing <strong style={{ color: '#E8F1FB' }}>{filtered.length}</strong> complaints
              </span>
            </div>
          </div>

          {/* Leaflet Map */}
          <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(0,212,255,0.1)', height: '540px' }}>
            <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              {/* Dark CartoDB tile layer to match our theme */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OSM &copy; CARTO'
                maxZoom={19}
              />
              <ZoomControl position="bottomright" />

              {/* Transparent circles overlapping = density heat effect */}
              {showHeatzone && filtered.map(c => (
                <CircleMarker key={`heat-${c.id || c._id}`}
                  center={[c.location?.lat || 28.6139, c.location?.lng || 77.2090]}
                  radius={35}
                  pathOptions={{ color: 'transparent', fillColor: PRIORITY_COLORS[c.priority_level] || '#00D4FF', fillOpacity: 0.05 }}
                />
              ))}

              {/* Colored pins per complaint */}
              {filtered.map(c => (
                <Marker key={c.id || c._id}
                  position={[c.location?.lat || 28.6139, c.location?.lng || 77.2090]}
                  icon={ICONS[c.priority_level] || ICONS.Medium}
                  eventHandlers={{ click: () => setSelectedComplaint(c) }}
                >
                  <Popup maxWidth={260}><PopupContent c={c} /></Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#6B8EAE', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.1em' }}>LEGEND:</span>
            {[['Critical','#FF4560'],['High','#FFAB00'],['Medium','#00D4FF'],['Low','#00E676']].map(([l,c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}80` }} />
                <span style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Outfit' }}>{l}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(123,97,255,0.3)', border: '1px solid rgba(123,97,255,0.3)' }} />
              <span style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Outfit' }}>Density Zone</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Priority counts */}
          <div className="glass-card" style={{ padding: '18px' }}>
            <h3 style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '15px', color: '#E8F1FB', letterSpacing: '0.05em', marginBottom: '14px' }}>PRIORITY BREAKDOWN</h3>
            <MapStat label="🔴 Critical" value={counts.Critical} color="#FF4560" />
            <MapStat label="🟡 High"     value={counts.High}     color="#FFAB00" />
            <MapStat label="🔵 Medium"   value={counts.Medium}   color="#00D4FF" />
            <MapStat label="🟢 Low"      value={counts.Low}      color="#00E676" />
          </div>

          {/* Category progress bars */}
          <div className="glass-card" style={{ padding: '18px' }}>
            <h3 style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '15px', color: '#E8F1FB', letterSpacing: '0.05em', marginBottom: '14px' }}>BY CATEGORY</h3>
            {Object.entries(CATEGORY_CONFIG).map(([name, cfg]) => {
              const count = complaints.filter(c => c.ai_category === name).length
              const pct   = complaints.length > 0 ? (count / complaints.length) * 100 : 0
              return (
                <div key={name} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Outfit' }}>{cfg.icon} {name}</span>
                    <span style={{ fontSize: '12px', color: '#E8F1FB', fontFamily: 'Rajdhani', fontWeight: 600 }}>{count}</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.3 }}
                      style={{ height: '100%', background: cfg.color, borderRadius: '2px' }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Scrollable complaint list */}
          <div className="glass-card" style={{ padding: '18px' }}>
            <h3 style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '15px', color: '#E8F1FB', letterSpacing: '0.05em', marginBottom: '14px' }}>COMPLAINT LIST</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map(c => {
                const color = PRIORITY_COLORS[c.priority_level]
                const isSelected = selectedComplaint?.id === c.id
                return (
                  <div key={c.id || c._id} onClick={() => setSelectedComplaint(c)} style={{
                    padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                    background: isSelected ? `${color}12` : 'rgba(0,0,0,0.2)',
                    border: `1px solid ${isSelected ? `${color}35` : 'rgba(0,180,220,0.06)'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#6B8EAE', fontFamily: 'Outfit' }}>{CATEGORY_CONFIG[c.ai_category]?.icon} {c.ai_category}</span>
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '99px', background: `${color}18`, color, fontWeight: 700, fontFamily: 'Rajdhani' }}>{c.priority_level}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#E8F1FB', fontFamily: 'Outfit', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                    <div style={{ fontSize: '11px', color: '#2E4A66', marginTop: '3px' }}>📍 {c.location?.address}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected complaint bottom bar */}
      <AnimatePresence>
        {selectedComplaint && (
          <motion.div key="detail" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: 'calc(100% - 340px)', maxWidth: '760px' }}>
            <div className="glass-card" style={{
              padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px',
              borderColor: `${PRIORITY_COLORS[selectedComplaint.priority_level]}35`,
              boxShadow: `0 0 30px ${PRIORITY_COLORS[selectedComplaint.priority_level]}20, 0 8px 32px rgba(0,0,0,0.5)`,
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: `${PRIORITY_COLORS[selectedComplaint.priority_level]}15`, border: `1px solid ${PRIORITY_COLORS[selectedComplaint.priority_level]}30` }}>
                {CATEGORY_CONFIG[selectedComplaint.ai_category]?.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '16px', fontFamily: 'Rajdhani', fontWeight: 700, color: '#E8F1FB' }}>{selectedComplaint.title}</span>
                  <span style={{ padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, fontFamily: 'Rajdhani', letterSpacing: '0.06em', background: `${PRIORITY_COLORS[selectedComplaint.priority_level]}18`, color: PRIORITY_COLORS[selectedComplaint.priority_level], border: `1px solid ${PRIORITY_COLORS[selectedComplaint.priority_level]}30` }}>
                    {selectedComplaint.priority_level}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Outfit' }}>
                  📍 {selectedComplaint.location?.address} &nbsp;·&nbsp;
                  Severity: {selectedComplaint.severity_score}/10 &nbsp;·&nbsp;
                  Status: <span style={{ color: selectedComplaint.status === 'Resolved' ? '#00E676' : '#FFAB00', fontWeight: 600 }}>{selectedComplaint.status}</span>
                </div>
              </div>
              <button onClick={() => setSelectedComplaint(null)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <X size={14} color="#6B8EAE" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}