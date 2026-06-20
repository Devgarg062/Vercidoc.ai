import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const isDash = loc.pathname === '/dashboard'
  const { isAuthenticated, logout, user } = useAuth()
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', padding: '0 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', height: 60, gap: 32 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#3b82f6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 16, color: '#f8fafc' }}>VeriDoc<span style={{ color: '#3b82f6' }}>.ai</span></span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }} className="hide-mobile">
          {[['/', 'Product'], ['/docs', 'Docs'], ['#pricing', 'Pricing']].map(([href, label]) => (
            <Link key={label} to={href} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 14, color: loc.pathname === href ? '#f8fafc' : '#94a3b8', background: loc.pathname === href ? '#1e293b' : 'transparent', transition: 'all 0.15s' }}>{label}</Link>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: 13, color: '#94a3b8' }} className="hide-mobile">{user?.email}</span>
              <button onClick={() => { logout(); window.location.href = '/' }} className="btn-ghost" style={{ fontSize: 14 }}>Sign out</button>
              {!isDash && (
                <Link to="/dashboard" className="btn-primary" style={{ fontSize: 14, padding: '8px 18px' }}>Dashboard</Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost hide-mobile" style={{ fontSize: 14 }}>Sign in</Link>
              <Link to="/signup" className="btn-primary" style={{ fontSize: 14, padding: '8px 18px' }}>Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}