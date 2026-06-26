import { daysLeft, status } from '../App'

const DOT_COLOR = { ok: '#22c27a', warn: '#f5a623', low: '#e24b4a' }

export default function MedTab({ med, isOpen, onToggle, children }) {
  const d  = daysLeft(med)
  const st = status(d)

  return (
    <div>
      <div
        className={`tab ${isOpen ? 'active' : ''}`}
        onClick={onToggle}
        role="button"
        aria-expanded={isOpen}
      >
        <div className="tab-left">
          <span className="dot" style={{ background: DOT_COLOR[st] }} />
          <div>
            <div className="tab-name">{med.name}</div>
            <div className="tab-sub">{med.dose} · {med.perday}/day</div>
          </div>
        </div>
        <div className="tab-right">
          <span className={`days-pill ${st}`}>{d} days</span>
          <i className={`ti ${isOpen ? 'ti-chevron-up' : 'ti-chevron-down'} chevron`} aria-hidden="true" />
        </div>
      </div>
      {isOpen && <div className="panel open">{children}</div>}
    </div>
  )
}
