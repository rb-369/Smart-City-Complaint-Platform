// Dashboard.jsx — ADMIN COMMAND CENTER
// Fetches live data from MongoDB via the backend API

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts'
import {
  FileText, Clock, Activity, CheckCircle,
  AlertTriangle, RefreshCw, Calendar, Loader2
} from 'lucide-react'
import StatCard from '../components/StatCard'
import ComplaintTable from '../components/ComplaintTable'
import { MOCK_COMPLAINTS, MOCK_ANALYTICS, CATEGORY_CONFIG } from '../data/mockData'

// Custom tooltip for the area chart
const AreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1E36', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '8px', padding: '10px 14px', fontFamily: 'Outfit' }}>
      <p style={{ color: '#6B8EAE', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: '#00D4FF', fontWeight: 700, fontSize: '16px', fontFamily: 'Rajdhani' }}>{payload[0]?.value} complaints</p>
    </div>
  )
}

// Custom tooltip for the pie chart
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1E36', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '8px', padding: '10px 14px', fontFamily: 'Outfit' }}>
      <p style={{ color: payload[0].payload.fill, fontWeight: 700, fontSize: '14px', fontFamily: 'Rajdhani' }}>{payload[0].name}</p>
      <p style={{ color: '#E8F1FB', fontSize: '13px' }}>{payload[0].value} complaints</p>
    </div>
  )
}

