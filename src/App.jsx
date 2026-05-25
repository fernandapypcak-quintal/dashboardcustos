import React, { useState } from 'react'
import { FinanceiroProvider, useFinanceiro } from './hooks/useFinanceiro.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Home from './components/pages/Home.jsx'
import ContasPagar from './components/pages/ContasPagar.jsx'
import CustoFixo from './components/pages/CustoFixo.jsx'
import CustoVariavel from './components/pages/CustoVariavel.jsx'
import Evolucao from './components/pages/Evolucao.jsx'

const PAGES = {
  home:     Home,
  contas:   ContasPagar,
  custos:   CustoFixo,
  variavel: CustoVariavel,
  evolucao: Evolucao,
}

function LoadingScreen() {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14 }}>
      <div style={{ width:28, height:28, border:'2px solid #E8E8E8', borderTopColor:'#1a1a1a', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
      <div style={{ fontSize:13, color:'#999' }}>Carregando dados...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function ErrorScreen({ error }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, padding:40 }}>
      <div style={{ fontSize:28 }}>⚠️</div>
      <div style={{ fontSize:15, fontWeight:600 }}>Erro ao carregar dados</div>
      <div style={{ fontSize:13, color:'#dc2626', background:'#FEF2F2', padding:'10px 16px', borderRadius:8, maxWidth:480, textAlign:'center' }}>{error}</div>
      <div style={{ fontSize:12, color:'#999', maxWidth:480, textAlign:'center', lineHeight:1.7 }}>
        Verifique se a URL do Apps Script está correta em <code style={{ background:'#F5F5F5', padding:'1px 6px', borderRadius:4 }}>src/data/config.js</code> e se o Web App está publicado como <strong>Qualquer pessoa</strong>.
      </div>
      <button onClick={()=>window.location.reload()} style={{ padding:'8px 20px', background:'#1a1a1a', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:500 }}>
        Tentar novamente
      </button>
    </div>
  )
}

function AppInner() {
  const [page, setPage] = useState('home')
  const [collapsed, setCollapsed] = useState(false)
  const { loading, error } = useFinanceiro()
  const PageComponent = PAGES[page] || PAGES.home

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#fff' }}>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{ flex:1, minWidth:0, overflowY:'auto', display:'flex', flexDirection:'column' }}>
        {loading ? <LoadingScreen /> : error ? <ErrorScreen error={error}/> : <PageComponent />}
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
