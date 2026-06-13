import { Link } from 'react-router-dom'

const features = [
  { icon: '⚡', title: 'Under 3 seconds', desc: 'Real-time verification via AI-powered OCR pipeline. No manual review, no delays.' },
  { icon: '🔒', title: 'Bank-grade security', desc: 'SHA-256 hashed API keys, encrypted storage, and full audit logs on every request.' },
  { icon: '🇮🇳', title: 'Built for India', desc: 'PAN, Aadhaar, GST certificates. NSDL and GSTN validated. RBI KYC compliant.' },
  { icon: '📊', title: 'Confidence scoring', desc: 'Every result comes with a 0–100% confidence score and structured flag data.' },
  { icon: '🔁', title: 'Webhook support', desc: 'Fire-and-forget with async webhooks. Get notified when verification completes.' },
  { icon: '🧩', title: 'API-first design', desc: 'RESTful JSON API. Integrate in minutes. SDKs for Python and Node coming soon.' },
]

const steps = [
  { num: '01', title: 'Get your API key', desc: 'Sign up and generate a key from your dashboard in under 60 seconds.' },
  { num: '02', title: 'Upload a document', desc: 'POST a PAN card or GST certificate image to our /v1/verify endpoint.' },
  { num: '03', title: 'Get verified data', desc: 'Receive structured JSON with extracted fields, confidence score, and flags.' },
]

const plans = [
  { name: 'Starter', price: '₹999', period: '/month', calls: '500 verifications', features: ['PAN + GST support', '₹12/extra call', 'Swagger docs', 'Email support'], cta: 'Start free trial', highlight: false },
  { name: 'Builder', price: '₹3,999', period: '/month', calls: '2,500 verifications', features: ['All document types', '₹8/extra call', 'Webhooks', 'Priority support', 'Usage analytics'], cta: 'Get started', highlight: true },
  { name: 'Team', price: '₹12,999', period: '/month', calls: 'Unlimited', features: ['Everything in Builder', 'White-label option', 'SLA guarantee', 'Dedicated support', 'Custom integrations'], cta: 'Contact sales', highlight: false },
]

const stats = [
  { value: '99.2%', label: 'Accuracy rate' },
  { value: '<2s', label: 'Avg response time' },
  { value: '75%', label: 'Cheaper than Signzy' },
  { value: '14K+', label: 'API calls/day free tier' },
]

export default function Landing() {
  return (
    <main>
      {/* Hero */}
      <section style={{ padding: '100px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse at center, #3b82f615 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div className="tag">Trusted by Indian fintechs 🇮🇳</div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Verify documents in{' '}
            <span style={{ color: '#3b82f6' }}>3 seconds</span>,<br />not 3 days
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}>
            AI-powered PAN, Aadhaar, and GST verification API for Indian fintechs. 75% cheaper than Signzy. No enterprise contract required.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <Link to="/signup" className="btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
              Start for free
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
            <Link to="/docs" className="btn-secondary" style={{ fontSize: 15, padding: '12px 28px' }}>View API docs</Link>
          </div>
          <p style={{ fontSize: 13, color: '#475569' }}>No credit card required · Free 500 verifications · Cancel anytime</p>
        </div>
      </section>

      {/* Code preview */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ background: '#161b22', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #21262d' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
              <span style={{ fontSize: 12, color: '#8b949e', marginLeft: 8 }}>verify_pan.py</span>
            </div>
            <pre style={{ padding: '24px', fontSize: 13, lineHeight: 1.8, overflowX: 'auto', color: '#e6edf3', margin: 0, fontFamily: "'Fira Code', 'Courier New', monospace" }}><code>{`import requests

response = requests.post(
    "https://api.veridoc.ai/v1/verify",
    headers={"Authorization": "Bearer vd_live_..."},
    data={"document_type": "PAN"},
    files={"file": open("pan_card.jpg", "rb")}
)

result = response.json()
# {
#   "status": "verified",
#   "confidence_score": 0.97,
#   "extracted_fields": {
#     "pan_number": "ABCDE1234F",
#     "name": "RAHUL SHARMA",
#     "date_of_birth": "15/03/1995"
#   },
#   "flags": [],
#   "processing_time_ms": 847
# }`}</code></pre>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="grid-4">
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '24px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#3b82f6', marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ padding: '80px 24px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="tag">Features</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.01em' }}>Everything you need to verify documents</h2>
            <p style={{ color: '#94a3b8', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>One API, all the document types your compliance team needs.</p>
          </div>
          <div className="grid-3">
            {features.map(f => (
              <div key={f.title} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '24px' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 24px', background: '#0d1117' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="tag">How it works</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.01em' }}>Integrate in minutes</h2>
          </div>
          <div className="grid-3">
            {steps.map((s, i) => (
              <div key={s.num} style={{ position: 'relative' }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: '#1e293b', marginBottom: 12, fontVariantNumeric: 'tabular-nums' }}>{s.num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{s.desc}</p>
                {i < 2 && <div style={{ position: 'absolute', top: 24, right: -12, color: '#1e293b', fontSize: 24 }} className="hide-mobile">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 24px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="tag">Pricing</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.01em' }}>Simple, transparent pricing</h2>
            <p style={{ color: '#94a3b8', fontSize: 16 }}>75–80% cheaper than enterprise KYC providers. No minimums.</p>
          </div>
          <div className="grid-3" style={{ alignItems: 'start' }}>
            {plans.map(p => (
              <div key={p.name} style={{
                background: p.highlight ? '#0f172a' : '#0a0f1e',
                border: p.highlight ? '1px solid #3b82f6' : '1px solid #1e293b',
                borderRadius: 16, padding: '32px 28px',
                position: 'relative', overflow: 'hidden'
              }}>
                {p.highlight && (
                  <div style={{ position: 'absolute', top: 16, right: 16 }}>
                    <span className="badge badge-blue" style={{ fontSize: 11 }}>Most popular</span>
                  </div>
                )}
                <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' }}>{p.price}</span>
                  <span style={{ color: '#64748b', fontSize: 14 }}>{p.period}</span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>{p.calls} included</div>
                <div style={{ borderTop: '1px solid #1e293b', paddingTop: 20, marginBottom: 24 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      <span style={{ fontSize: 14, color: '#94a3b8' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link to="/signup" className={p.highlight ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 20, padding: '56px 40px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.01em' }}>Ready to automate KYC?</h2>
          <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 32, lineHeight: 1.7 }}>Join Indian fintechs already using VeriDoc to verify documents in seconds, not days.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn-primary" style={{ fontSize: 15, padding: '12px 32px' }}>Start for free</Link>
            <Link to="/docs" className="btn-secondary" style={{ fontSize: 15, padding: '12px 32px' }}>Read the docs</Link>
          </div>
        </div>
      </section>
    </main>
  )
}