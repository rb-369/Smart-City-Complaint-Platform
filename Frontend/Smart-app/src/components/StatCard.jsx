// StatCard.jsx — ANIMATED STATISTICS CARD
// ==========================================
// Think of this as a "speedometer" on a dashboard.
// It shows one key number (like "Total Complaints: 142")
// and the number counts UP from 0 when the page loads.
//
// HOW THE COUNTER ANIMATION WORKS:
//   - We use React's useEffect to run code "after the page loads"
//   - Every 16ms (60 frames per second) we add a small amount to the number
//   - When we reach the target number, we stop
//   - This creates a smooth counting animation

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({
  label,         // e.g. "Total Complaints"
  value,         // e.g. 142 (the number to count to)
  icon: Icon,    // Lucide icon component
  iconColor,     // e.g. "#00D4FF"
  iconBg,        // e.g. "rgba(0,212,255,0.1)"
  trend,         // e.g. "+12%" (optional trend text)
  trendUp,       // true = green arrow, false = red arrow
  borderColor,   // Left border accent color
  delay = 0,     // Animation delay (for staggered entry)
}) {
  // This is the number currently displayed (starts at 0, counts up to `value`)
  const [displayValue, setDisplayValue] = useState(0)
  const frameRef = useRef(null)     // Stores the animation frame ID so we can cancel it

  // useEffect runs AFTER the component appears on screen
  useEffect(() => {
    const duration = 1400  // Total animation time in ms (1.4 seconds)
    const start    = Date.now()
    const target   = typeof value === 'number' ? value : 0

    // This function runs every animation frame (~60 times per second)
    const tick = () => {
      const elapsed  = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)    // Goes from 0 to 1
      // easeOutQuart = fast start, slow end (feels natural)
      const eased    = 1 - Math.pow(1 - progress, 4)
      setDisplayValue(Math.round(target * eased))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)    // Continue animation
      }
    }

    // Delay the counter start (for staggered card entries)
    const timer = setTimeout(() => {
      frameRef.current = requestAnimationFrame(tick)
    }, delay * 1000)

    // Cleanup: stop animation if the component disappears
    return () => {
      clearTimeout(timer)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y:  0  }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      style={{
        background:   '#0A1628',
        border:       '1px solid rgba(0,180,220,0.08)',
        borderRadius: '14px',
        padding:      '22px 24px',
        position:     'relative',
        overflow:     'hidden',
        cursor:       'default',
        // Left border accent — the colored stripe on the left side
        borderLeft:   `3px solid ${borderColor || iconColor || '#00D4FF'}`,
        transition:   'box-shadow 0.25s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 0 24px rgba(0,0,0,0.4), 0 4px 20px ${iconColor}15`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* ── Subtle radial glow in top-right corner ─────────── */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '120px', height: '120px',
        background: `radial-gradient(circle at 100% 0%, ${iconColor}10 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* ── Top Row: label + icon ──────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        {/* Label */}
        <div style={{
          fontSize:     '11px',
          fontFamily:   'Outfit, sans-serif',
          fontWeight:   600,
          color:        '#6B8EAE',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          {label}
        </div>

        {/* Icon box */}
        <div style={{
          width:          '38px',
          height:         '38px',
          background:     iconBg || `${iconColor}15`,
          borderRadius:   '10px',
          border:         `1px solid ${iconColor}30`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
        }}>
          {Icon && <Icon size={18} color={iconColor || '#00D4FF'} />}
        </div>
      </div>

      {/* ── Main number (animated counter) ────────────────── */}
      <div style={{
        fontFamily:    'Rajdhani, sans-serif',
        fontWeight:    700,
        fontSize:      '38px',
        color:         '#E8F1FB',
        lineHeight:     1,
        letterSpacing: '-0.01em',
        marginBottom:  '10px',
      }}>
        {displayValue.toLocaleString()}
      </div>

      {/* ── Trend indicator ───────────────────────────────── */}
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {trendUp
            ? <TrendingUp  size={13} color="#00E676" />
            : <TrendingDown size={13} color="#FF4560" />
          }
          <span style={{
            fontSize: '12px',
            color:    trendUp ? '#00E676' : '#FF4560',
            fontWeight: 600,
          }}>
            {trend}
          </span>
          <span style={{ fontSize: '11px', color: '#2E4A66' }}>vs last week</span>
        </div>
      )}
    </motion.div>
  )
}