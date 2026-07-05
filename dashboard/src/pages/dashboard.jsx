import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API_URL = 'https://vercidocai-production.up.railway.app'

export default function Dashboard() {
  const { token } = useAuth()
  const [welcomeKey, setWelcomeKey] = useState(sessionStorage.getItem('veridoc_new_key'))
  const [activeTab, setActiveTab] = useState('verify')
  const [file, setFile] = useState(null)
  const [docType, setDocType] = useState('PAN')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [keyName, setKeyName] = useState('')
  const [keyEmail, setKeyEmail] = useState('')
  const [generatedKey, setGeneratedKey] = useState(null)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState(null)
  const [usageData, setUsageData] = useState([])
  const [recentVerifications, setRecentVerifications] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }

    axios.get(`${API_URL}/v1/stats/overview`, { headers })
      .then(res => setStats(res.data))
      .catch(err => console.error('Stats error:', err))

    axios.get(`${API_URL}/v1/stats/usage-by-day`, { headers })
      .then(res => setUsageData(res.data.usage || []))
      .catch(err => console.error('Usage error:', err))

    axios.get(`${API_URL}/v1/stats/recent-verifications`, { headers })
      .then(res => setRecentVerifications(res.data.verifications || []))
      .catch(err => console.error('Recent error:', err))
      .finally(() => setStatsLoading(false))
  }, [token])

  const verify = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    const fd = new FormData()
    fd.append('document_type', docType)
    fd.append('file', file)
    try {
      const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
      const res = await axios.post(`${API_URL}/v1/verify`, fd, { headers })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const generateKey = async () => {
    try {
      const res = await axios.post(`${API_URL}/v1/keys?name=${keyName}&email=${keyEmail}`)
      setGeneratedKey(res.data)
    } catch { setError('Failed to generate key') }
  }

  const copyKey = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const conf = result ? Math.round(result.confidence_score * 100) : 0
  const confColor = conf >= 80 ? '#10b981' : conf >= 60 ? '#f59e0b' : '#ef4444'
  const statusColors = { verified: '#10b981', failed: '#ef4444', partial: '#f59e0b', processing: '#3b82f6' }

  const tabs = [
    { id: 'verify', label: 'Verify document', icon: '📄' },
    { id: 'keys', label: 'API keys', icon: '🔑' },
    { id: 'usage', label: 'Usage', icon: '📊' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Manage your verifications, API keys, and usage.</p>
        </div>

        {/* Welcome API key banner */}
        {welcomeKey && (
          <div style={{ background: '#042f2e', border: '1px solid #10b981', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <p style={{ fontSize: 14, color: '#10b981', fontWeight: 600, marginBottom: 8 }}>Welcome! Here's your API key — save it now</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <code style={{ flex: 1, fontSize: 12, background: '#0a0f1e', padding: '10px 14px', borderRadius: 6, wordBreak: 'break-all', color: '#e2e8f0' }}>{welcomeKey}</code>
              <button onClick={() => { navigator.clipboard.writeText(welcomeKey) }} className="btn-secondary" style={{ padding: '8px 12px', fontSize: 12 }}>Copy</button>
              <button onClick={() => { sessionStorage.removeItem('veridoc_new_key'); setWelcomeKey(null) }} className="btn-ghost" style={{ padding: '8px 12px', fontSize: 12 }}>Dismiss</button>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { label: 'Total verifications', value: stats ? stats.total_verifications : '—', change: stats ? `+${stats.verifications_today} today` : '' },
            { label: 'Success rate', value: stats ? `${stats.success_rate}%` : '—', change: 'last 30 days' },
            { label: 'Avg response time', value: stats ? `${stats.avg_response_time_seconds}s` : '—', change: 'per verification' },
            { label: 'Total API requests', value: stats ? stats.total_api_requests : '—', change: `${stats ? stats.active_api_keys : 0} active keys` },
          ].map(s => (
            <div key={s.label} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                {statsLoading ? <span style={{ color: '#334155' }}>...</span> : s.value}
              </div>
              <div style={{ fontSize: 12, color: '#475569' }}>{s.change}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 4, marginBottom: 24, width: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '8px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
              background: activeTab === t.id ? '#1e293b' : 'transparent',
              color: activeTab === t.id ? '#f8fafc' : '#64748b',
              transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Verify Tab */}
        {activeTab === 'verify' && (
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Upload document</h2>

              <div style={{ marginBottom: 16 }}>
                <label className="label">API Key <span style={{ color: '#475569' }}>(optional)</span></label>
                <input className="input" placeholder="vd_live_..." value={apiKey} onChange={e => setApiKey(e.target.value)} style={{ fontFamily: 'monospace', fontSize: 13 }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="label">Document type</label>
                <select className="input" value={docType} onChange={e => setDocType(e.target.value)}>
                  <option value="PAN">PAN Card</option>
                  <option value="GST_CERTIFICATE">GST Certificate</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="label">Document image</label>
                <div onClick={() => document.getElementById('dash-file').click()} style={{
                  border: `2px dashed ${file ? '#10b981' : '#1e293b'}`,
                  borderRadius: 8, padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                  background: file ? '#042f2e22' : 'transparent', transition: 'all 0.2s'
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{file ? '✅' : '📁'}</div>
                  <div style={{ fontSize: 13, color: file ? '#10b981' : '#64748b' }}>
                    {file ? file.name : 'Click to upload JPEG, PNG or PDF'}
                  </div>
                  {file && <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB</div>}
                </div>
                <input id="dash-file" type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
              </div>

              <button className="btn-primary" onClick={verify} disabled={!file || loading} style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
                {loading ? (
                  <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #ffffff44', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Analyzing...</>
                ) : 'Verify document'}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>

            {/* Result panel */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, minHeight: 400 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Result</h2>

              {!result && !error && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <p style={{ fontSize: 14 }}>Upload a document to see results</p>
                </div>
              )}

              {error && (
                <div style={{ background: '#2d0a0a', border: '1px solid #ef4444', borderRadius: 8, padding: 16, color: '#f87171', fontSize: 14 }}>
                  {typeof error === 'string' ? error : JSON.stringify(error)}
                </div>
              )}

              {result && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <span style={{ background: result.status === 'verified' ? '#042f2e' : '#2d0a0a', color: statusColors[result.status], border: `1px solid ${statusColors[result.status]}`, padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                      {result.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 13, color: '#475569' }}>{result.processing_time_ms}ms</span>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Confidence score</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: confColor }}>{conf}%</span>
                    </div>
                    <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${conf}%`, background: confColor, borderRadius: 3, transition: 'width 0.6s' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Extracted fields</p>
                    {Object.entries({
                      pan_number: 'PAN Number', name: 'Name', date_of_birth: 'Date of Birth',
                      father_name: "Father's Name", gstin: 'GSTIN', legal_name: 'Legal Name'
                    }).filter(([k]) => result.extracted_fields[k]).map(([k, label]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
                        <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, fontFamily: k === 'pan_number' || k === 'gstin' ? 'monospace' : 'inherit' }}>{result.extracted_fields[k]}</span>
                      </div>
                    ))}
                  </div>

                  {result.flags?.length > 0 && result.flags.map((f, i) => (
                    <div key={i} style={{ padding: '8px 12px', borderRadius: 6, marginBottom: 6, fontSize: 13, background: f.severity === 'error' ? '#2d0a0a' : '#2d1a00', color: f.severity === 'error' ? '#f87171' : '#fbbf24', borderLeft: `3px solid ${f.severity === 'error' ? '#ef4444' : '#f59e0b'}` }}>
                      {f.message}
                    </div>
                  ))}

                  <div style={{ marginTop: 16, padding: '10px 12px', background: '#0a0f1e', borderRadius: 6 }}>
                    <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>ID: {result.request_id}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'keys' && (
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Generate new API key</h2>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Key name</label>
                <input className="input" placeholder="Production key" value={keyName} onChange={e => setKeyName(e.target.value)} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@company.com" value={keyEmail} onChange={e => setKeyEmail(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={generateKey} disabled={!keyName || !keyEmail} style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
                Generate API key
              </button>

              {generatedKey && (
                <div style={{ marginTop: 20, background: '#042f2e', border: '1px solid #10b981', borderRadius: 8, padding: 16 }}>
                  <p style={{ fontSize: 13, color: '#10b981', fontWeight: 500, marginBottom: 10 }}>Key generated — save this now</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <code style={{ flex: 1, fontSize: 12, background: '#0a0f1e', padding: '8px 12px', borderRadius: 6, wordBreak: 'break-all', color: '#e2e8f0' }}>{generatedKey.api_key}</code>
                    <button onClick={() => copyKey(generatedKey.api_key)} className="btn-secondary" style={{ padding: '8px 12px', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>API key security</h2>
              {[
                { icon: '🔒', title: 'Keys are hashed', desc: 'We store SHA-256 hashes, never raw keys. Your key is shown once.' },
                { icon: '🚫', title: 'Instant revocation', desc: 'Revoke any key instantly from your dashboard.' },
                { icon: '📊', title: 'Usage tracking', desc: 'Every API call is logged with timestamp and status.' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <div style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{item.title}</p>
                    <p style={{ fontSize: 13, color: '#64748b' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>API usage — last 7 days</h2>

            {usageData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <p style={{ fontSize: 14 }}>No verification data yet. Start verifying documents to see usage.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, marginBottom: 8 }}>
                  {usageData.map(d => (
                    <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{d.calls}</span>
                      <div style={{ width: '100%', background: '#3b82f6', borderRadius: '4px 4px 0 0', height: `${(d.calls / Math.max(...usageData.map(x => x.calls))) * 120}px`, minHeight: 4 }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {usageData.map(d => (
                    <div key={d.date} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#475569' }}>
                      {d.date.slice(5)}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[
                { label: 'Total this week', value: statsLoading ? '...' : `${usageData.reduce((a, b) => a + b.calls, 0)} calls` },
                { label: 'Success rate', value: statsLoading ? '...' : `${stats?.success_rate || 0}%` },
                { label: 'Active API keys', value: statsLoading ? '...' : `${stats?.active_api_keys || 0}` },
              ].map(s => (
                <div key={s.label} style={{ background: '#0a0f1e', borderRadius: 8, padding: '14px 16px' }}>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontSize: 18, fontWeight: 700 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {recentVerifications.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recent verifications</p>
                {recentVerifications.map(v => (
                  <div key={v.request_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #0f172a' }}>
                    <div>
                      <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#94a3b8' }}>{v.request_id.slice(0, 8)}...</span>
                      <span style={{ fontSize: 12, color: '#475569', marginLeft: 12 }}>{v.document_type}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: v.status === 'verified' ? '#10b981' : '#ef4444', fontWeight: 500 }}>{v.status}</span>
                      <span style={{ fontSize: 11, color: '#475569' }}>{v.created_at ? new Date(v.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}