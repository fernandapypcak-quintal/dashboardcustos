import React from 'react'

const MAP = {
  pago:     { label: 'Pago',     bg: '#EEF5D5', color: '#5A6A10' },
  pendente: { label: 'Pendente', bg: '#FDF8DC', color: '#8A7200' },
  vencido:  { label: 'Vencido',  bg: '#F5DCDC', color: '#8C1414' },
}

export default function StatusBadge({ status }) {
  const s = MAP[status] || MAP.pendente
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  )
}
