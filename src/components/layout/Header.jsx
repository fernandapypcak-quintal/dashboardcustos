import React from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import { LOJAS } from '../../data/config.js'

export default function Header({ title }) {
  const { lojaFiltro, setLojaFiltro } = useFinanceiro()

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: '#FAFAF8', borderBottom: '1px solid #E8E8E2',
      padding: '0 28px',
      height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <h1 style={{ fontSize: 16, fontWeight: 700, color: '#0D0D0D', margin: 0 }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E9E8E', marginRight: 4 }}>
          Loja
        </span>
        {LOJAS.map((l) => (
          <button
            key={l}
            onClick={() => setLojaFiltro(l)}
            style={{
              padding: '5px 12px',
              borderRadius: 5,
              border: '1px solid #E8E8E2',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: lojaFiltro === l ? 600 : 400,
              background: lojaFiltro === l ? '#0D0D0D' : '#fff',
              color: lojaFiltro === l ? '#fff' : '#4A4A3A',
              transition: 'all 0.12s',
            }}
          >
            {l}
          </button>
        ))}
      </div>
    </header>
  )
}
