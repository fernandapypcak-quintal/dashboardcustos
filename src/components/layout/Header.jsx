import React from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import { LOJAS } from '../../data/config.js'
import { ChevronDown, X } from 'lucide-react'

export default function Header({ title, subtitle }) {
  const { lojaFiltro, setLojaFiltro, mesFiltro, setMesFiltro, mesesDisponiveis } = useFinanceiro()

  return (
    <header style={{
      background:'#fff', borderBottom:'1px solid #F0F0F0',
      padding:'16px 28px',
      display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:20,
      position:'sticky', top:0, zIndex:20,
    }}>
      <div>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#1a1a1a', margin:0, lineHeight:1.2 }}>{title}</h1>
        {subtitle && <div style={{ fontSize:12, color:'#999', marginTop:3 }}>{subtitle}</div>}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, marginTop:2 }}>

        {/* Filtro de mês */}
        {mesesDisponiveis.length > 0 && (
          mesFiltro ? (
            <div style={{ display:'flex', alignItems:'center', background:'#1a1a1a', borderRadius:99, padding:'0 4px 0 14px', height:34, gap:4 }}>
              <span style={{ fontSize:13, fontWeight:500, color:'#fff' }}>{mesFiltro}</span>
              <button onClick={() => setMesFiltro('')} style={{ border:'none', background:'none', cursor:'pointer', padding:'4px 6px', display:'flex', alignItems:'center' }}>
                <X size={12} color="#fff" strokeWidth={2.5}/>
              </button>
            </div>
          ) : (
            <div style={{ position:'relative' }}>
              <select
                value=""
                onChange={e => setMesFiltro(e.target.value)}
                style={{
                  appearance:'none', WebkitAppearance:'none',
                  padding:'0 32px 0 14px', height:34,
                  border:'1px solid #E8E8E8', borderRadius:99,
                  fontSize:13, color:'#555', background:'#fff',
                  cursor:'pointer', outline:'none', fontFamily:'inherit',
                }}
              >
                <option value="">Todos os meses</option>
                {mesesDisponiveis.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown size={13} color="#999" style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
            </div>
          )
        )}

        {/* Filtro de loja */}
        <div style={{ position:'relative' }}>
          <select
            value={lojaFiltro}
            onChange={e => setLojaFiltro(e.target.value)}
            style={{
              appearance:'none', WebkitAppearance:'none',
              padding:'0 32px 0 14px', height:34,
              border: lojaFiltro !== 'Todas' ? '1px solid #1a1a1a' : '1px solid #E8E8E8',
              borderRadius:99, fontSize:13,
              color: lojaFiltro !== 'Todas' ? '#1a1a1a' : '#555',
              background:'#fff', cursor:'pointer', outline:'none',
              fontFamily:'inherit', fontWeight: lojaFiltro !== 'Todas' ? 600 : 400,
            }}
          >
            {LOJAS.map(l => <option key={l} value={l}>{l === 'Todas' ? 'Todas as lojas' : l}</option>)}
          </select>
          <ChevronDown size={13} color="#999" style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
        </div>
      </div>
    </header>
  )
}
