import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import {
  loadContas, loadCustosFixos, loadCustosVariaveis,
  loadHistorico, loadHistoricoVariavel,
  loadHistoricoCatFixo, loadHistoricoCatVariavel,
} from '../data/loader.js'

const FinanceiroCtx = createContext(null)

// Normaliza qualquer formato de mês para YYYY-MM
function normalizarMes(raw) {
  if (!raw) return ''
  const s = String(raw).trim()

  // Já está no formato YYYY-MM
  if (/^\d{4}-\d{2}$/.test(s)) return s

  // Formato YYYY-MM-DD — pega só o prefixo
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 7)

  // Objeto Date serializado ou string com GMT (ex: "Fri May 01 2026 04:00:00 GMT-0300...")
  const d = new Date(s)
  if (!isNaN(d.getTime())) {
    const ano = d.getFullYear()
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    return `${ano}-${mes}`
  }

  return s
}

// Label legível: 2025-05 → Mai/25
function mesLabelDe(mesStr) {
  if (!mesStr || mesStr.length < 7) return mesStr
  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const [ano, mes] = mesStr.split('-')
  return `${MESES[parseInt(mes) - 1]}/${ano.substring(2)}`
}

export function FinanceiroProvider({ children }) {
  const [contas,               setContas]               = useState([])
  const [custosFixos,          setCustosFixos]          = useState([])
  const [custosVariaveis,      setCustosVariaveis]      = useState([])
  const [historico,            setHistorico]            = useState([])
  const [historicoVariavel,    setHistoricoVariavel]    = useState([])
  const [historicoCatFixo,     setHistoricoCatFixo]     = useState([])
  const [historicoCatVariavel, setHistoricoCatVariavel] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const [lojaFiltro, setLojaFiltro] = useState('Todas')
  const [mesFiltro,  setMesFiltro]  = useState('')

  useEffect(() => {
    console.log('[Financeiro] Carregando...')
    Promise.all([
      loadContas(),
      loadCustosFixos(),
      loadCustosVariaveis(),
      loadHistorico(),
      loadHistoricoVariavel(),
      loadHistoricoCatFixo(),
      loadHistoricoCatVariavel(),
    ]).then(([c, cf, cv, h, hv, hcf, hcv]) => {

      // Normaliza campo mes em todos os arrays de custo
      const normCustos = arr => arr.map(x => ({ ...x, mes: normalizarMes(x.mes) }))
      const normHist   = arr => arr.map(x => ({ ...x, mes: normalizarMes(x.mes) }))

      const cfN  = normCustos(cf)
      const cvN  = normCustos(cv)
      const hN   = normHist(h)
      const hvN  = normHist(hv)
      const hcfN = normHist(hcf)
      const hcvN = normHist(hcv)

      // Mês padrão = mais recente disponível
      const mesesDisp = [...new Set([...cfN, ...cvN].map(x => x.mes).filter(Boolean))].sort()
      const mesPadrao = mesesDisp[mesesDisp.length - 1] || ''

      console.log('[Financeiro] OK:', {
        contas: c.length, custosFixos: cfN.length,
        custosVariaveis: cvN.length, mesesDisponiveis: mesesDisp,
        mesPadrao,
      })

      setContas(c)
      setCustosFixos(cfN)
      setCustosVariaveis(cvN)
      setHistorico(hN)
      setHistoricoVariavel(hvN)
      setHistoricoCatFixo(hcfN)
      setHistoricoCatVariavel(hcvN)
      setMesFiltro(mesPadrao)
    })
    .catch(e => { console.error('[Financeiro] Erro:', e); setError(e.message) })
    .finally(() => setLoading(false))
  }, [])

  // ── Filtros ────────────────────────────────────────────────
  // Contas NÃO filtram por mês — são sempre o mês corrente da aba Baixas
  const contasFiltradas = useMemo(() => {
    if (lojaFiltro === 'Todas') return contas
    return contas.filter(c => c.centro === lojaFiltro)
  }, [contas, lojaFiltro])

  const custosFiltrados = useMemo(() => {
    let r = custosFixos
    if (lojaFiltro !== 'Todas') r = r.filter(c => c.loja === lojaFiltro)
    if (mesFiltro)               r = r.filter(c => c.mes === mesFiltro)
    return r
  }, [custosFixos, lojaFiltro, mesFiltro])

  const custosVariaveisFiltrados = useMemo(() => {
    let r = custosVariaveis
    if (lojaFiltro !== 'Todas') r = r.filter(c => c.loja === lojaFiltro)
    if (mesFiltro)               r = r.filter(c => c.mes === mesFiltro)
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

  // Meses disponíveis normalizados com label legível
  const mesesDisponiveis = useMemo(() => {
    const set = new Set([...custosFixos, ...custosVariaveis].map(x => x.mes).filter(Boolean))
    return [...set].sort().map(m => ({ value: m, label: mesLabelDe(m) }))
  }, [custosFixos, custosVariaveis])

  // ── KPIs ────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const hoje  = new Date(); hoje.setHours(0,0,0,0)
    const em7d  = new Date(hoje.getTime() + 7 * 86400000)
    const totalAPagar    = contasFiltradas.filter(c => c.status !== 'pago').reduce((s,c) => s+c.valor, 0)
    const totalVencido   = contasFiltradas.filter(c => c.status === 'vencido').reduce((s,c) => s+c.valor, 0)
    const aVencer7d      = contasFiltradas.filter(c => {
      if (c.status === 'pago') return false
      const d = new Date(c.vencimento); return d >= hoje && d <= em7d
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