export default function Dashboard() {
  const [complaints,  setComplaints]  = useState([])
  const [analytics,   setAnalytics]   = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [refreshing,  setRefreshing]  = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Fetch live data from the MongoDB backend
  // Promise.all runs both requests in parallel (faster than one-by-one)
  const fetchData = async () => {
    try {
      const [cRes, aRes] = await Promise.all([
        axios.get('http://localhost:5000/complaints'),
        axios.get('http://localhost:5000/analytics'),
      ])
      setComplaints(cRes.data.complaints)
      setAnalytics(aRes.data)
      setError(null)
    } catch {
      // If backend is offline, fall back to mock data silently
      console.warn('API unavailable — using mock data')
      setComplaints(MOCK_COMPLAINTS)
      setAnalytics(MOCK_ANALYTICS)
      setError('Backend offline — showing demo data')
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }

  // Run once on page load
  useEffect(() => { fetchData() }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  // Loading spinner while fetching from MongoDB
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <Loader2 size={36} color="#00D4FF" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6B8EAE', fontFamily: 'Outfit', fontSize: '14px' }}>Loading from MongoDB...</p>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const stats   = analytics || MOCK_ANALYTICS
  const pieData = Object.entries(stats.byCategory || {}).map(([name, value]) => ({
    name, value,
    fill: CATEGORY_CONFIG[name]?.chartColor || '#6B8EAE',
  }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '28px 32px', minHeight: '100vh', position: 'relative' }}>
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.5 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── PAGE HEADER ──────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <div className="live-dot" />
              <span style={{ fontSize: '11px', color: '#00D4FF', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.12em' }}>
                LIVE · MONGODB
              </span>
            </div>
            <h1 style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '36px', color: '#E8F1FB', letterSpacing: '0.02em', lineHeight: 1 }}>
              City Operations
              <span style={{ marginLeft: '12px', fontSize: '14px', fontFamily: 'Outfit', fontWeight: 400, color: '#6B8EAE' }}>
                Dashboard
              </span>
            </h1>
            {error && (
              <p style={{ fontSize: '11px', color: '#FFAB00', marginTop: '4px', fontFamily: 'Outfit' }}>⚠️ {error}</p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} color="#6B8EAE" />
              <span style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Outfit' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <button onClick={handleRefresh} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px',
              background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
              color: '#00D4FF', fontSize: '12px', fontFamily: 'Rajdhani', fontWeight: 600,
              letterSpacing: '0.08em', cursor: 'pointer',
            }}>
              <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'REFRESHING...' : 'REFRESH DATA'}
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <StatCard label="Total Complaints" value={stats.total}    icon={FileText}    iconColor="#00D4FF" borderColor="#00D4FF" trend="+8%"  trendUp={true}  delay={0.05} />
          <StatCard label="Pending"          value={stats.pending}  icon={Clock}       iconColor="#FFAB00" borderColor="#FFAB00" trend="-3%"  trendUp={false} delay={0.12} />
          <StatCard label="In Progress"      value={stats.progress} icon={Activity}    iconColor="#7B61FF" borderColor="#7B61FF" trend="+15%" trendUp={true}  delay={0.19} />
          <StatCard label="Resolved"         value={stats.resolved} icon={CheckCircle} iconColor="#00E676" borderColor="#00E676" trend="+22%" trendUp={true}  delay={0.26} />
        </div>

        {/* ── CRITICAL ALERT BANNER ─────────────────────────── */}
        {stats.critical > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 18px', borderRadius: '10px', marginBottom: '20px',
              background: 'rgba(255,69,96,0.07)', border: '1px solid rgba(255,69,96,0.2)',
            }}
          >
            <AlertTriangle size={16} color="#FF4560" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#FF4560', fontFamily: 'Outfit', fontWeight: 500 }}>
              <strong>{stats.critical} Critical Complaints</strong> require immediate attention.
            </span>
          </motion.div>
        )}

        {/* ── CHARTS ROW ────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px', marginBottom: '20px' }}>

          {/* Area Chart: 7-day trend */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ padding: '22px 24px' }}>
            <h2 style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '18px', color: '#E8F1FB', letterSpacing: '0.03em', marginBottom: '4px' }}>
              Complaint Trend
            </h2>
            <p style={{ fontSize: '12px', color: '#6B8EAE', marginBottom: '16px' }}>New complaints — last 7 days</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.trend || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,220,0.07)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#6B8EAE', fontSize: 11, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B8EAE', fontSize: 11, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<AreaTooltip />} />
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00D4FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="count" stroke="#00D4FF" strokeWidth={2.5} fill="url(#areaGrad)"
                  dot={{ r: 4, fill: '#00D4FF', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#00D4FF' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Donut Chart: by category */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} style={{ padding: '22px 24px' }}>
            <h2 style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '18px', color: '#E8F1FB', letterSpacing: '0.03em', marginBottom: '4px' }}>
              By Category
            </h2>
            <p style={{ fontSize: '12px', color: '#6B8EAE', marginBottom: '8px' }}>AI-classified distribution</p>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={75} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.fill, flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: '#6B8EAE', fontFamily: 'Outfit' }}>
                      {CATEGORY_CONFIG[d.name]?.icon} {d.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#E8F1FB', fontFamily: 'Rajdhani', fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── PRIORITY BREAKDOWN BAR ────────────────────────── */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ padding: '18px 24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '16px', color: '#E8F1FB', letterSpacing: '0.03em' }}>
              Priority Breakdown
            </h2>
            <span style={{ fontSize: '11px', color: '#6B8EAE', fontFamily: 'Outfit' }}>Total: {stats.total}</span>
          </div>
          <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '2px', marginBottom: '12px' }}>
            {[
              { key: 'Critical', color: '#FF4560' },
              { key: 'High',     color: '#FFAB00' },
              { key: 'Medium',   color: '#00D4FF' },
              { key: 'Low',      color: '#00E676' },
            ].map(p => {
              const pct = stats.total > 0 ? ((stats.byPriority?.[p.key] || 0) / stats.total) * 100 : 0
              return (
                <motion.div key={p.key}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.6 }}
                  style={{ background: p.color, borderRadius: '2px', minWidth: pct > 0 ? '4px' : 0 }}
                />
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { key: 'Critical', color: '#FF4560' },
              { key: 'High',     color: '#FFAB00' },
              { key: 'Medium',   color: '#00D4FF' },
              { key: 'Low',      color: '#00E676' },
            ].map(p => (
              <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', background: p.color, borderRadius: '50%' }} />
                <span style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Outfit' }}>
                  {p.key}: <strong style={{ color: p.color }}>{stats.byPriority?.[p.key] || 0}</strong>
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── COMPLAINTS TABLE ──────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <ComplaintTable complaints={complaints} />
        </motion.div>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(0,180,220,0.06)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: '#2E4A66', fontFamily: 'Outfit' }}>CivicAI · MongoDB · TF-IDF + Logistic Regression</span>
          <span style={{ fontSize: '11px', color: '#2E4A66', fontFamily: 'Outfit' }}>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>

      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  )
}