import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1e293b', padding: '48px 24px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="grid-4" style={{ marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, background: '#3b82f6', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <span style={{ fontWeight: 600, fontSize: 15 }}>VeriDoc<span style={{ color: '#3b82f6' }}>.ai</span></span>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>Document verification infrastructure for Indian fintechs and HRtech.</p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
            { title: 'Developers', links: ['Documentation', 'API Reference', 'SDKs', 'Status'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#f8fafc', marginBottom: 12 }}>{col.title}</p>
              {col.links.map(l => <p key={l} style={{ fontSize: 13, color: '#64748b', marginBottom: 8, cursor: 'pointer' }}>{l}</p>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#475569' }}>© 2025 VeriDoc.ai. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Security'].map(l => (
              <span key={l} style={{ fontSize: 13, color: '#475569', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}