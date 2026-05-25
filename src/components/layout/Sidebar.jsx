import React from 'react'
import { LayoutDashboard, CreditCard, TrendingUp, BarChart3, TrendingDown } from 'lucide-react'

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
      width: 224, minHeight: '100vh', flexShrink: 0,
      background: '#fff', borderRight: '1px solid #F0F0F0',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo — igual ao de faturamento */}
      <div style={{ padding: '18px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="https://faturamento-quintal.vercel.app/favicon.ico"
            onError={e => { e.target.style.display='none' }}
            style={{ width: 28, height: 28, borderRadius: 6 }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.2 }}>Quintal do Espeto</div>
            <div style={{ fontSize: 10.5, color: '#999', marginTop: 1 }}>Financeiro</div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: '#F0F0F0', margin: '0 0 8px' }} />

      {/* Nav */}
      <nav style={{ padding: '4px 10px', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#CCC', padding: '8px 8px 4px' }}>
          Analytics
        </div>
        {NAV.map(({ id, label, icon: Icon }) => {
          const ativo = page === id
          return (
            <button key={id} onClick={() => setPage(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: 'transparent',
              color: ativo ? '#1a1a1a' : '#888',
              fontSize: 13.5, fontWeight: ativo ? 600 : 400,
              textAlign: 'left', marginBottom: 1,
              transition: 'color 0.1s',
              position: 'relative',
            }}>
              <Icon size={15} strokeWidth={ativo ? 2 : 1.5} />
              {label}
              {ativo && (
                <span style={{
                  position: 'absolute', right: 10,
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#22c55e',
                }} />
              )}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '12px 18px', fontSize: 11, color: '#DDD' }}>v1.0</div>
    </aside>
  )
}
