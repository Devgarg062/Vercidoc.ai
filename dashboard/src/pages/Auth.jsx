import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Auth({ mode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const navigate = useNavigate()
  const isLogin = mode === 'login'

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0a0f1e' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, background: '#3b82f6', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 18 }}>VeriDoc<span style={{ color: '#3b82f6' }}>.ai</span></span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>{isLogin ? 'Sign in to your dashboard' : 'Start verifying documents in minutes'}</p>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '32px 28px' }}>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label className="label">Full name</label>
                  <input className="input" type="text" placeholder="Rahul Sharma" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="label">Company name</label>
                  <input className="input" type="text" placeholder="Acme Fintech Pvt Ltd" value={company} onChange={e => setCompany(e.target.value)} />
                </div>
              </>
            )}
            <div style={{ marginBottom: 16 }}>
              <label className="label">Work email</label>
              <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="label" style={{ margin: 0 }}>Password</label>
                {isLogin && <span style={{ fontSize: 13, color: '#3b82f6', cursor: 'pointer' }}>Forgot password?</span>}
              </div>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 15 }}>
              {isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {!isLogin && (
            <p style={{ fontSize: 12, color: '#475569', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
              By creating an account you agree to our <span style={{ color: '#3b82f6' }}>Terms of Service</span> and <span style={{ color: '#3b82f6' }}>Privacy Policy</span>.
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 20 }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link to={isLogin ? '/signup' : '/login'} style={{ color: '#3b82f6' }}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  )
}