import React from 'react'
import { LayoutDashboard, CreditCard, TrendingUp, BarChart3, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'

const NAV = [
  { id: 'home',     label: 'Visão Geral',    icon: LayoutDashboard },
  { id: 'custos',   label: 'Custo Fixo',     icon: TrendingUp },
  { id: 'variavel', label: 'Custo Variável', icon: TrendingDown },
  { id: 'evolucao', label: 'Evolução',        icon: BarChart3 },
  { id: 'contas',   label: 'Contas a Pagar', icon: CreditCard },
]

export default function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  const w = collapsed ? 64 : 224
  return (
    <aside style={{ width:w, minHeight:'100vh', flexShrink:0, background:'#fff', borderRight:'1px solid #F0F0F0', display:'flex', flexDirection:'column', transition:'width 0.2s cubic-bezier(0.4,0,0.2,1)', overflow:'hidden' }}>
      <div style={{ background:'#111', padding: collapsed ? '16px 0' : '14px 16px', display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'flex-start', gap:10, flexShrink:0, minHeight:64 }}>
        <img src="https://faturamento-quintal.vercel.app/favicon.ico" onError={e=>{e.target.style.display='none'}} style={{ width:36, height:36, borderRadius:8, objectFit:'contain', flexShrink:0 }}/>
        {!collapsed && (
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff', lineHeight:1.2, whiteSpace:'nowrap' }}>Quintal do Espeto</div>
            <div style={{ fontSize:10.5, color:'#888', marginTop:2, whiteSpace:'nowrap' }}>Financeiro</div>
          </div>
        )}
      </div>
      <nav style={{ padding: collapsed ? '12px 8px' : '12px 10px', flex:1 }}>
        {!collapsed && <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.07em', textTransform:'uppercase', color:'#BBB', padding:'4px 8px 10px', whiteSpace:'nowrap' }}>Analytics</div>}
        {NAV.map(({ id, label, icon: Icon }) => {
          const ativo = page === id
          return (
            <button key={id} onClick={()=>setPage(id)} title={collapsed?label:undefined} style={{ width:'100%', display:'flex', alignItems:'center', gap: collapsed?0:10, justifyContent: collapsed?'center':'flex-start', padding: collapsed?'10px 0':'9px 12px', borderRadius:8, border:'none', cursor:'pointer', background: ativo?'#111':'transparent', color: ativo?'#fff':'#888', fontSize:14, fontWeight: ativo?600:400, textAlign:'left', marginBottom:2, transition:'background 0.1s, color 0.1s', whiteSpace:'nowrap', position:'relative' }}>
              <Icon size={16} strokeWidth={ativo?2:1.5} style={{ flexShrink:0 }}/>
              {!collapsed && label}
              {ativo && !collapsed && <span style={{ position:'absolute', right:12, width:6, height:6, borderRadius:'50%', background:'#22c55e' }}/>}
            </button>
          )
        })}
      </nav>
      <div style={{ borderTop:'1px solid #F0F0F0', padding: collapsed?'10px 8px':'10px 10px', flexShrink:0 }}>
        <button onClick={()=>setCollapsed(c=>!c)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent: collapsed?'center':'flex-start', gap:8, padding: collapsed?'8px 0':'8px 12px', border:'none', background:'none', cursor:'pointer', color:'#AAA', fontSize:13, borderRadius:6, fontFamily:'inherit' }}>
          {collapsed ? <ChevronRight size={15}/> : <><ChevronLeft size={15}/> Recolher</>}
        </button>
      </div>
    </aside>
  )
}
