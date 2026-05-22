import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { loadContas, loadCustosFixos, loadHistorico } from '../data/loader.js'

const FinanceiroCtx = createContext(null)

export function FinanceiroProvider({ children }) {
  const [contas, setContas] = useState([])
  const [custosFixos, setCustosFixos] = useState([])
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtros globais
  const [lojaFiltro, setLojaFiltro] = useState('Todas')
  const [mesFiltro, setMesFiltro] = useState('2025-03')

  useEffect(() => {
    Promise.all([loadContas(), loadCustosFixos(), loadHistorico()])
      .then(([c, cf, h]) => {
        setContas(c)
        setCustosFixos(cf)
        setHistorico(h)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Dados filtrados por loja
  const contasFiltradas = useMemo(() => {
    let r = contas
    if (lojaFiltro !== 'Todas') r = r.filter((c) => c.centro === lojaFiltro)
    return r
  }, [contas, lojaFiltro])

  const custosFiltrados = useMemo(() => {
    let r = custosFixos
    if (lojaFiltro !== 'Todas') r = r.filter((c) => c.loja === lojaFiltro)
    if (mesFiltro) r = r.filter((c) => c.mes === mesFiltro)
    return r
  }, [custosFixos, lojaFiltro, mesFiltro])

  const historicoFiltrado = useMemo(() => {
    if (lojaFiltro === 'Todas') return historico
    return historico.filter((h) => h.loja === lojaFiltro)
  }, [historico, lojaFiltro])

  // KPIs derivados
  const kpis = useMemo(() => {
    const hoje = new Date()
    const em7dias = new Date(hoje.getTime() + 7 * 86400000)
    const totalAPagar = contasFiltradas
      .filter((c) => c.status !== 'pago')
      .reduce((s, c) => s + c.valor, 0)
    const totalVencido = contasFiltradas
      .filter((c) => c.status === 'vencido')
      .reduce((s, c) => s + c.valor, 0)
    const aVencer7d = contasFiltradas
      .filter((c) => {
        if (c.status === 'pago') return false
        const d = new Date(c.vencimento)
        return d >= hoje && d <= em7dias
      })
      .reduce((s, c) => s + c.valor, 0)
    const orcadoTotal = custosFiltrados.reduce((s, c) => s + c.orcado, 0)
    const realizadoTotal = custosFiltrados.reduce((s, c) => s + c.realizado, 0)
    const variacaoOrcado = orcadoTotal > 0 ? ((realizadoTotal - orcadoTotal) / orcadoTotal) * 100 : 0

    return { totalAPagar, totalVencido, aVencer7d, orcadoTotal, realizadoTotal, variacaoOrcado }
  }, [contasFiltradas, custosFiltrados])

  return (
    <FinanceiroCtx.Provider value={{
      loading, error,
      contas, custosFixos, historico,
      contasFiltradas, custosFiltrados, historicoFiltrado,
      lojaFiltro, setLojaFiltro,
      mesFiltro, setMesFiltro,
      kpis,
    }}>
      {children}
    </FinanceiroCtx.Provider>
  )
}

export function useFinanceiro() {
  const ctx = useContext(FinanceiroCtx)
  if (!ctx) throw new Error('useFinanceiro fora do FinanceiroProvider')
  return ctx
}
