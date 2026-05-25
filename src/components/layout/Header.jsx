import React, { useState } from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import { LOJAS } from '../../data/config.js'
import { ChevronDown } from 'lucide-react'

export default function Header({ title }) {
  const { lojaFiltro, setLojaFiltro, mesFiltro, setMesFiltro, mesesDisponiveis } = useFinanceiro()
  const [lojaOpen, setLojaOpen] = useState(false)

  const SBTN = (ativo) => ({
    padding: '5px 11px', borderRadius: 5, border: '1px solid #E8E8E2',
    cursor: 'pointer', fontSize: 11.5, whiteSpace: 'nowrap',
    background: ativo ? '#0D0D0D' : '#fff',
    color:      ativo ? '#fff'    : '#4A4A3A',
    fontWeight: ativo ? 600       : 400,
    transition: 'all 0.1s',
  })

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: '#FAFAF8', borderBottom: '1px solid #E8E8E2',
      padding: '0 28px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16,
    }}>
      <h1 style={{ fontSize: 16, fontWeight: 700, color: '#0D0D0D', margin: 0, flexShrink: 0 }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>

        {/* Filtro de Mês */}
        {mesesDisponiveis.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E9E8E' }}>
              Mês
            </span>
            <select
              value={mesFiltro}
              onChange={e => setMesFiltro(e.target.value)}
              style={{ padding: '5px 10px', border: '1px solid #E8E8E2', borderRadius: 5, fontSize: 12, background: mesFiltro ? '#0D0D0D' : '#fff', color: mesFiltro ? '#fff' : '#4A4A3A', cursor: 'pointer', fontWeight: 600 }}
            >
              <option value="">Todos</option>
              {mesesDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}

        {/* Filtro de Loja */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E9E8E' }}>
            Unidade
          </span>
          {/* Em mobile/muitas lojas usa select, senão botões */}
          {LOJAS.length > 5 ? (
            <select
              value={lojaFiltro}
              onChange={e => setLojaFiltro(e.target.value)}
              style={{ padding: '5px 10px', border: '1px solid #E8E8E2', borderRadius: 5, fontSize: 12, background: lojaFiltro !== 'Todas' ? '#0D0D0D' : '#fff', color: lojaFiltro !== 'Todas' ? '#fff' : '#4A4A3A', cursor: 'pointer', fontWeight: 600 }}
            >
              {LOJAS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          ) : (
            LOJAS.map(l => (
              <button key={l} onClick={() => setLojaFiltro(l)} style={SBTN(lojaFiltro === l)}>
                {l}
              </button>
            ))
          )}
        </div>
      </div>
    </header>
  )
}
