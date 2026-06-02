import React from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import { LOJAS } from '../../data/config.js'
import { ChevronDown, X } from 'lucide-react'

const TIPO_OPCOES = [
  { value: 'operacional', label: 'Operacional',     desc: 'Fixo + Variável' },
  { value: 'comCapex',    label: '+ CAPEX',          desc: 'Fixo + Variável + Investimento' },
  { value: 'tudo',        label: 'Tudo',             desc: 'Inclui dividendos, mútuo, Santander' },
]

export default function Header({ title, subtitle }) {
  const { lojaFiltro, setLojaFiltro, mesFiltro, setMesFiltro, mesesDisponiveis, tipoFiltro, setTipoFiltro } = useFinanceiro()

  const sel = (ativo) => ({
    appearance:'none', WebkitAppearance:'none',
    padding:'0 32px 0 14px', height:34,
    border: ativo ? '1px solid #1a1a1a' : '1px solid #E8E8E8',
    borderRadius:99, fontSize:13,
    color: ativo ? '#1a1a1a' : '#555',
    background:'#fff', cursor:'pointer', outline:'none',
    fontFamily:'inherit', fontWeight: ativo ? 600 : 400,
  })

  return (
    <header style={{
      background:'#fff', borderBottom:'1px solid #F0F0F0',
      padding:'14px 28px',
      display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16,
      position:'sticky', top:0, zIndex:20,
    }}>
      <div>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#1a1a1a', margin:0, lineHeight:1.2 }}>{title}</h1>
        {subtitle && <div style={{ fontSize:12, color:'#999', marginTop:3 }}>{subtitle}</div>}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, marginTop:2, flexWrap:'wrap', justifyContent:'flex-end' }}>

        {/* Filtro de Tipo */}
        <div style={{ display:'flex', alignItems:'center', gap:4, background:'#F7F7F7', borderRadius:99, padding:'3px 4px' }}>
          {TIPO_OPCOES.map(op => (
            <button
              key={op.value}
              onClick={() => setTipoFiltro(op.value)}
              title={op.desc}
              style={{
                padding:'4px 12px', borderRadius:99, border:'none',
                fontSize:12, fontWeight: tipoFiltro === op.value ? 600 : 400,
                cursor:'pointer', fontFamily:'inherit',
                background: tipoFiltro === op.value ? '#1a1a1a' : 'transparent',
                color:      tipoFiltro === op.value ? '#fff'    : '#777',
                transition: 'all 0.1s',
              }}
            >
              {op.label}
            </button>
          ))}
        </div>

        {/* Filtro de Mês */}
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
              <select value="" onChange={e => setMesFiltro(e.target.value)} style={sel(false)}>
                <option value="">Todos os meses</option>
                {mesesDisponiveis.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown size={13} color="#999" style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
            </div>
          )
        )}

        {/* Filtro de Loja */}
        <div style={{ position:'relative' }}>
          <select value={lojaFiltro} onChange={e => setLojaFiltro(e.target.value)} style={sel(lojaFiltro !== 'Todas')}>
            {LOJAS.map(l => <option key={l} value={l}>{l === 'Todas' ? 'Todas as lojas' : l}</option>)}
          </select>
          <ChevronDown size={13} color="#999" style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
        </div>

      </div>
    </header>
  )
}
