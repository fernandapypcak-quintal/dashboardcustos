import React, { useState } from 'react'
import { FinanceiroProvider, useFinanceiro } from './hooks/useFinanceiro.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Home from './components/pages/Home.jsx'
import ContasPagar from './components/pages/ContasPagar.jsx'
import CustoFixo from './components/pages/CustoFixo.jsx'
import CustoVariavel from './components/pages/CustoVariavel.jsx'
import Evolucao from './components/pages/Evolucao.jsx'

const PAGES = {
  home:     <Home />,
  contas:   <ContasPagar />,
  custos:   <CustoFixo />,
  variavel: <CustoVariavel />,
  evolucao: <Evolucao />,
}

function LoadingScreen() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#8A8A7A' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #E8E8E2', borderTopColor: '#0D0D0D', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 13 }}>Carregando dados...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function ErrorScreen({ error }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0D0D0D' }}>Erro ao carregar dados</div>
      <div style={{ fontSize: 13, color: '#8C1414', background: '#F5DCDC', padding: '10px 16px', borderRadius: 8, maxWidth: 480, textAlign: 'center' }}>
        {error}
      </div>
      <div style={{ fontSize: 12, color: '#8A8A7A', maxWidth: 480, textAlign: 'center', lineHeight: 1.6 }}>
        Verifique se a URL do Apps Script está correta em <code style={{ background: '#F0F0E8', padding: '1px 6px', borderRadius: 4 }}>src/data/config.js</code> e se o Web App está publicado como <strong>Qualquer pessoa</strong>.
      </div>
      <button onClick={() => window.location.reload()} style={{ marginTop: 8, padding: '8px 20px', background: '#0D0D0D', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
        Tentar novamente
      </button>
    </div>
  )
}

function AppInner() {
  const [page, setPage] = useState('home')
  const { loading, error } = useFinanceiro()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF8' }}>
      <Sidebar page={page} setPage={setPage} />
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {loading ? <LoadingScreen /> : error ? <ErrorScreen error={error} /> : (PAGES[page] || PAGES.home)}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <FinanceiroProvider>
      <AppInner />
    </FinanceiroProvider>
  )
}
