import { Copy, ExternalLink } from 'lucide-react'
import Overlay from './Overlay'

export default function ContactModal({ listing, onClose, onToast }) {
  const type = listing.contact_type || 'other'
  const info = listing.contact

  function copy() {
    navigator.clipboard.writeText(info)
    onToast('Copied!')
  }

  const isLink = type === 'instagram'

  return (
    <Overlay onClose={onClose} title="Contact seller">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>
          Reach out to <strong style={{ color: '#111' }}>{listing.profiles?.name}</strong> via {type}
        </p>

        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{type}</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>{info}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={copy}
              style={{ padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Copy size={16} color="#374151" />
            </button>
            {isLink && info && (
              <a href={`https://instagram.com/${info.replace('@', '')}`} target="_blank" rel="noreferrer"
                style={{ padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <ExternalLink size={16} color="#374151" />
              </a>
            )}
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
          Always meet in a public place and stay safe 🙏
        </p>
      </div>
    </Overlay>
  )
}
