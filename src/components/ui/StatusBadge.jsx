import React from 'react'

const MAP = {
  pago:     { label: 'Pago',     bg: '#F0F7E6', color: '#3D6B00' },
  pendente: { label: 'Pendente', bg: '#FDF8E6', color: '#8A6500' },
  vencido:  { label: 'Vencido',  bg: '#FDECEA', color: '#C0392B' },
}

export default function StatusBadge({ status }) {
  const s = MAP[status] || MAP.pendente
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  )
}
