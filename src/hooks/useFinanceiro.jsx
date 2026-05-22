import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { loadContas, loadCustosFixos, loadCustosVariaveis, loadHistorico, loadHistoricoVariavel } from '../data/loader.js'

const FinanceiroCtx = createContext(null)

export function FinanceiroProvider({ children }) {
  const [contas, setContas] = useState([])
  const [custosFixos, setCustosFixos] = useState([])
  const [custosVariaveis, setCustosVariaveis] = useState([])
  const [historico, setHistorico] = useState([])
  const [historicoVariavel, setHistoricoVariavel] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [lojaFiltro, setLojaFiltro] = useState('Todas')
  const [mesFiltro, setMesFiltro] = useState('2025-03')

  useEffect(() => {
    Promise.all([
      loadContas(),
      loadCustosFixos(),
      loadCustosVariaveis(),
      loadHistorico(),
      loadHistoricoVariavel(),
    ])
      .then(([c, cf, cv, h, hv]) => {
        setContas(c)
        setCustosFixos(cf)
        setCustosVariaveis(cv)
        setHistorico(h)
        setHistoricoVariavel(hv)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

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

  const custosVariaveisFiltrados = useMemo(() => {
    let r = custosVariaveis
    if (lojaFiltro !== 'Todas') r = r.filter((c) => c.loja === lojaFiltro)
    if (mesFiltro) r = r.filter((c) => c.mes === mesFiltro)
    return r
  }, [custosVariaveis, lojaFiltro, mesFiltro])

  const historicoFiltrado = useMemo(() => {
    if (lojaFiltro === 'Todas') return historico
    return historico.filter((h) => h.loja === lojaFiltro)
  }, [historico, lojaFiltro])

  const historicoVariavelFiltrado = useMemo(() => {
    if (lojaFiltro === 'Todas') return historicoVariavel
    return historicoVariavel.filter((h) => h.loja === lojaFiltro)
  }, [historicoVariavel, lojaFiltro])

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
      contas, custosFixos, custosVariaveis, historico, historicoVariavel,
      contasFiltradas, custosFiltrados, custosVariaveisFiltrados,
      historicoFiltrado, historicoVariavelFiltrado,
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
