import { useState } from 'react'
import { curStock, daysLeft, status, daysSince } from '../App'

export default function MedCard({ med, onRefill, onSave, onDelete }) {
  const [editing, setEditing]       = useState(false)
  const [stockInput, setStockInput] = useState('')
  const [perdayInput, setPerdayInput] = useState('')
  const [nameInput, setNameInput]   = useState('')
  const [doseInput, setDoseInput]   = useState('')

  const cur     = curStock(med)
  const d       = daysLeft(med)
  const st      = status(d)
  const pct     = Math.min(100, Math.round((cur / (med.stock || 1)) * 100))
  const elapsed = daysSince(med.set_date)

  function handleRefill() {
    const add = parseInt(prompt(`Add how many ${med.unit} for ${med.name}?`, '30'))
    if (!isNaN(add) && add > 0) onRefill(add)
  }

  function handleSave() {
    const s = parseInt(stockInput)
    const p = parseInt(perdayInput)
    onSave(
      !isNaN(s) && s >= 0 ? s : cur,
      !isNaN(p) && p > 0  ? p : med.perday,
      nameInput.trim() || med.name,
      doseInput.trim() || med.dose
    )
    setEditing(false)
  }

  function openEdit() {
    setStockInput(String(cur))
    setPerdayInput(String(med.perday))
    setNameInput(med.name)
    setDoseInput(med.dose)
    setEditing(!editing)
  }

  return (
    <div className="card">
      <div className="card-top">
        <div>
          <div className="med-name">{med.name}</div>
          <div className="med-sub">{med.dose} · {med.unit}</div>
        </div>
        <div>
          <div className={`big-num ${st}`}>{d}</div>
          <div className="big-lbl">days left</div>
        </div>
      </div>

      <div className="bar-track">
        <div className={`bar-fill ${st}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-n">{cur}</div>
          <div className="stat-l">in stock</div>
        </div>
        <div className="stat">
          <div className="stat-n">{med.perday}</div>
          <div className="stat-l">per day</div>
        </div>
        <div className="stat">
          <div className="stat-n">{elapsed}</div>
          <div className="stat-l">days tracked</div>
        </div>
      </div>

      <div className="actions">
        <button className="btn refill" onClick={handleRefill}>
          <i className="ti ti-plus" aria-hidden="true" /> Add stock
        </button>
        <button className="btn" onClick={openEdit}>
          <i className="ti ti-pencil" aria-hidden="true" /> Edit
        </button>
        <button className="btn danger" onClick={onDelete}>
          <i className="ti ti-trash" aria-hidden="true" /> Delete
        </button>
      </div>

      <div className="meta">
        Set on {med.set_date} · {elapsed * med.perday} {med.unit} auto-deducted
      </div>

      {editing && (
        <div className="edit-section open">
          <div className="edit-grid">
            <div className="field">
              <label>Medicine name</label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Dose (e.g. 5 mg)</label>
              <input
                type="text"
                value={doseInput}
                onChange={e => setDoseInput(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Current stock</label>
              <input
                type="number"
                value={stockInput}
                min="0"
                onChange={e => setStockInput(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Doses per day</label>
              <input
                type="number"
                value={perdayInput}
                min="1"
                max="10"
                onChange={e => setPerdayInput(e.target.value)}
              />
            </div>
          </div>
          <button className="save-btn" onClick={handleSave}>Save changes</button>
        </div>
      )}
    </div>
  )
}
