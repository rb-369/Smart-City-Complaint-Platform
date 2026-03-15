// ComplaintTable.jsx — COMPLAINTS DATA TABLE
// ============================================
// Think of this as the "logbook" of our command center.
// Every complaint is listed here as a row, with color-coded
// priority and status badges so admins can quickly scan the situation.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ChevronUp, ChevronDown, Eye } from 'lucide-react'
import { CATEGORY_CONFIG } from '../data/mockData'

// ── Priority Badge ───────────────────────────────────────────
function PriorityBadge({ level }) {
  const map = {
    Critical: { bg: 'rgba(255,69,96,0.15)',  color: '#FF4560', dot: '#FF4560'  },
    High:     { bg: 'rgba(255,171,0,0.12)',  color: '#FFAB00', dot: '#FFAB00'  },
    Medium:   { bg: 'rgba(0,212,255,0.12)',  color: '#00D4FF', dot: '#00D4FF'  },
    Low:      { bg: 'rgba(0,230,118,0.12)',  color: '#00E676', dot: '#00E676'  },
  }
  const s = map[level] || map.Low
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '99px',
      background: s.bg, color: s.color,
      fontSize: '11px', fontWeight: 700,
      border: `1px solid ${s.color}35`,
      fontFamily: 'Outfit, sans-serif', letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.dot, boxShadow: `0 0 4px ${s.dot}` }} />
      {level}
    </span>
  )
}

// ── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    'Pending':     { bg: 'rgba(255,171,0,0.10)',  color: '#FFAB00' },
    'In Progress': { bg: 'rgba(0,212,255,0.10)',  color: '#00D4FF' },
    'Resolved':    { bg: 'rgba(0,230,118,0.10)',  color: '#00E676' },
  }
  const s = map[status] || map['Pending']
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '99px',
      background: s.bg, color: s.color,
      fontSize: '11px', fontWeight: 600,
      border: `1px solid ${s.color}30`,
      fontFamily: 'Outfit, sans-serif',
    }}>
      {status}
    </span>
  )
}

// ── Main Component ───────────────────────────────────────────
export default function ComplaintTable({ complaints = [] }) {
  // State for search text, filter, and sort
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('All')   // Priority filter
  const [sortKey,  setSortKey]  = useState('created_at')
  const [sortDir,  setSortDir]  = useState('desc')   // 'asc' or 'desc'

  // ── Filtering ────────────────────────────────────────────
  // First filter by priority, then by search text
  const filtered = complaints
    .filter(c => filter === 'All' || c.priority_level === filter)
    .filter(c => {
      const q = search.toLowerCase()
      return (
        c.title.toLowerCase().includes(q) ||
        c.ai_category.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
      )
    })

  // ── Sorting ──────────────────────────────────────────────
  const sorted = [...filtered].sort((a, b) => {
    let va = a[sortKey] ?? ''
    let vb = b[sortKey] ?? ''
    if (sortKey === 'severity_score') { va = Number(va); vb = Number(vb) }
    if (sortDir === 'asc') return va > vb ? 1 : -1
    return va < vb ? 1 : -1
  })

  // ── Sort toggle helper ───────────────────────────────────
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  // ── Sort icon helper ─────────────────────────────────────
  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronDown size={12} style={{ color: '#2E4A66' }} />
    return sortDir === 'asc'
      ? <ChevronUp   size={12} style={{ color: '#00D4FF' }} />
      : <ChevronDown size={12} style={{ color: '#00D4FF' }} />
  }

  // ── Header cell style ─────────────────────────────────────
  const th = (col) => ({
    padding:    '10px 16px',
    fontSize:   '11px',
    fontWeight: 600,
    color:      sortKey === col ? '#00D4FF' : '#6B8EAE',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor:     'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    display:    'flex',
    alignItems: 'center',
    gap:        '4px',
    transition: 'color 0.2s',
  })

  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>

      {/* ── Table Header: Title + Controls ─────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
        padding: '18px 20px 16px',
        borderBottom: '1px solid rgba(0,180,220,0.06)',
      }}>
        <div>
          <h3 style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '18px', color: '#E8F1FB', letterSpacing: '0.03em' }}>
            Active Complaints
          </h3>
          <p style={{ fontSize: '12px', color: '#6B8EAE', marginTop: '2px' }}>
            {sorted.length} of {complaints.length} entries
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{
              position: 'absolute', left: '10px', top: '50%',
              transform: 'translateY(-50%)', color: '#6B8EAE',
            }} />
            <input
              className="input-dark"
              placeholder="Search complaints..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '32px', width: '200px', height: '36px' }}
            />
          </div>

          {/* Priority filter pills */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(p => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                style={{
                  padding:      '5px 12px',
                  borderRadius: '99px',
                  border:       `1px solid ${filter === p ? 'rgba(0,212,255,0.4)' : 'rgba(0,180,220,0.1)'}`,
                  background:   filter === p ? 'rgba(0,212,255,0.1)' : 'transparent',
                  color:        filter === p ? '#00D4FF' : '#6B8EAE',
                  fontSize:     '11px',
                  fontWeight:   600,
                  cursor:       'pointer',
                  transition:   'all 0.2s',
                  fontFamily:   'Outfit, sans-serif',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,180,220,0.06)' }}>
              {[
                { key: 'id',             label: 'ID'       },
                { key: 'title',          label: 'Complaint' },
                { key: 'ai_category',    label: 'Category'  },
                { key: 'severity_score', label: 'Severity'  },
                { key: 'priority_level', label: 'Priority'  },
                { key: 'status',         label: 'Status'    },
                { key: 'created_at',     label: 'Date'      },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{ textAlign: 'left', background: 'transparent', border: 'none' }}
                >
                  <div style={th(col.key)}>
                    {col.label} <SortIcon col={col.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <AnimatePresence>
              {sorted.map((c, i) => {
                const catCfg = CATEGORY_CONFIG[c.ai_category] || {}
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      borderBottom: '1px solid rgba(0,180,220,0.04)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e  => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* ID */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', color: '#00D4FF', fontFamily: 'Rajdhani', fontWeight: 600 }}>
                        {c.id}
                      </span>
                    </td>

                    {/* Title */}
                    <td style={{ padding: '12px 16px', maxWidth: '240px' }}>
                      <div style={{ fontSize: '13px', color: '#E8F1FB', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B8EAE', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.location?.address}
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: catCfg.color || '#6B8EAE', whiteSpace: 'nowrap' }}>
                        <span>{catCfg.icon}</span> {c.ai_category}
                      </span>
                    </td>

                    {/* Severity bar */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontFamily: 'Rajdhani', fontWeight: 700, color: '#E8F1FB', width: '20px' }}>
                          {c.severity_score}
                        </span>
                        <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: '2px',
                            width: `${c.severity_score * 10}%`,
                            background: c.severity_score >= 9 ? '#FF4560' : c.severity_score >= 7 ? '#FFAB00' : '#00D4FF',
                          }} />
                        </div>
                      </div>
                    </td>

                    {/* Priority */}
                    <td style={{ padding: '12px 16px' }}>
                      <PriorityBadge level={c.priority_level} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Date */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', color: '#6B8EAE', whiteSpace: 'nowrap' }}>
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>

            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#2E4A66', fontSize: '14px' }}>
                  No complaints match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}