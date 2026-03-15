// Landing.jsx — HERO LANDING PAGE
// ==================================
// This is the FIRST thing a user sees when they visit the website.
// It should answer: "What is this? Why should I use it? How do I start?"
//
// Think of it as the lobby of a very fancy skyscraper —
// it needs to immediately impress and guide visitors forward.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Zap, Map, BarChart3, Shield,
  Activity, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react'

// ── Animated number counter hook ─────────────────────────────
function useCounter(target, duration = 2000, delay = 0) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now()
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1)
        const e = 1 - Math.pow(1 - p, 3)   // easeOutCubic
        setCount(Math.round(target * e))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [target, duration, delay])
  return count
}

// ── Feature card data ─────────────────────────────────────────
const FEATURES = [
  {
    icon: Zap,
    color: '#00D4FF',
    bg: 'rgba(0,212,255,0.08)',
    title: 'AI Classification',
    desc: 'Natural language processing instantly categorizes every complaint with 94%+ accuracy and assigns severity scores.',
  },
  {
    icon: Map,
    color: '#7B61FF',
    bg: 'rgba(123,97,255,0.08)',
    title: 'Live City Heatmap',
    desc: 'Real-time interactive map overlays complaint density across the city, helping authorities spot problem zones instantly.',
  },
  {
    icon: BarChart3,
    color: '#00E676',
    bg: 'rgba(0,230,118,0.08)',
    title: 'Analytics Dashboard',
    desc: 'Comprehensive charts and KPIs give city officials a complete operational picture at a glance.',
  },
  {
    icon: Shield,
    color: '#FFAB00',
    bg: 'rgba(255,171,0,0.08)',
    title: 'Priority Routing',
    desc: 'Critical infrastructure failures are automatically escalated to the right departments within seconds.',
  },
]

