import { useState } from 'react'
import Overlay from './Overlay'
import { supabase } from '../supabase'
import { REPORT_REASONS } from '../constants'

export default function ReportModal({ listing, currentUser, onClose, onToast }) {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!reason) return
    setLoading(true)
    await supabase.from('reports').insert({ listing_id: listing.id, reporter_id: currentUser?.id, reason, note })
    onToast('Report submitted')
    onClose()
    setLoading(false)
  }

  return (
    <Overlay onClose={onClose} title="Report listing">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>What's wrong with this listing?</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {REPORT_REASONS.map(r => (
            <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, border: '1.5px solid ' + (reason === r ? '#111' : '#e5e7eb'), background: reason === r ? '#f3f4f6' : '#f9fafb', cursor: 'pointer' }}>
              <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} style={{ accentColor: '#111' }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{r}</span>
            </label>
          ))}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Additional note (optional)</label>
          <textarea
            value={note} onChange={e => setNote(e.target.value)}
            placeholder="Any extra details..."
            rows={3}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', color: '#111' }}
          />
        </div>

        <button
          onClick={submit} disabled={!reason || loading}
          style={{ padding: '13px', borderRadius: 12, border: 'none', background: reason ? '#111' : '#d1d5db', color: '#fff', fontWeight: 700, fontSize: 15, cursor: reason ? 'pointer' : 'not-allowed' }}
        >
          {loading ? 'Submitting...' : 'Submit report'}
        </button>
      </div>
    </Overlay>
  )
}
