import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0D1E36',
            color: '#E8F1FB',
            border: '1px solid rgba(0,212,255,0.2)',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00E676', secondary: '#020B18' } },
          error:   { iconTheme: { primary: '#FF4560', secondary: '#020B18' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)