import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import {
  loadContas, loadCustosFixos, loadCustosVariaveis,
  loadHistorico, loadHistoricoVariavel,
  loadHistoricoCatFixo, loadHistoricoCatVariavel,
  loadHistoricoDetalheFixo, loadHistoricoDetalheVariavel,
} from '../data/loader.js'

const FinanceiroCtx = createContext(null)

// Ordem cronológica completa para sorting
const ORDEM_MESES = [
  'Jan/24','Fev/24','Mar/24','Abr/24','Mai/24','Jun/24',
  'Jul/24','Ago/24','Set/24','Out/24','Nov/24','Dez/24',
  'Jan/25','Fev/25','Mar/25','Abr/25','Mai/25','Jun/25',
  'Jul/25','Ago/25','Set/25','Out/25','Nov/25','Dez/25',
  'Jan/26','Fev/26','Mar/26','Abr/26','Mai/26','Jun/26',
  'Jul/26','Ago/26','Set/26','Out/26','Nov/26','Dez/26',
]

export function sortMesLabel(arr) {
  return [...arr].sort((a, b) => {
    const ia = ORDEM_MESES.indexOf(a)
    const ib = ORDEM_MESES.indexOf(b)
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
  })
}

// Converte YYYY-MM → Mmm/AA
function mesLabelDeYYYYMM(m) {
  if (!m || m.length < 7) return m
  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const [a, mo] = m.split('-')
  return `${MESES[parseInt(mo) - 1]}/${a.substring(2)}`
}

// Normaliza qualquer formato de mês para Mmm/AA
function normalizarMesLabel(raw) {
  if (!raw) return ''
  const s = String(raw).trim()

  // Já no formato Mmm/AA
  if (/^[A-Za-zÀ-ú]{3}\/\d{2}$/.test(s)) return s

  // YYYY-MM
  if (/^\d{4}-\d{2}$/.test(s)) return mesLabelDeYYYYMM(s)

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return mesLabelDeYYYYMM(s.substring(0, 7))

  // Date object serializado
  const d = new Date(s)
  if (!isNaN(d.getTime())) return mesLabelDeYYYYMM(d.toISOString().substring(0, 7))

  return s
}

