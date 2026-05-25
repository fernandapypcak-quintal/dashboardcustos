import React from 'react'
import { LayoutDashboard, CreditCard, TrendingUp, BarChart3, TrendingDown, Flame } from 'lucide-react'

const NAV = [
  { id: 'home',     label: 'Visão Geral',    icon: LayoutDashboard },
  { id: 'contas',   label: 'Contas a Pagar', icon: CreditCard },
  { id: 'custos',   label: 'Custo Fixo',     icon: TrendingUp },
  { id: 'variavel', label: 'Custo Variável', icon: TrendingDown },
  { id: 'evolucao', label: 'Evolução',        icon: BarChart3 },
]

export default function Sidebar({ page, setPage }) {
  return (
    <aside style={{
      width: 220, minHeight: '100vh', flexShrink: 0,
      background: '#fff',
      borderRight: '1px solid #EBEBEB',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F0F0EE' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={15} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', lineHeight: 1.2 }}>Quintal do Espeto</div>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 1 }}>Financeiro</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#BBB', padding: '6px 10px 8px' }}>
          Módulos
        </div>
        {NAV.map(({ id, label, icon: Icon }) => {
          const ativo = page === id
          return (
            <button key={id} onClick={() => setPage(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: ativo ? '#F0F0EE' : 'transparent',
              color: ativo ? '#111' : '#666',
              fontSize: 13.5, fontWeight: ativo ? 600 : 400,
              textAlign: 'left', marginBottom: 1,
              transition: 'all 0.1s',
            }}>
              <Icon size={15} color={ativo ? '#111' : '#999'} />
              {label}
              {ativo && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#5C7A00', flexShrink: 0 }} />}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '12px 20px', borderTop: '1px solid #F0F0EE', fontSize: 11, color: '#CCC' }}>
        v1.0
      </div>
    </aside>
  )
}
