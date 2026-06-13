const endpoints = [
  {
    method: 'POST', path: '/v1/verify', desc: 'Verify a document',
    params: [
      { name: 'document_type', type: 'string', required: true, desc: 'PAN or GST_CERTIFICATE' },
      { name: 'file', type: 'file', required: true, desc: 'JPEG, PNG or PDF, max 5MB' },
    ],
    response: `{
  "request_id": "uuid",
  "status": "verified",
  "confidence_score": 0.97,
  "extracted_fields": {
    "pan_number": "ABCDE1234F",
    "name": "RAHUL SHARMA",
    "date_of_birth": "15/03/1995",
    "father_name": "SURESH SHARMA"
  },
  "flags": [],
  "processing_time_ms": 847
}`
  },
  {
    method: 'GET', path: '/v1/status/{request_id}', desc: 'Get verification result',
    params: [
      { name: 'request_id', type: 'string', required: true, desc: 'UUID from verify response' },
    ],
    response: `{ same as POST /v1/verify response }`
  },
  {
    method: 'POST', path: '/v1/keys', desc: 'Generate API key',
    params: [
      { name: 'name', type: 'string', required: true, desc: 'Key name' },
      { name: 'email', type: 'string', required: true, desc: 'Your email address' },
    ],
    response: `{
  "api_key": "vd_live_...",
  "warning": "Save this key. It won't be shown again."
}`
  },
  {
    method: 'GET', path: '/health', desc: 'Health check',
    params: [],
    response: `{ "status": "ok", "version": "0.1.0" }`
  },
]

const methodColors = { GET: '#10b981', POST: '#3b82f6', DELETE: '#ef4444' }

export default function Docs() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', display: 'flex', gap: 40, alignItems: 'start' }}>

        {/* Sidebar */}
        <div style={{ width: 220, flexShrink: 0, position: 'sticky', top: 80 }} className="hide-mobile">
          <p style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Getting started</p>
          {['Introduction', 'Authentication', 'Rate limits', 'Errors'].map(l => (
            <p key={l} style={{ fontSize: 14, color: '#64748b', marginBottom: 8, cursor: 'pointer', padding: '4px 0' }}>{l}</p>
          ))}
          <div style={{ height: 1, background: '#1e293b', margin: '16px 0' }} />
          <p style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>API Reference</p>
          {endpoints.map(e => (
            <p key={e.path} style={{ fontSize: 14, color: '#64748b', marginBottom: 8, cursor: 'pointer', padding: '4px 0', fontFamily: 'monospace', fontSize: 12 }}>{e.path}</p>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 48 }}>
            <div className="tag" style={{ marginBottom: 12 }}>Documentation</div>
            <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.01em' }}>API Reference</h1>
            <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7 }}>VeriDoc provides a REST API for document verification. All requests require an API key passed as a Bearer token.</p>
          </div>

          {/* Auth */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Authentication</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>Pass your API key as a Bearer token in the Authorization header:</p>
            <pre style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: 16, fontSize: 13, color: '#e6edf3', overflow: 'auto', fontFamily: 'monospace' }}>
              {`Authorization: Bearer vd_live_your_api_key_here`}
            </pre>
          </div>

          {/* Endpoints */}
          {endpoints.map(ep => (
            <div key={ep.path} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ background: `${methodColors[ep.method]}22`, color: methodColors[ep.method], padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{ep.method}</span>
                <code style={{ fontSize: 15, fontFamily: 'monospace', color: '#f8fafc' }}>{ep.path}</code>
              </div>
              <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>{ep.desc}</p>

              {ep.params.length > 0 && (
                <>
                  <p style={{ fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Parameters</p>
                  <div style={{ marginBottom: 20 }}>
                    {ep.params.map(p => (
                      <div key={p.name} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #0f172a', alignItems: 'flex-start' }}>
                        <code style={{ fontSize: 13, color: '#60a5fa', minWidth: 140, fontFamily: 'monospace' }}>{p.name}</code>
                        <span style={{ fontSize: 12, color: '#475569', background: '#0a0f1e', padding: '2px 8px', borderRadius: 4, minWidth: 50 }}>{p.type}</span>
                        {p.required && <span style={{ fontSize: 11, color: '#f59e0b', background: '#2d1a00', padding: '2px 8px', borderRadius: 4 }}>required</span>}
                        <span style={{ fontSize: 13, color: '#64748b' }}>{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <p style={{ fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Response</p>
              <pre style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: 16, fontSize: 12, color: '#e6edf3', overflow: 'auto', margin: 0, fontFamily: 'monospace', lineHeight: 1.7 }}>{ep.response}</pre>
            </div>
          ))}

          {/* Errors */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Error codes</h2>
            {[
              { code: '400', desc: 'Bad request — invalid file type or missing parameters' },
              { code: '401', desc: 'Unauthorized — invalid or missing API key' },
              { code: '404', desc: 'Not found — request ID does not exist' },
              { code: '413', desc: 'File too large — max 5MB' },
              { code: '429', desc: 'Rate limit exceeded — max 60 requests/minute' },
              { code: '500', desc: 'Internal server error — try again' },
            ].map(e => (
              <div key={e.code} style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid #0f172a' }}>
                <code style={{ fontSize: 14, color: '#f87171', fontFamily: 'monospace', minWidth: 40 }}>{e.code}</code>
                <span style={{ fontSize: 14, color: '#64748b' }}>{e.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}