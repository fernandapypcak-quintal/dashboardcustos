import React from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import { LOJAS } from '../../data/config.js'

export default function Header({ title, subtitle }) {
  const { lojaFiltro, setLojaFiltro, mesFiltro, setMesFiltro, mesesDisponiveis } = useFinanceiro()

  const pill = (ativo) => ({
    padding: '5px 14px', borderRadius: 20,
    border: `1px solid ${ativo ? '#1a1a1a' : '#E8E8E8'}`,
    fontSize: 13, fontWeight: ativo ? 500 : 400,
    cursor: 'pointer', outline: 'none',
    background: ativo ? '#1a1a1a' : '#fff',
    color:      ativo ? '#fff'    : '#555',
    transition: 'all 0.1s',
    appearance: 'none', WebkitAppearance: 'none',
    paddingRight: 28,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='${ativo ? '%23fff' : '%23999'}'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
  })

  return (
    <header style={{
      background: '#fff', borderBottom: '1px solid #F0F0F0',
      padding: '14px 28px',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      gap: 16,
    }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', margin: 0, lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{subtitle}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginTop: 2 }}>
        {mesesDisponiveis.length > 0 && (
          <select value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} style={pill(!!mesFiltro)}>
            <option value="">Todos os meses</option>
            {mesesDisponiveis.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        )}
        <select value={lojaFiltro} onChange={e => setLojaFiltro(e.target.value)} style={pill(lojaFiltro !== 'Todas')}>
          {LOJAS.map(l => <option key={l} value={l}>{l === 'Todas' ? 'Todas as lojas' : l}</option>)}
        </select>
      </div>
    </header>
  )
}
