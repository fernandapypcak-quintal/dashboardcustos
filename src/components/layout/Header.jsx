import React from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import { LOJAS } from '../../data/config.js'

export default function Header({ title }) {
  const { lojaFiltro, setLojaFiltro, mesFiltro, setMesFiltro, mesesDisponiveis } = useFinanceiro()

  const selectStyle = (ativo) => ({
    padding: '5px 10px',
    border: '1px solid #E8E8E2',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    background: ativo ? '#0D0D0D' : '#fff',
    color:      ativo ? '#fff'    : '#4A4A3A',
    outline: 'none',
  })

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: '#FAFAF8', borderBottom: '1px solid #E8E8E2',
      padding: '0 28px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    }}>
      <h1 style={{ fontSize: 16, fontWeight: 700, color: '#0D0D0D', margin: 0, flexShrink: 0 }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

        {/* Filtro de Mês */}
        {mesesDisponiveis.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E9E8E' }}>
              Mês
            </span>
            <select
              value={mesFiltro}
              onChange={e => setMesFiltro(e.target.value)}
              style={selectStyle(!!mesFiltro)}
            >
              <option value="">Todos</option>
              {mesesDisponiveis.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro de Unidade */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E9E8E' }}>
            Unidade
          </span>
          <select
            value={lojaFiltro}
            onChange={e => setLojaFiltro(e.target.value)}
            style={selectStyle(lojaFiltro !== 'Todas')}
          >
            {LOJAS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

      </div>
    </header>
  )
}
