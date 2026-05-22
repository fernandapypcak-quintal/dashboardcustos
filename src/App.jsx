import React, { useState } from 'react'
import { FinanceiroProvider } from './hooks/useFinanceiro.jsx'
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

export default function App() {
  const [page, setPage] = useState('home')

  return (
    <FinanceiroProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF8' }}>
        <Sidebar page={page} setPage={setPage} />
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          {PAGES[page] || PAGES.home}
        </main>
      </div>
    </FinanceiroProvider>
  )
}
