import React from 'react'

export default function KpiCard({ label, valor, subtitulo, subtituloColor, icon: Icon }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E8E8E2',
      borderRadius: 8,
      padding: '18px 20px 16px',
      display: 'flex', flexDirection: 'column', gap: 6,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>
          {label}
        </span>
        {Icon && <Icon size={14} color="#C0C0B0" />}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#0D0D0D', fontFamily: "'DM Mono', monospace", lineHeight: 1.15 }}>
        {valor}
      </div>
      {subtitulo && (
        <div style={{ fontSize: 12, fontWeight: 500, color: subtituloColor || '#8A8A7A' }}>
          {subtitulo}
        </div>
      )}
    </div>
  )
}
