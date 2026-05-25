import React from 'react'
import { LayoutDashboard, CreditCard, TrendingUp, BarChart3, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'

const NAV = [
  { id: 'home',     label: 'Visão Geral',    icon: LayoutDashboard },
  { id: 'contas',   label: 'Contas a Pagar', icon: CreditCard },
  { id: 'custos',   label: 'Custo Fixo',     icon: TrendingUp },
  { id: 'variavel', label: 'Custo Variável', icon: TrendingDown },
  { id: 'evolucao', label: 'Evolução',        icon: BarChart3 },
]

export default function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  const w = collapsed ? 60 : 224

  return (
    <aside style={{
      width: w, minHeight: '100vh', flexShrink: 0,
      background: '#fff', borderRight: '1px solid #F0F0F0',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '18px 0 14px' : '18px 20px 14px', display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'flex-start', gap:10, flexShrink:0 }}>
        <img
          src="https://faturamento-quintal.vercel.app/favicon.ico"
          onError={e=>{e.target.style.display='none'}}
          style={{ width:28, height:28, borderRadius:6, flexShrink:0 }}
        />
        {!collapsed && (
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#1a1a1a', lineHeight:1.2, whiteSpace:'nowrap' }}>Quintal do Espeto</div>
            <div style={{ fontSize:10.5, color:'#999', marginTop:1 }}>Financeiro</div>
          </div>
        )}
      </div>

      <div style={{ height:1, background:'#F0F0F0', flexShrink:0 }}/>

      {/* Nav */}
      <nav style={{ padding: collapsed ? '8px 6px' : '8px 10px', flex:1 }}>
        {!collapsed && (
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'#CCC', padding:'8px 8px 4px', whiteSpace:'nowrap' }}>
            Analytics
          </div>
        )}
        {NAV.map(({ id, label, icon: Icon }) => {
          const ativo = page === id
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              title={collapsed ? label : undefined}
              style={{
                width:'100%', display:'flex', alignItems:'center',
                gap: collapsed ? 0 : 9,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '9px 0' : '8px 10px',
                borderRadius:7, border:'none', cursor:'pointer',
                background: ativo ? '#F5F5F5' : 'transparent',
                color: ativo ? '#1a1a1a' : '#888',
                fontSize:13.5, fontWeight: ativo ? 600 : 400,
                textAlign:'left', marginBottom:2,
                transition:'all 0.1s',
                position:'relative', whiteSpace:'nowrap',
              }}
            >
              <Icon size={16} strokeWidth={ativo ? 2 : 1.5} style={{ flexShrink:0 }} />
              {!collapsed && label}
              {!collapsed && ativo && (
                <span style={{ position:'absolute', right:10, width:6, height:6, borderRadius:'50%', background:'#22c55e' }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Recolher */}
      <div style={{ borderTop:'1px solid #F0F0F0', padding: collapsed ? '10px 0' : '10px 12px', flexShrink:0 }}>
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            width:'100%', display:'flex', alignItems:'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap:8, padding: collapsed ? '8px 0' : '8px 10px',
            border:'none', background:'none', cursor:'pointer',
            color:'#AAA', fontSize:12.5, borderRadius:6,
            transition:'color 0.1s',
          }}
        >
          {collapsed ? <ChevronRight size={15}/> : <><ChevronLeft size={15}/> Recolher</>}
        </button>
      </div>
    </aside>
  )
}
