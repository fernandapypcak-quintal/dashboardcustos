import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { loadContas, loadHistoricoUnificado, loadHistoricoCatUnificado, loadHistoricoDetalheTodos } from '../data/loader.js'

const FinanceiroCtx = createContext(null)

const ORDEM_MESES = [
  'Jan/24','Fev/24','Mar/24','Abr/24','Mai/24','Jun/24','Jul/24','Ago/24','Set/24','Out/24','Nov/24','Dez/24',
  'Jan/25','Fev/25','Mar/25','Abr/25','Mai/25','Jun/25','Jul/25','Ago/25','Set/25','Out/25','Nov/25','Dez/25',
  'Jan/26','Fev/26','Mar/26','Abr/26','Mai/26','Jun/26','Jul/26','Ago/26','Set/26','Out/26','Nov/26','Dez/26',
]

export function sortMesLabel(arr) {
  return [...arr].sort((a,b) => {
    const ia = ORDEM_MESES.indexOf(a), ib = ORDEM_MESES.indexOf(b)
    return (ia<0?999:ia) - (ib<0?999:ib)
  })
}

function normalizarMes(raw) {
  if (!raw) return ''
  const s = String(raw).trim()
  if (/^[A-Za-zÀ-ú]{3}\/\d{2}$/.test(s)) return s
  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  if (/^\d{4}-\d{2}/.test(s)) {
    const [a,m] = s.split('-')
    return `${MESES[parseInt(m)-1]}/${a.substring(2)}`
  }
  const d = new Date(s)
  if (!isNaN(d.getTime())) {
    return `${MESES[d.getMonth()]}/${String(d.getFullYear()).substring(2)}`
  }
  return s
}

// Grupos de tipos
export const TIPO_GRUPOS = {
  operacional: ['Fixo','Variável'],
  comCapex:    ['Fixo','Variável','Investimento'],
  tudo:        ['Fixo','Variável','Investimento','Fora'],
}

