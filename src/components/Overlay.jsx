import { X } from 'lucide-react'

export default function Overlay({ onClose, children, title, wide }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '20px 20px 0 0',
          width: '100%', maxWidth: wide ? 680 : 520,
          maxHeight: '92vh', overflowY: 'auto',
          animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e5e7eb' }} />
        </div>

        {/* Header */}
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 0' }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111' }}>{title}</h2>
            <button
              onClick={onClose}
              style={{ padding: 6, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <X size={18} color="#374151" />
            </button>
          </div>
        )}

        <div style={{ padding: '16px 20px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
