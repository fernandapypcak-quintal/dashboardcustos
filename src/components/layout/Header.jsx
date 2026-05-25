import React from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import { LOJAS } from '../../data/config.js'

export default function Header({ title }) {
  const { lojaFiltro, setLojaFiltro, mesFiltro, setMesFiltro, mesesDisponiveis } = useFinanceiro()

  const sel = (ativo) => ({
    padding: '5px 10px', border: '1px solid #E0E0E0', borderRadius: 6,
    fontSize: 12.5, fontWeight: 500, cursor: 'pointer', outline: 'none',
    background: ativo ? '#111' : '#fff',
    color:      ativo ? '#fff' : '#333',
    transition: 'all 0.1s',
  })

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: '#fff', borderBottom: '1px solid #EBEBEB',
      padding: '0 28px', height: 54,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <h1 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>{title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {mesesDisponiveis.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#AAA' }}>Mês</span>
            <select value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} style={sel(!!mesFiltro)}>
              <option value="">Todos</option>
              {mesesDisponiveis.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#AAA' }}>Unidade</span>
          <select value={lojaFiltro} onChange={e => setLojaFiltro(e.target.value)} style={sel(lojaFiltro !== 'Todas')}>
            {LOJAS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
    </header>
  )
}
