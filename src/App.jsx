import { useEffect, useState, useRef } from 'react'
import { supabase } from './lib/supabase'
import MedTab from './components/MedTab'
import MedCard from './components/MedCard'

export const TODAY = new Date().toISOString().slice(0, 10)
export function daysSince(s) {
  return Math.max(0, Math.floor((new Date(TODAY) - new Date(s)) / 864e5))
}
export function curStock(m) {
  return Math.max(0, m.stock - daysSince(m.set_date) * m.perday)
}
export function daysLeft(m) {
  return m.perday > 0 ? Math.floor(curStock(m) / m.perday) : 0
}
export function status(d) {
  return d <= 7 ? 'low' : d <= 14 ? 'warn' : 'ok'
}

// ─── CHANGE THIS to your actual password ───────────────────────────────────
const ADMIN_PASSWORD = '22072023'
// ────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [meds, setMeds]       = useState([])
  const [openIdx, setOpenIdx] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // ── admin state ──────────────────────────────────────────────────────────
  const [isAdmin, setIsAdmin]         = useState(false)
  const [showPwBox, setShowPwBox]     = useState(false)
  const [pwInput, setPwInput]         = useState('')
  const [pwError, setPwError]         = useState(false)   // triggers shake
  const [pwErrMsg, setPwErrMsg]       = useState('')
  const pwRef = useRef(null)
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => { fetchMeds() }, [])

  // auto-focus password input when box opens
  useEffect(() => {
    if (showPwBox) setTimeout(() => pwRef.current?.focus(), 50)
  }, [showPwBox])

  async function fetchMeds() {
    setLoading(true)
    const { data, error } = await supabase
      .from('medicines').select('*').order('created_at')
    if (error) setError(error.message)
    else setMeds(data || [])
    setLoading(false)
  }

  async function refill(id, amount) {
    const med = meds.find(m => m.id === id)
    const newStock = curStock(med) + amount
    await supabase.from('medicines')
      .update({ stock: newStock, set_date: TODAY }).eq('id', id)
    fetchMeds()
  }

  async function saveEdit(id, stock, perday, name, dose) {
    await supabase.from('medicines')
      .update({ stock, perday, set_date: TODAY, name, dose }).eq('id', id)
    fetchMeds()
  }

  async function deleteMed(id, name) {
    if (!window.confirm(`Delete "${name}" permanently?`)) return
    await supabase.from('medicines').delete().eq('id', id)
    setOpenIdx(null)
    fetchMeds()
  }

  // ── admin auth helpers ───────────────────────────────────────────────────
  function handleAdminClick() {
    if (isAdmin) {
      // lock again
      setIsAdmin(false)
      setOpenIdx(null)
    } else {
      setPwInput('')
      setPwError(false)
      setPwErrMsg('')
      setShowPwBox(true)
    }
  }

  function submitPassword() {
    if (pwInput === ADMIN_PASSWORD) {
      setIsAdmin(true)
      setShowPwBox(false)
      setPwInput('')
    } else {
      setPwErrMsg('Wrong password')
      setPwError(true)
      setPwInput('')
      setTimeout(() => setPwError(false), 600)
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const dateLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const critCount = meds.filter(m => status(daysLeft(m)) === 'low').length
  const warnCount = meds.filter(m => status(daysLeft(m)) === 'warn').length
  const okCount   = meds.filter(m => status(daysLeft(m)) === 'ok').length

  if (loading) return (
    <div className="loading">
      <i className="ti ti-loader-2 spin" />
      <span>Loading medicines…</span>
    </div>
  )
  if (error) return (
    <div className="loading" style={{ color: '#e24b4a' }}>
      <i className="ti ti-alert-circle" />
      <span>Error: {error}</span>
    </div>
  )

  return (
    <div className="app">
      <div className="hdr">
        {/* ── admin toggle button ── */}
        <button
          className={`admin-btn ${isAdmin ? 'admin-btn--active' : ''}`}
          onClick={handleAdminClick}
          title={isAdmin ? 'Lock admin mode' : 'Admin login'}
        >
          <i className={`ti ${isAdmin ? 'ti-lock-open' : 'ti-lock'}`} />
          {isAdmin ? 'Admin' : ''}
        </button>

        <h1>Medidose</h1>
        <p>{dateLabel}</p>
      </div>

      {/* ── password modal ── */}
      {showPwBox && (
        <div className="pw-overlay" onClick={() => setShowPwBox(false)}>
          <div
            className={`pw-box ${pwError ? 'pw-box--shake' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            <p className="pw-title">
              <i className="ti ti-shield-lock" /> Admin access
            </p>
            <input
              ref={pwRef}
              type="password"
              className="pw-input"
              placeholder="Enter password"
              value={pwInput}
              onChange={e => { setPwInput(e.target.value); setPwErrMsg('') }}
              onKeyDown={e => e.key === 'Enter' && submitPassword()}
            />
            {pwErrMsg && <p className="pw-err">{pwErrMsg}</p>}
            <div className="pw-actions">
              <button className="pw-cancel" onClick={() => setShowPwBox(false)}>Cancel</button>
              <button className="pw-submit" onClick={submitPassword}>Unlock</button>
            </div>
          </div>
        </div>
      )}

      <div className="summary-bar">
        {critCount > 0 && (
          <span className="sb low"><i className="ti ti-alert-triangle" /> {critCount} critical</span>
        )}
        {warnCount > 0 && (
          <span className="sb warn"><i className="ti ti-clock" /> {warnCount} running low</span>
        )}
        {okCount > 0 && (
          <span className="sb ok"><i className="ti ti-check" /> {okCount} stocked</span>
        )}
      </div>

      <div className="tabs">
        {meds.map((m, i) => (
          <MedTab
            key={m.id}
            med={m}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          >
            {/* MedCard only renders for admin */}
            {isAdmin && (
              <MedCard
                med={m}
                onRefill={(amount) => refill(m.id, amount)}
                onSave={(stock, perday, name, dose) => saveEdit(m.id, stock, perday, name, dose)}
                onDelete={() => deleteMed(m.id, m.name)}
              />
            )}
          </MedTab>
        ))}
      </div>
    </div>
  )
}