export function FinanceiroProvider({ children }) {
  const [contas,               setContas]               = useState([])
  const [custosFixos,          setCustosFixos]          = useState([])
  const [custosVariaveis,      setCustosVariaveis]      = useState([])
  const [historico,            setHistorico]            = useState([])
  const [historicoVariavel,    setHistoricoVariavel]    = useState([])
  const [historicoCatFixo,     setHistoricoCatFixo]     = useState([])
  const [historicoCatVariavel, setHistoricoCatVariavel] = useState([])
  const [historicoDetalheFixo,    setHistoricoDetalheFixo]    = useState([])
  const [historicoDetalheVariavel,setHistoricoDetalheVariavel]= useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const [lojaFiltro, setLojaFiltro] = useState('Todas')
  const [mesFiltro,  setMesFiltro]  = useState('') // Mmm/AA ex: "Mai/26"

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
      loadHistoricoDetalheFixo(),
      loadHistoricoDetalheVariavel(),
    ]).then(([c, cf, cv, h, hv, hcf, hcv, hdf, hdv]) => {

      // Garante que tudo é array antes de processar
      const safe = (x) => Array.isArray(x) ? x : []

      // Normaliza o campo mes em históricos para Mmm/AA
      const normH = arr => safe(arr).map(x => ({ ...x, mes: normalizarMesLabel(x.mes) }))

      const hN   = normH(h)
      const hvN  = normH(hv)
      const hcfN = normH(hcf)
      const hcvN = normH(hcv)

      // Mês padrão = mais recente disponível
      const todosMeses = sortMesLabel([
        ...new Set([...hN, ...hvN].map(x => x.mes).filter(Boolean))
      ])
      const mesPadrao = todosMeses[todosMeses.length - 1] || ''

      console.log('[Financeiro] Meses disponíveis:', todosMeses)
      console.log('[Financeiro] Mês padrão:', mesPadrao)

      setContas(safe(c))
      setCustosFixos(safe(cf))
      setCustosVariaveis(safe(cv))
      setHistorico(hN)
      setHistoricoVariavel(hvN)
      setHistoricoCatFixo(hcfN)
      setHistoricoCatVariavel(hcvN)
      setHistoricoDetalheFixo(normH(hdf))
      setHistoricoDetalheVariavel(normH(hdv))
      setMesFiltro(mesPadrao)
    })
    .catch(e => { console.error('[Financeiro] Erro:', e); setError(e.message) })
    .finally(() => setLoading(false))
  }, [])

  // ── Filtros ────────────────────────────────────────────────
  // Contas não filtram por mês
  const contasFiltradas = useMemo(() => {
    if (lojaFiltro === 'Todas') return contas
    return contas.filter(c => c.centro === lojaFiltro)
  }, [contas, lojaFiltro])

  // Histórico filtrado por loja
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

  const historicoDetalheFixoFiltrado = useMemo(() => (
    lojaFiltro === 'Todas' ? historicoDetalheFixo : historicoDetalheFixo.filter(h => h.loja === lojaFiltro)
  ), [historicoDetalheFixo, lojaFiltro])

  const historicoDetalheVariavelFiltrado = useMemo(() => (
    lojaFiltro === 'Todas' ? historicoDetalheVariavel : historicoDetalheVariavel.filter(h => h.loja === lojaFiltro)
  ), [historicoDetalheVariavel, lojaFiltro])

  // Custos filtrados por loja E por mês (usando mes_label)
  const custosFiltrados = useMemo(() => {
    let r = custosFixos
    if (lojaFiltro !== 'Todas') r = r.filter(c => c.loja === lojaFiltro)
    // custos têm campo mes em YYYY-MM, converte mesFiltro para comparar
    if (mesFiltro) {
      r = r.filter(c => normalizarMesLabel(c.mes) === mesFiltro)
    }
    return r
  }, [custosFixos, lojaFiltro, mesFiltro])

  const custosVariaveisFiltrados = useMemo(() => {
    let r = custosVariaveis
    if (lojaFiltro !== 'Todas') r = r.filter(c => c.loja === lojaFiltro)
    if (mesFiltro) {
      r = r.filter(c => normalizarMesLabel(c.mes) === mesFiltro)
    }
    return r
  }, [custosVariaveis, lojaFiltro, mesFiltro])

  // Meses disponíveis — ordenados cronologicamente, formato Mmm/AA
  const mesesDisponiveis = useMemo(() => {
    const set = new Set([
      ...historico.map(h => h.mes),
      ...historicoVariavel.map(h => h.mes),
    ].filter(Boolean))
    return sortMesLabel(Array.from(set)).map(m => ({ value: m, label: m }))
  }, [historico, historicoVariavel])

  // ── KPIs ────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const hoje = new Date(); hoje.setHours(0,0,0,0)
    const em7d = new Date(hoje.getTime() + 7 * 86400000)
    const totalAPagar    = contasFiltradas.filter(c => c.status !== 'pago').reduce((s,c) => s+c.valor, 0)
    const totalVencido   = contasFiltradas.filter(c => c.status === 'vencido').reduce((s,c) => s+c.valor, 0)
    const aVencer7d      = contasFiltradas.filter(c => {
      if (c.status === 'pago') return false
      const d = new Date(c.vencimento)
      return d >= hoje && d <= em7d
    }).reduce((s,c) => s+c.valor, 0)
    return { totalAPagar, totalVencido, aVencer7d }
  }, [contasFiltradas])

  return (
    <FinanceiroCtx.Provider value={{
      loading, error,
      contas, custosFixos, custosVariaveis,
      historico, historicoVariavel, historicoCatFixo, historicoCatVariavel,
      contasFiltradas, custosFiltrados, custosVariaveisFiltrados,
      historicoFiltrado, historicoVariavelFiltrado,
      historicoCatFixoFiltrado, historicoCatVariavelFiltrado,
      historicoDetalheFixoFiltrado, historicoDetalheVariavelFiltrado,
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
