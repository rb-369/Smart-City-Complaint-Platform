// App.jsx — The ROUTING HUB
// ============================
// Think of this as the "reception desk" of our app.
// When you visit a URL like /dashboard, this file decides
// WHICH page component to show you.
//
// We have two layouts:
//   1. Full-screen (no sidebar) → Landing page only
//   2. Main layout (with sidebar) → Dashboard, Map, ReportIssue

import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ReportIssue from './pages/ReportIssue'
import MapView from './pages/MapView'

// MainLayout wraps every "inside" page with the sidebar navigation
function MainLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020B18' }}>
      {/* Fixed left sidebar — always visible on inner pages */}
      <Sidebar />

      {/* Main content area — changes based on the current URL */}
      <main style={{
        flex: 1,
        marginLeft: '240px',          // Width of the sidebar
        minHeight: '100vh',
        overflow: 'auto',
        background: '#020B18',
      }}>
        {/* Outlet = "plug" where child route components render */}
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Landing page — full screen, no sidebar */}
        <Route path="/" element={<Landing />} />

        {/* Inner pages — all wrapped with the sidebar layout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report"    element={<ReportIssue />} />
          <Route path="/map"       element={<MapView />} />
        </Route>

        {/* Catch-all: unknown URLs redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}