import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 200)
    }, 2600)
    return () => clearTimeout(t)
  }, [])

  const isError = message?.toLowerCase().includes('error') || message?.toLowerCase().includes('failed')

  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, opacity: visible ? 1 : 0, transition: 'opacity 0.2s',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: isError ? '#fee2e2' : '#111',
        color: isError ? '#dc2626' : '#fff',
        padding: '12px 18px', borderRadius: 12,
        fontSize: 14, fontWeight: 500,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        whiteSpace: 'nowrap'
      }}>
        {isError
          ? <AlertCircle size={16} />
          : <CheckCircle size={16} />
        }
        {message}
      </div>
    </div>
  )
}
