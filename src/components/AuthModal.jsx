import { useState } from 'react'
import { Mail, Lock, User, ChevronDown } from 'lucide-react'
import Overlay from './Overlay'
import { supabase } from '../supabase'
import { SCHOOLS, GRADES } from '../constants'

export default function AuthModal({ mode: initMode, onClose, onSuccess, schoolColor }) {
  const [mode, setMode] = useState(initMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut()
        setError('Please verify your email before signing in. Check your inbox (and spam folder).')
        setLoading(false)
        return
      }
      onSuccess()
    } else {
      if (!email.endsWith('.edu')) { setError('You must use a .edu email address to sign up.'); setLoading(false); return }
      if (!name || !school || !grade) { setError('Please fill all fields'); setLoading(false); return }
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: 'https://u-market-v2-git-main-rian-rayners-projects.vercel.app' }
      })
      if (error) { setError(error.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id, name, school, grade,
          verified: true,
          transactions: 0, sold_count: 0
        })
      }
      setCheckEmail(true)
    }
    setLoading(false)
  }

  if (checkEmail) {
    return (
      <Overlay onClose={onClose} title="Check your email">
        <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📬</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 10px' }}>Verify your email</p>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px', lineHeight: 1.6 }}>
            We sent a verification link to <strong>{email}</strong>.<br />
            Click it to finish signing up — you'll be logged in automatically.
          </p>
          <button
            onClick={onClose}
            style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: schoolColor || '#111', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          >Got it</button>
        </div>
      </Overlay>
    )
  }

  return (
    <Overlay onClose={onClose} title={mode === 'login' ? 'Welcome back' : 'Create account'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {mode === 'signup' && (
          <Field icon={<User size={16} color="#9ca3af" />} label="Full name">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
          </Field>
        )}

        <Field icon={<Mail size={16} color="#9ca3af" />} label="Email">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@school.edu" required />
        </Field>
        {mode === 'signup' && email.length > 0 && !email.endsWith('.edu') && (
          <p style={{ margin: '-8px 0 0', fontSize: 12, color: '#dc2626' }}>⚠ Must be a .edu email address</p>
        )}

        <Field icon={<Lock size={16} color="#9ca3af" />} label="Password">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        </Field>

        {mode === 'signup' && (
          <>
            <Field icon={<ChevronDown size={16} color="#9ca3af" />} label="School">
              <select value={school} onChange={e => setSchool(e.target.value)} required>
                <option value="">Select your school</option>
                {SCHOOLS.filter(s => s.live).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>

            <Field icon={<ChevronDown size={16} color="#9ca3af" />} label="Graduating Year">
              <select value={grade} onChange={e => setGrade(e.target.value)} required>
                <option value="">Select graduating year</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          </>
        )}

        {error && (
          <p style={{ color: '#dc2626', fontSize: 13, margin: 0, background: '#fee2e2', padding: '10px 12px', borderRadius: 8 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '13px', borderRadius: 12, border: 'none',
            background: loading ? '#d1d5db' : (schoolColor || '#111'),
            color: '#fff', fontWeight: 700, fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4
          }}
        >
          {loading ? 'Loading...' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', margin: 0 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: schoolColor || '#111', padding: 0 }}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </form>
    </Overlay>
  )
}

function Field({ icon, label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: 12, pointerEvents: 'none' }}>{icon}</span>
        {React.cloneElement(children.props ? children : children, {
          style: {
            width: '100%', padding: '11px 12px 11px 38px',
            borderRadius: 10, border: '1px solid #e5e7eb',
            fontSize: 14, outline: 'none', color: '#111',
            background: '#f9fafb', appearance: 'none',
            ...children.props?.style
          }
        })}
      </div>
    </div>
  )
}

// Need React for cloneElement
import React from 'react'
