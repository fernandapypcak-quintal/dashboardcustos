import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import {
  loadContas, loadCustosFixos, loadCustosVariaveis,
  loadHistorico, loadHistoricoVariavel,
  loadHistoricoCatFixo, loadHistoricoCatVariavel,
  loadHistoricoDetalheFixo, loadHistoricoDetalheVariavel,
} from '../data/loader.js'

const FinanceiroCtx = createContext(null)

const ORDEM_MESES = [
  'Jan/24','Fev/24','Mar/24','Abr/24','Mai/24','Jun/24','Jul/24','Ago/24','Set/24','Out/24','Nov/24','Dez/24',
  'Jan/25','Fev/25','Mar/25','Abr/25','Mai/25','Jun/25','Jul/25','Ago/25','Set/25','Out/25','Nov/25','Dez/25',
  'Jan/26','Fev/26','Mar/26','Abr/26','Mai/26','Jun/26','Jul/26','Ago/26','Set/26','Out/26','Nov/26','Dez/26',
]

export function sortMesLabel(arr) {
  return [...arr].sort((a, b) => {
    const ia = ORDEM_MESES.indexOf(a), ib = ORDEM_MESES.indexOf(b)
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
  })
}

function mesLabelDeYYYYMM(m) {
  if (!m || m.length < 7) return m
  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const [a, mo] = m.split('-')
  return `${MESES[parseInt(mo) - 1]}/${a.substring(2)}`
}

function normalizarMesLabel(raw) {
  if (!raw) return ''
  const s = String(raw).trim()
  if (/^[A-Za-zÀ-ú]{3}\/\d{2}$/.test(s)) return s
  if (/^\d{4}-\d{2}$/.test(s)) return mesLabelDeYYYYMM(s)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return mesLabelDeYYYYMM(s.substring(0, 7))
  const d = new Date(s)
  if (!isNaN(d.getTime())) return mesLabelDeYYYYMM(d.toISOString().substring(0, 7))
  return s
}

// Tipos disponíveis e seus grupos
export const TIPOS_GRUPO = {
  operacional: ['Fixo', 'Variável'],
  comCapex:    ['Fixo', 'Variável', 'Investimento'],
  tudo:        ['Fixo', 'Variável', 'Investimento', 'Fora'],
}

export function FinanceiroProvider({ children }) {
  const [contas,               setContas]               = useState([])
  const [custosFixos,          setCustosFixos]          = useState([])
  const [custosVariaveis,      setCustosVariaveis]      = useState([])
  const [historico,            setHistorico]            = useState([])
  const [historicoVariavel,    setHistoricoVariavel]    = useState([])
  const [historicoCatFixo,     setHistoricoCatFixo]     = useState([])
  const [historicoCatVariavel, setHistoricoCatVariavel] = useState([])
  const [historicoDetalheFixo,     setHistoricoDetalheFixo]     = useState([])
  const [historicoDetalheVariavel, setHistoricoDetalheVariavel] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const [lojaFiltro,  setLojaFiltro]  = useState('Todas')
  const [mesFiltro,   setMesFiltro]   = useState('')
  const [tipoFiltro,  setTipoFiltro]  = useState('operacional') // operacional | comCapex | tudo

  useEffect(() => {
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
      const safe  = x => Array.isArray(x) ? x : []
      const normH = arr => safe(arr).map(x => ({ ...x, mes: normalizarMesLabel(x.mes) }))

      const hN   = normH(h)
      const hvN  = normH(hv)
      const hcfN = normH(hcf)
      const hcvN = normH(hcv)

      const todosMeses = sortMesLabel([...new Set([...hN, ...hvN].map(x => x.mes).filter(Boolean))])
      const mesPadrao  = todosMeses[todosMeses.length - 1] || ''

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

      console.log('[Financeiro] OK — meses:', todosMeses, '| padrão:', mesPadrao)
    })
    .catch(e => { console.error('[Financeiro] Erro:', e); setError(e.message) })
    .finally(() => setLoading(false))
  }, [])

  // Tipos ativos conforme filtro
  const tiposAtivos = TIPOS_GRUPO[tipoFiltro] || TIPOS_GRUPO.operacional

  // Histórico filtrado por loja E tipos ativos
  const historicoFiltrado = useMemo(() => {
    let r = lojaFiltro === 'Todas' ? historico : historico.filter(h => h.loja === lojaFiltro)
    // historico já é só Fixo — se tipoFiltro não inclui Fixo, retorna vazio
    if (!tiposAtivos.includes('Fixo')) return []
    return r
  }, [historico, lojaFiltro, tiposAtivos])

  const historicoVariavelFiltrado = useMemo(() => {
    let r = lojaFiltro === 'Todas' ? historicoVariavel : historicoVariavel.filter(h => h.loja === lojaFiltro)
    if (!tiposAtivos.includes('Variável')) return []
    return r
  }, [historicoVariavel, lojaFiltro, tiposAtivos])

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

  const contasFiltradas = useMemo(() => {
    let r = contas
    if (lojaFiltro !== 'Todas') r = r.filter(c => c.centro === lojaFiltro)
    // Filtra por tipos ativos (contas têm campo tipo vindo do Apps Script)
    if (!tiposAtivos.includes('Fora')) {
      r = r.filter(c => c.tipo !== 'Fora')
    }
    return r
  }, [contas, lojaFiltro, tiposAtivos])

  const custosFiltrados = useMemo(() => {
    let r = custosFixos
    if (lojaFiltro !== 'Todas') r = r.filter(c => c.loja === lojaFiltro)
    if (mesFiltro) r = r.filter(c => normalizarMesLabel(c.mes) === mesFiltro)
    return r
  }, [custosFixos, lojaFiltro, mesFiltro])

  const custosVariaveisFiltrados = useMemo(() => {
    let r = custosVariaveis
    if (lojaFiltro !== 'Todas') r = r.filter(c => c.loja === lojaFiltro)
    if (mesFiltro) r = r.filter(c => normalizarMesLabel(c.mes) === mesFiltro)
    return r
  }, [custosVariaveis, lojaFiltro, mesFiltro])

  const mesesDisponiveis = useMemo(() => {
    const set = new Set([
      ...historico.map(h => h.mes),
      ...historicoVariavel.map(h => h.mes),
    ].filter(Boolean))
    return sortMesLabel(Array.from(set)).map(m => ({ value: m, label: m }))
  }, [historico, historicoVariavel])

  const kpis = useMemo(() => {
    const hoje = new Date(); hoje.setHours(0,0,0,0)
    const em7d = new Date(hoje.getTime() + 7 * 86400000)
    const totalAPagar  = contasFiltradas.filter(c => c.status !== 'pago').reduce((s,c) => s+c.valor, 0)
    const totalVencido = contasFiltradas.filter(c => c.status === 'vencido').reduce((s,c) => s+c.valor, 0)
    const aVencer7d    = contasFiltradas.filter(c => {
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
      tipoFiltro, setTipoFiltro,
      tiposAtivos,
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
