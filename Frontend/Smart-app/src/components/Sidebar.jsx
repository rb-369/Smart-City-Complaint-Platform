// Sidebar.jsx — NAVIGATION SIDEBAR
// ===================================
// Think of this as the "spine" of our dashboard.
// It sits on the left side and lets users jump between pages.
//
// HOW IT CONNECTS:
//   - It uses react-router-dom's NavLink to handle navigation.
//     NavLink automatically adds an "active" class when you're
//     on the matching page, so we know which item to highlight.

import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, PlusCircle, Map, LogOut,
  Zap, Bell, Shield, ChevronRight
} from 'lucide-react'

// Navigation items — add more here to create new pages
const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Command Center',  description: 'Analytics & stats'   },
  { path: '/report',    icon: PlusCircle,       label: 'Report Issue',    description: 'Submit complaint'    },
  { path: '/map',       icon: Map,              label: 'City Heatmap',    description: 'Interactive map'     },
]

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    // Fixed position = sidebar stays visible when you scroll
    <aside style={{
      position:    'fixed',
      top:          0,
      left:         0,
      width:        '240px',
      height:       '100vh',
      background:   'rgba(6, 14, 28, 0.97)',
      borderRight:  '1px solid rgba(0,212,255,0.08)',
      backdropFilter: 'blur(20px)',
      display:      'flex',
      flexDirection: 'column',
      zIndex:        100,
      overflowY:    'auto',
    }}>

      {/* ── Logo / Brand ────────────────────────────────────── */}
      <div style={{ padding: '28px 24px 20px' }}>
        {/* Animated logo mark */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y:   0  }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}
        >
          {/* Glowing hexagon logo */}
          <div style={{
            width:  '38px',
            height: '38px',
            background:   'linear-gradient(135deg, #00D4FF, #00A8CC)',
            borderRadius: '10px',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            boxShadow:    '0 0 20px rgba(0,212,255,0.4)',
            flexShrink:   0,
          }}>
            <Zap size={20} color="#020B18" strokeWidth={2.5} />
          </div>

          <div>
            <div style={{
              fontFamily:  'Rajdhani, sans-serif',
              fontWeight:  700,
              fontSize:    '20px',
              color:       '#E8F1FB',
              lineHeight:  1,
              letterSpacing: '0.04em',
            }}>CIVIC<span style={{ color: '#00D4FF' }}>AI</span></div>
            <div style={{ fontSize: '10px', color: '#6B8EAE', letterSpacing: '0.15em', marginTop: '2px' }}>
              SMART CITY
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, rgba(0,212,255,0.2), transparent)',
          marginTop: '20px',
        }} />
      </div>

      {/* ── Section Label ────────────────────────────────────── */}
      <div style={{ padding: '0 24px 10px' }}>
        <span style={{ fontSize: '10px', color: '#2E4A66', letterSpacing: '0.15em', fontWeight: 600 }}>
          NAVIGATION
        </span>
      </div>

      {/* ── Navigation Links ─────────────────────────────────── */}
      <nav style={{ padding: '0 12px', flex: 1 }}>
        {NAV_ITEMS.map((item, i) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x:   0  }}
            transition={{ delay: i * 0.08 + 0.1 }}
          >
            {/* NavLink knows when you're on this page and adds
                the "active" CSS class automatically */}
            <NavLink
              to={item.path}
              style={({ isActive }) => ({
                display:        'flex',
                alignItems:     'center',
                gap:            '12px',
                padding:        '11px 14px',
                borderRadius:   '10px',
                marginBottom:   '4px',
                textDecoration: 'none',
                transition:     'all 0.2s ease',
                position:       'relative',
                overflow:       'hidden',
                // Active page gets a glowing cyan style
                background:     isActive ? 'rgba(0,212,255,0.1)'  : 'transparent',
                border:         isActive ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
              })}
            >
              {/* Left glow bar — only visible on active item */}
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div style={{
                      position:   'absolute',
                      left:        0,
                      top:        '50%',
                      transform:  'translateY(-50%)',
                      width:      '3px',
                      height:     '60%',
                      background: '#00D4FF',
                      borderRadius: '0 2px 2px 0',
                      boxShadow:  '0 0 8px #00D4FF',
                    }} />
                  )}

                  {/* Icon */}
                  <item.icon
                    size={18}
                    style={{
                      color:      isActive ? '#00D4FF'  : '#6B8EAE',
                      flexShrink: 0,
                      transition: 'color 0.2s',
                    }}
                  />

                  {/* Label + description */}
                  <div>
                    <div style={{
                      fontFamily:  'Rajdhani, sans-serif',
                      fontWeight:  600,
                      fontSize:    '14px',
                      color:       isActive ? '#E8F1FB' : '#6B8EAE',
                      letterSpacing: '0.02em',
                      transition:  'color 0.2s',
                    }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '10px', color: '#2E4A66', marginTop: '1px' }}>
                      {item.description}
                    </div>
                  </div>

                  {/* Right arrow — only on active */}
                  {isActive && (
                    <ChevronRight
                      size={14}
                      style={{ marginLeft: 'auto', color: '#00D4FF', opacity: 0.6 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* ── System Status Panel ──────────────────────────────── */}
      <div style={{
        margin:   '16px 12px',
        padding:  '14px',
        background: 'rgba(0,212,255,0.05)',
        border:   '1px solid rgba(0,212,255,0.1)',
        borderRadius: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Shield size={14} color="#00D4FF" />
          <span style={{ fontSize: '11px', fontFamily: 'Rajdhani', fontWeight: 600, color: '#E8F1FB', letterSpacing: '0.1em' }}>
            SYSTEM STATUS
          </span>
        </div>

        {/* Individual status rows */}
        {[
          { label: 'AI Engine',  active: true },
          { label: 'API Server', active: true },
          { label: 'City Map',   active: true },
        ].map(s => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '6px',
          }}>
            <span style={{ fontSize: '11px', color: '#6B8EAE' }}>{s.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {/* Animated live dot */}
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: s.active ? '#00E676' : '#FF4560',
                boxShadow: s.active ? '0 0 6px #00E676' : '0 0 6px #FF4560',
              }} />
              <span style={{ fontSize: '10px', color: s.active ? '#00E676' : '#FF4560' }}>
                {s.active ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom: Alert + Back to Home ─────────────────────── */}
      <div style={{ padding: '0 12px 24px' }}>
        {/* Alert badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px',
          background: 'rgba(255,69,96,0.08)',
          border: '1px solid rgba(255,69,96,0.15)',
          borderRadius: '8px',
          marginBottom: '10px',
          cursor: 'pointer',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={14} color="#FF4560" />
            <span style={{ fontSize: '12px', color: '#FF4560', fontFamily: 'Rajdhani', fontWeight: 600 }}>
              3 Critical Alerts
            </span>
          </div>
          <div style={{
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#FF4560', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: 700,
          }}>3</div>
        </div>

        {/* Back to Landing */}
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: '8px',
            background: 'transparent', border: '1px solid rgba(107,142,174,0.2)',
            color: '#6B8EAE', cursor: 'pointer', fontSize: '12px',
            fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.05em',
            display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(107,142,174,0.4)'; e.currentTarget.style.color = '#E8F1FB' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(107,142,174,0.2)'; e.currentTarget.style.color = '#6B8EAE' }}
        >
          <LogOut size={14} />
          Back to Home
        </button>
      </div>

    </aside>
  )
}