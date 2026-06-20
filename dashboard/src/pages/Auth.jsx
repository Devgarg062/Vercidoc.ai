import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API_URL = 'https://vercidocai-production.up.railway.app'

export default function Auth({ mode }) {
  const [step, setStep] = useState('form') // form | otp
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()
  const isLogin = mode === 'login'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/v1/auth/login`, { email, password })
        login(res.data.token, res.data.user)
        navigate('/dashboard')
      } else {
        await axios.post(`${API_URL}/v1/auth/signup`, {
          email, password, full_name: name, company_name: company
        })
        setStep('otp')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await axios.post(`${API_URL}/v1/auth/verify-otp`, { email, code: otp })
      login(res.data.token, res.data.user)
      // Show the API key once
      sessionStorage.setItem('veridoc_new_key', res.data.api_key)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
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

          {step === 'form' ? (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
              <p style={{ color: '#64748b', fontSize: 14 }}>{isLogin ? 'Sign in to your dashboard' : 'Start verifying documents in minutes'}</p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Check your email</h1>
              <p style={{ color: '#64748b', fontSize: 14 }}>We sent a 6-digit code to <span style={{ color: '#f8fafc' }}>{email}</span></p>
            </>
          )}
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '32px 28px' }}>

          {error && (
            <div style={{ background: '#2d0a0a', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#f87171', fontSize: 13 }}>
              {error}
            </div>
          )}

          {step === 'form' ? (
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
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 15 }}>
                {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Create account')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: 24 }}>
                <label className="label">Verification code</label>
                <input
                  className="input"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  style={{ fontSize: 20, textAlign: 'center', letterSpacing: 6, fontFamily: 'monospace' }}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 15 }}>
                {loading ? 'Verifying...' : 'Verify email'}
              </button>
            </form>
          )}
        </div>

        {step === 'form' && (
          <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 20 }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link to={isLogin ? '/signup' : '/login'} style={{ color: '#3b82f6' }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}