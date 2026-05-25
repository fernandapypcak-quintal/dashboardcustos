import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import {
  loadContas, loadCustosFixos, loadCustosVariaveis,
  loadHistorico, loadHistoricoVariavel,
  loadHistoricoCatFixo, loadHistoricoCatVariavel,
} from '../data/loader.js'

const FinanceiroCtx = createContext(null)

export function FinanceiroProvider({ children }) {
  const [contas,              setContas]              = useState([])
  const [custosFixos,         setCustosFixos]         = useState([])
  const [custosVariaveis,     setCustosVariaveis]     = useState([])
  const [historico,           setHistorico]           = useState([])
  const [historicoVariavel,   setHistoricoVariavel]   = useState([])
  const [historicoCatFixo,    setHistoricoCatFixo]    = useState([])
  const [historicoCatVariavel,setHistoricoCatVariavel]= useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const [lojaFiltro, setLojaFiltro] = useState('Todas')
  const [mesFiltro,  setMesFiltro]  = useState('')  // vazio = todos os meses

  useEffect(() => {
    console.log('[Financeiro] Iniciando carregamento...')
    Promise.all([
      loadContas(),
      loadCustosFixos(),
      loadCustosVariaveis(),
      loadHistorico(),
      loadHistoricoVariavel(),
      loadHistoricoCatFixo(),
      loadHistoricoCatVariavel(),
    ]).then(([c, cf, cv, h, hv, hcf, hcv]) => {
      console.log('[Financeiro] Dados recebidos:', {
        contas: c.length,
        custosFixos: cf.length,
        custosVariaveis: cv.length,
        historico: h.length,
        historicoVariavel: hv.length,
        historicoCatFixo: hcf.length,
        historicoCatVariavel: hcv.length,
      })

      // Define o mês padrão como o mais recente disponível
      const mesesDisponiveis = [...new Set([...cf, ...cv].map(x => x.mes))].sort()
      const mesPadrao = mesesDisponiveis[mesesDisponiveis.length - 1] || ''

      setContas(c)
      setCustosFixos(cf)
      setCustosVariaveis(cv)
      setHistorico(h)
      setHistoricoVariavel(hv)
      setHistoricoCatFixo(hcf)
      setHistoricoCatVariavel(hcv)
      setMesFiltro(mesPadrao)
    })
    .catch((e) => {
      console.error('[Financeiro] Erro:', e)
      setError(e.message)
    })
    .finally(() => setLoading(false))
  }, [])

  // ── Filtros ──────────────────────────────────────────────────
  const contasFiltradas = useMemo(() => {
    let r = contas
    if (lojaFiltro !== 'Todas') r = r.filter(c => c.centro === lojaFiltro)
    return r
  }, [contas, lojaFiltro])

  const custosFiltrados = useMemo(() => {
    let r = custosFixos
    if (lojaFiltro !== 'Todas') r = r.filter(c => c.loja === lojaFiltro)
    if (mesFiltro) r = r.filter(c => c.mes === mesFiltro)
    return r
  }, [custosFixos, lojaFiltro, mesFiltro])

  const custosVariaveisFiltrados = useMemo(() => {
    let r = custosVariaveis
    if (lojaFiltro !== 'Todas') r = r.filter(c => c.loja === lojaFiltro)
    if (mesFiltro) r = r.filter(c => c.mes === mesFiltro)
    return r
  }, [custosVariaveis, lojaFiltro, mesFiltro])

  const historicoFiltrado = useMemo(() => (
    lojaFiltro === 'Todas' ? historico : historico.filter(h => h.loja === lojaFiltro)
  ), [historico, lojaFiltro])

  const historicoVariavelFiltrado = useMemo(() => (
    lojaFiltro === 'Todas' ? historicoVariavel : historicoVariavel.filter(h => h.loja === lojaFiltro)
  ), [historicoVariavel, lojaFiltro])

  const historicoCatFixoFiltrado = useMemo(() => (
    lojaFiltro === 'Todas' ? historicoCatFixo : historicoCatFixo.filter(h => h.loja === lojaFiltro)
  ), [historicoCatFixo, lojaFiltro])

  const historicoCatVariavelFiltrado = useMemo(() => (
    lojaFiltro === 'Todas' ? historicoCatVariavel : historicoCatVariavel.filter(h => h.loja === lojaFiltro)
  ), [historicoCatVariavel, lojaFiltro])

  // ── Meses disponíveis (para selector) ───────────────────────
  const mesesDisponiveis = useMemo(() => {
    const set = new Set([...custosFixos, ...custosVariaveis].map(x => x.mes).filter(Boolean))
    return [...set].sort()
  }, [custosFixos, custosVariaveis])

  // ── KPIs ─────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const hoje   = new Date(); hoje.setHours(0,0,0,0)
    const em7d   = new Date(hoje.getTime() + 7 * 86400000)
    const totalAPagar   = contasFiltradas.filter(c => c.status !== 'pago').reduce((s,c) => s+c.valor, 0)
    const totalVencido  = contasFiltradas.filter(c => c.status === 'vencido').reduce((s,c) => s+c.valor, 0)
    const aVencer7d     = contasFiltradas.filter(c => {
      if (c.status === 'pago') return false
      const d = new Date(c.vencimento)
      return d >= hoje && d <= em7d
    }).reduce((s,c) => s+c.valor, 0)
    const orcadoTotal    = custosFiltrados.reduce((s,c) => s+c.orcado,    0)
    const realizadoTotal = custosFiltrados.reduce((s,c) => s+c.realizado, 0)
    const variacaoOrcado = orcadoTotal > 0 ? ((realizadoTotal - orcadoTotal) / orcadoTotal) * 100 : 0
    return { totalAPagar, totalVencido, aVencer7d, orcadoTotal, realizadoTotal, variacaoOrcado }
  }, [contasFiltradas, custosFiltrados])

  return (
    <FinanceiroCtx.Provider value={{
      loading, error,
      contas, custosFixos, custosVariaveis,
      historico, historicoVariavel, historicoCatFixo, historicoCatVariavel,
      contasFiltradas, custosFiltrados, custosVariaveisFiltrados,
      historicoFiltrado, historicoVariavelFiltrado,
      historicoCatFixoFiltrado, historicoCatVariavelFiltrado,
      lojaFiltro, setLojaFiltro,
      mesFiltro,  setMesFiltro,
      mesesDisponiveis,
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
