import { useEffect, useState } from 'react'
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

export default function App() {
  const [meds, setMeds] = useState([])
  const [openIdx, setOpenIdx] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchMeds() }, [])

  async function fetchMeds() {
    setLoading(true)
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .order('created_at')
    if (error) setError(error.message)
    else setMeds(data || [])
    setLoading(false)
  }

  async function refill(id, amount) {
    const med = meds.find(m => m.id === id)
    const newStock = curStock(med) + amount
    await supabase
      .from('medicines')
      .update({ stock: newStock, set_date: TODAY })
      .eq('id', id)
    fetchMeds()
  }

  async function saveEdit(id, stock, perday, name, dose) {
    await supabase
      .from('medicines')
      .update({ stock, perday, set_date: TODAY, name, dose })
      .eq('id', id)
    fetchMeds()
  }

  async function deleteMed(id, name) {
    if (!window.confirm(`Delete "${name}" permanently?`)) return
    await supabase.from('medicines').delete().eq('id', id)
    setOpenIdx(null)
    fetchMeds()
  }

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
        <h1>Medicine tracker</h1>
        <p>{dateLabel}</p>
      </div>

      <div className="summary-bar">
        {critCount > 0 && (
          <span className="sb low">
            <i className="ti ti-alert-triangle" /> {critCount} critical
          </span>
        )}
        {warnCount > 0 && (
          <span className="sb warn">
            <i className="ti ti-clock" /> {warnCount} running low
          </span>
        )}
        {okCount > 0 && (
          <span className="sb ok">
            <i className="ti ti-check" /> {okCount} stocked
          </span>
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
            <MedCard
              med={m}
              onRefill={(amount) => refill(m.id, amount)}
              onSave={(stock, perday, name, dose) => saveEdit(m.id, stock, perday, name, dose)}
              onDelete={() => deleteMed(m.id, m.name)}
            />
          </MedTab>
        ))}
      </div>
    </div>
  )
}
