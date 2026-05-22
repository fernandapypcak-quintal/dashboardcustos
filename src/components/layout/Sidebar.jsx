import React from 'react'
import { LayoutDashboard, CreditCard, TrendingUp, BarChart3, ChefHat, TrendingDown } from 'lucide-react'

const NAV = [
  { id: 'home', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'contas', label: 'Contas a Pagar', icon: CreditCard },
  { id: 'custos', label: 'Custo Fixo', icon: TrendingUp },
  { id: 'variavel', label: 'Custo Variável', icon: TrendingDown },
  { id: 'evolucao', label: 'Evolução', icon: BarChart3 },
]


export default function Sidebar({ page, setPage }) {
  return (
    <aside style={{ width: 224, minHeight: '100vh', background: '#fff', borderRight: '1px solid #E8E8E2', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ background: '#0D0D0D', padding: '20px 20px 18px', borderBottom: '1px solid #222' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ChefHat size={18} color="#97A624" />
          <div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>Quintal do Espeto</div>
            <div style={{ color: '#97A624', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>Financeiro</div>
          </div>
        </div>
      </div>

      {/* Nav principal */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E9E8E', padding: '8px 10px 6px' }}>
          Módulos
        </div>
        {NAV.map(({ id, label, icon: Icon }) => {
          const ativo = page === id
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: ativo ? '#0D0D0D' : 'transparent',
                color: ativo ? '#fff' : '#4A4A3A',
                fontSize: 13.5,
                fontWeight: ativo ? 600 : 400,
                textAlign: 'left',
                marginBottom: 2,
                transition: 'all 0.12s',
                position: 'relative',
              }}
            >
              {ativo && (
                <span style={{ position: 'absolute', left: 10, width: 6, height: 6, borderRadius: '50%', background: '#97A624', flexShrink: 0 }} />
              )}
              <span style={{ marginLeft: ativo ? 14 : 0, display: 'flex', alignItems: 'center' }}>
                <Icon size={15} />
              </span>
              {label}
            </button>
          )
        })}


      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #E8E8E2', fontSize: 11, color: '#B0B0A0' }}>
        v1.0 · dados simulados
      </div>
    </aside>
  )
}