export function FinanceiroProvider({ children }) {
  // Dados brutos — carregados uma vez
  const [contas,          setContas]          = useState([])
  const [historicoRaw,    setHistoricoRaw]    = useState([])
  const [historicoCatRaw, setHistoricoCatRaw] = useState([])
  const [historicoDetRaw, setHistoricoDetRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Filtros
  const [lojaFiltro, setLojaFiltro] = useState('Todas')
  const [mesFiltro,  setMesFiltro]  = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('operacional')

  useEffect(() => {
    Promise.all([
      loadContas(),
      loadHistoricoUnificado(),
      loadHistoricoCatUnificado(),
      loadHistoricoDetalheTodos(),
    ]).then(([c, h, hc, hd]) => {
      const safe  = x => Array.isArray(x) ? x : []
      const normH = arr => safe(arr).map(x => ({ ...x, mes: normalizarMes(x.mes) }))

      const hN  = normH(h)
      const hcN = normH(hc)
      const hdN = normH(hd)

      const todosMeses = sortMesLabel([...new Set(hN.map(x=>x.mes).filter(Boolean))])
      const mesPadrao  = todosMeses[todosMeses.length-1] || ''

      setContas(safe(c))
      setHistoricoRaw(hN)
      setHistoricoCatRaw(hcN)
      setHistoricoDetRaw(hdN)
      setMesFiltro(mesPadrao)

      console.log('[Financeiro] Carregado —', hN.length, 'entradas históricas | meses:', todosMeses)
    })
    .catch(e => { console.error('[Financeiro] Erro:', e); setError(e.message) })
    .finally(() => setLoading(false))
  }, [])

  const tiposAtivos = TIPO_GRUPOS[tipoFiltro] || TIPO_GRUPOS.operacional

  // ── Helpers de filtro ────────────────────────────────────────
  const filtrarHist = (arr) => {
    let r = arr.filter(h => tiposAtivos.includes(h.tipo))
    if (lojaFiltro !== 'Todas') r = r.filter(h => h.loja === lojaFiltro)
    return r
  }

  // ── historico agregado (para gráficos de evolução) ───────────
  // Separa em fixo/variável/capex/fora para os gráficos existentes
  const historicoFiltrado = useMemo(() => {
    return filtrarHist(historicoRaw)
      .filter(h => h.tipo === 'Fixo' || (tiposAtivos.includes('Fixo') && h.tipo === 'Fixo'))
      .reduce((acc, h) => {
        const key = h.mes + '||' + h.loja
        if (!acc[key]) acc[key] = { mes:h.mes, loja:h.loja, total_realizado:0 }
        acc[key].total_realizado += h.total_realizado
        return acc
      }, {})
  }, [historicoRaw, lojaFiltro, tiposAtivos])

  // Converte de objeto para array ordenado
  const historicoFiltradoArr = useMemo(() =>
    sortMesLabel([...new Set(Object.values(historicoFiltrado).map(x=>x.mes))])
      .flatMap(mes => Object.values(historicoFiltrado).filter(x=>x.mes===mes))
  , [historicoFiltrado])

  const historicoVariavelFiltrado = useMemo(() => {
    const tiposVar = tiposAtivos.filter(t => t !== 'Fixo')
    let r = historicoRaw.filter(h => tiposVar.includes(h.tipo))
    if (lojaFiltro !== 'Todas') r = r.filter(h => h.loja === lojaFiltro)
    return r.reduce((acc, h) => {
      const key = h.mes + '||' + h.loja
      if (!acc[key]) acc[key] = { mes:h.mes, loja:h.loja, total_realizado:0 }
      acc[key].total_realizado += h.total_realizado
      return acc
    }, {})
  }, [historicoRaw, lojaFiltro, tiposAtivos])

  const historicoVariavelFiltradoArr = useMemo(() =>
    sortMesLabel([...new Set(Object.values(historicoVariavelFiltrado).map(x=>x.mes))])
      .flatMap(mes => Object.values(historicoVariavelFiltrado).filter(x=>x.mes===mes))
  , [historicoVariavelFiltrado])

  // ── historicoCat filtrado ────────────────────────────────────
  const historicoCatFixoFiltrado = useMemo(() => {
    let r = historicoCatRaw.filter(h => h.tipo === 'Fixo')
    if (lojaFiltro !== 'Todas') r = r.filter(h => h.loja === lojaFiltro)
    return r
  }, [historicoCatRaw, lojaFiltro])

  const historicoCatVariavelFiltrado = useMemo(() => {
    const tiposVar = tiposAtivos.filter(t => t !== 'Fixo')
    let r = historicoCatRaw.filter(h => tiposVar.includes(h.tipo))
    if (lojaFiltro !== 'Todas') r = r.filter(h => h.loja === lojaFiltro)
    return r
  }, [historicoCatRaw, lojaFiltro, tiposAtivos])

  // ── historicoDetalhe filtrado ────────────────────────────────
  const historicoDetalheFixoFiltrado = useMemo(() => {
    let r = historicoDetRaw.filter(h => h.tipo === 'Fixo')
    if (lojaFiltro !== 'Todas') r = r.filter(h => h.loja === lojaFiltro)
    return r
  }, [historicoDetRaw, lojaFiltro])

  const historicoDetalheVariavelFiltrado = useMemo(() => {
    const tiposVar = tiposAtivos.filter(t => t !== 'Fixo')
    let r = historicoDetRaw.filter(h => tiposVar.includes(h.tipo))
    if (lojaFiltro !== 'Todas') r = r.filter(h => h.loja === lojaFiltro)
    return r
  }, [historicoDetRaw, lojaFiltro, tiposAtivos])

  // ── Contas ───────────────────────────────────────────────────
  const contasFiltradas = useMemo(() => {
    let r = contas
    if (lojaFiltro !== 'Todas') r = r.filter(c => c.centro === lojaFiltro)
    if (!tiposAtivos.includes('Fora')) r = r.filter(c => c.tipo !== 'Fora')
    return r
  }, [contas, lojaFiltro, tiposAtivos])

  // ── Meses disponíveis ────────────────────────────────────────
  const mesesDisponiveis = useMemo(() => {
    const set = new Set(historicoRaw.map(h=>h.mes).filter(Boolean))
    return sortMesLabel(Array.from(set)).map(m => ({ value:m, label:m }))
  }, [historicoRaw])

  // ── KPIs contas ──────────────────────────────────────────────
  const kpis = useMemo(() => {
    const hoje = new Date(); hoje.setHours(0,0,0,0)
    const em7d = new Date(hoje.getTime()+7*86400000)
    const totalAPagar  = contasFiltradas.filter(c=>c.status!=='pago').reduce((s,c)=>s+c.valor,0)
    const totalVencido = contasFiltradas.filter(c=>c.status==='vencido').reduce((s,c)=>s+c.valor,0)
    const aVencer7d    = contasFiltradas.filter(c=>{
      if (c.status==='pago') return false
      const d=new Date(c.vencimento); return d>=hoje&&d<=em7d
    }).reduce((s,c)=>s+c.valor,0)
    return { totalAPagar, totalVencido, aVencer7d }
  }, [contasFiltradas])

  return (
    <FinanceiroCtx.Provider value={{
      loading, error,
      contas, contasFiltradas,
      historicoFiltrado:        historicoFiltradoArr,
      historicoVariavelFiltrado:historicoVariavelFiltradoArr,
      historicoCatFixoFiltrado,
      historicoCatVariavelFiltrado,
      historicoDetalheFixoFiltrado,
      historicoDetalheVariavelFiltrado,
      lojaFiltro, setLojaFiltro,
      mesFiltro,  setMesFiltro,
      tipoFiltro, setTipoFiltro,
      tiposAtivos,
      mesesDisponiveis,
      kpis,
      // aliases para compatibilidade com páginas antigas
      custosFiltrados:          [],
      custosVariaveisFiltrados: [],
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