// ── Recent activity ticker ────────────────────────────────────
const ACTIVITY = [
  { type: 'critical', icon: AlertTriangle, color: '#FF4560', text: 'Critical: Fallen live wire on Karol Bagh — AI flagged in 0.3s' },
  { type: 'resolved', icon: CheckCircle2, color: '#00E676',  text: 'Resolved: MG Road water burst — 4 hrs after reporting' },
  { type: 'new',      icon: Activity,     color: '#00D4FF',  text: 'New: Pothole cluster reported in Dwarka Sector 10' },
  { type: 'progress', icon: Clock,        color: '#FFAB00',  text: 'In Progress: ITO traffic signal failure — repair team dispatched' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [activeActivity, setActiveActivity] = useState(0)

  // Cycle through activity feed every 3 seconds
  useEffect(() => {
    const id = setInterval(() => setActiveActivity(a => (a + 1) % ACTIVITY.length), 3000)
    return () => clearInterval(id)
  }, [])

  // Animated counters
  const complaints  = useCounter(2847, 2000, 400)
  const resolved    = useCounter(94,   1800, 600)   // percentage
  const cities      = useCounter(12,   1500, 800)
  const responseTime = useCounter(4,   1200, 1000)  // hours

  return (
    <div style={{
      minHeight:  '100vh',
      background: '#020B18',
      position:   'relative',
      overflow:   'hidden',
    }}>
      {/* ── Background: animated grid + radial glows ─────────── */}
      <div style={{
        position:        'absolute',
        inset:           0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize:  '44px 44px',
        pointerEvents:   'none',
      }} />

      {/* Large radial glow top-left */}
      <div style={{
        position:  'absolute',
        top:       '-200px',
        left:      '-200px',
        width:     '700px',
        height:    '700px',
        background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Medium radial glow bottom-right */}
      <div style={{
        position:  'absolute',
        bottom:    '-100px',
        right:     '-100px',
        width:     '500px',
        height:    '500px',
        background: 'radial-gradient(circle, rgba(123,97,255,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Scanline sweep */}
      <div className="scanline-effect" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* ── Navigation Bar ────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y:   0  }}
        transition={{ duration: 0.6 }}
        style={{
          position:      'relative',
          zIndex:         10,
          display:       'flex',
          alignItems:    'center',
          justifyContent: 'space-between',
          padding:       '20px 60px',
          borderBottom:  '1px solid rgba(0,212,255,0.06)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #00D4FF, #00A8CC)',
            borderRadius: '9px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px rgba(0,212,255,0.4)',
          }}>
            <Zap size={18} color="#020B18" strokeWidth={2.5} />
          </div>
          <div>
            <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '22px', color: '#E8F1FB', letterSpacing: '0.04em' }}>
              CIVIC<span style={{ color: '#00D4FF' }}>AI</span>
            </span>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '32px' }}>
          {['Platform', 'How It Works', 'Cities', 'Contact'].map(link => (
            <a key={link} href="#" style={{
              color: '#6B8EAE', fontSize: '14px', fontFamily: 'Outfit', fontWeight: 500,
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = '#E8F1FB'}
              onMouseLeave={e => e.target.style.color = '#6B8EAE'}
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-glow"
          style={{ padding: '10px 22px', fontSize: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          Launch Dashboard <ArrowRight size={15} />
        </button>
      </motion.nav>

      {/* ── Hero Section ─────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: '1200px', margin: '0 auto',
        padding: '80px 60px 0',
        textAlign: 'center',
      }}>

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1   }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '99px',
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
            marginBottom: '28px',
          }}
        >
          <div className="live-dot" />
          <span style={{ fontSize: '12px', color: '#00D4FF', fontFamily: 'Outfit', fontWeight: 600, letterSpacing: '0.08em' }}>
            AI-POWERED SMART CITY PLATFORM · LIVE
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y:  0  }}
          transition={{ duration: 0.7, delay: 0.15 }}
          style={{
            fontFamily:    'Rajdhani, sans-serif',
            fontWeight:    700,
            fontSize:      'clamp(42px, 6vw, 80px)',
            lineHeight:    1.05,
            color:         '#E8F1FB',
            marginBottom:  '10px',
            letterSpacing: '-0.01em',
          }}
        >
          The City That
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #00D4FF 0%, #00E676 60%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Thinks For Itself
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y:  0  }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            fontSize: 'clamp(15px, 2vw, 19px)',
            color: '#6B8EAE',
            fontFamily: 'Outfit',
            fontWeight: 400,
            maxWidth: '620px',
            margin: '0 auto 40px',
            lineHeight: 1.65,
          }}
        >
          CivicAI uses machine learning to classify, prioritize, and route city
          complaints in real-time — turning civic chaos into intelligent action.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y:  0  }}
          transition={{ duration: 0.5, delay: 0.45 }}
          style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginBottom: '70px' }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-glow"
            style={{ padding: '14px 30px', fontSize: '16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            Open Command Center <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/report')}
            className="btn-outline"
            style={{ padding: '14px 30px', fontSize: '16px', borderRadius: '10px' }}
          >
            Report an Issue
          </button>
        </motion.div>

        {/* ── Stats Row ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y:  0  }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '80px',
          }}
        >
          {[
            { value: complaints,   suffix: '+', label: 'Complaints Processed', color: '#00D4FF' },
            { value: resolved,     suffix: '%', label: 'Resolution Rate',      color: '#00E676' },
            { value: cities,       suffix: '',  label: 'Cities Deployed',      color: '#7B61FF' },
            { value: responseTime, suffix: 'h', label: 'Avg Response Time',    color: '#FFAB00' },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '28px 20px',
              background: '#0A1628',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'Rajdhani', fontWeight: 700,
                fontSize: '42px', lineHeight: 1,
                color: stat.color,
                textShadow: `0 0 20px ${stat.color}50`,
                marginBottom: '8px',
              }}>
                {stat.value.toLocaleString()}{stat.suffix}
              </div>
              <div style={{ fontSize: '12px', color: '#6B8EAE', fontFamily: 'Outfit', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Feature Cards ─────────────────────────────────────── */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 60px 60px',
        position: 'relative', zIndex: 2,
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h2 style={{
            fontFamily: 'Rajdhani', fontWeight: 700,
            fontSize: '36px', color: '#E8F1FB',
            letterSpacing: '0.02em',
          }}>
            Built for Modern Cities
          </h2>
          <p style={{ color: '#6B8EAE', fontSize: '15px', marginTop: '8px', fontFamily: 'Outfit' }}>
            Four core modules that turn citizen complaints into resolved civic issues.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y:  0  }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="glass-card"
              style={{ padding: '28px', cursor: 'default' }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '12px',
                  background: f.bg, border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '19px', color: '#E8F1FB', marginBottom: '8px', letterSpacing: '0.02em' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6B8EAE', lineHeight: 1.65, fontFamily: 'Outfit' }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Live Activity Ticker ──────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 2,
        borderTop: '1px solid rgba(0,212,255,0.06)',
        borderBottom: '1px solid rgba(0,212,255,0.06)',
        padding: '16px 60px',
        background: 'rgba(0,212,255,0.02)',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        <span style={{
          fontSize: '10px', color: '#00D4FF', fontFamily: 'Rajdhani',
          fontWeight: 700, letterSpacing: '0.15em', whiteSpace: 'nowrap',
          border: '1px solid rgba(0,212,255,0.2)', padding: '4px 8px', borderRadius: '4px',
        }}>
          LIVE FEED
        </span>

        <motion.div
          key={activeActivity}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x:  0  }}
          exit={{ opacity: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          {(() => {
            const a = ACTIVITY[activeActivity]
            return (
              <>
                <a.icon size={14} color={a.color} />
                <span style={{ fontSize: '13px', color: '#6B8EAE', fontFamily: 'Outfit' }}>{a.text}</span>
              </>
            )
          })()}
        </motion.div>
      </div>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center', padding: '80px 60px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{
            fontFamily: 'Rajdhani', fontWeight: 700,
            fontSize: '44px', color: '#E8F1FB',
            letterSpacing: '0.02em', marginBottom: '16px',
          }}>
            Ready to Transform Your City?
          </h2>
          <p style={{ color: '#6B8EAE', fontSize: '16px', marginBottom: '36px', fontFamily: 'Outfit' }}>
            Start managing civic complaints intelligently today.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-glow"
            style={{ padding: '16px 40px', fontSize: '17px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
          >
            Enter Command Center <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>

    </div>
  )
}