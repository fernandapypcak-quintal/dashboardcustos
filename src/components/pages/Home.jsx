import React, { useMemo } from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import Header from '../layout/Header.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'
import { fmt, fmtPct, fmtData, diasAteVencimento } from '../../utils.js'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

const MONO = { fontFamily: "'JetBrains Mono', monospace", fontFeatureSettings: "'tnum'" }
const ORDEM_MESES = ['Jan/24','Fev/24','Mar/24','Abr/24','Mai/24','Jun/24','Jul/24','Ago/24','Set/24','Out/24','Nov/24','Dez/24',
                     'Jan/25','Fev/25','Mar/25','Abr/25','Mai/25','Jun/25','Jul/25','Ago/25','Set/25','Out/25','Nov/25','Dez/25',
                     'Jan/26','Fev/26','Mar/26','Abr/26','Mai/26','Jun/26','Jul/26','Ago/26','Set/26','Out/26','Nov/26','Dez/26']

function ordenarMeses(arr) {
  return [...arr].sort((a,b) => {
    const ia = ORDEM_MESES.indexOf(a.mes)
    const ib = ORDEM_MESES.indexOf(b.mes)
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
  })
}

function KpiCard({ label, valor, sub, subColor, icon: Icon, dark }) {
  return (
    <div style={{
      background: dark ? '#111' : '#fff',
      border: dark ? 'none' : '1px solid #EBEBEB',
      borderRadius: 10, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: dark ? '#666' : '#999' }}>{label}</span>
        {Icon && <Icon size={13} color={dark ? '#444' : '#CCC'} />}
      </div>
      <div style={{ ...MONO, fontSize: 26, fontWeight: 600, color: dark ? '#fff' : '#111', lineHeight: 1.1 }}>{valor}</div>
      {sub && <div style={{ fontSize: 12, fontWeight: 500, color: subColor || (dark ? '#555' : '#999') }}>{sub}</div>}
    </div>
  )
}

function AlertaItem({ conta }) {
  const dias    = diasAteVencimento(conta.vencimento)
  const vencido = conta.status === 'vencido'
  const cor     = vencido ? '#C0392B' : '#D4A017'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid #F5F5F3' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cor, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conta.nome}</div>
        <div style={{ fontSize: 11, color: '#999', marginTop: 1 }}>{conta.centro}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ ...MONO, fontSize: 13, fontWeight: 600 }}>{fmt(conta.valor)}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: cor, marginTop: 2 }}>
          {vencido ? `${Math.abs(dias)}d atraso` : dias === 0 ? 'hoje' : `${dias}d`}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const {
    contasFiltradas, lojaFiltro, mesFiltro,
    historicoFiltrado, historicoVariavelFiltrado,
    historicoCatFixoFiltrado, historicoCatVariavelFiltrado,
    custosFiltrados, custosVariaveisFiltrados,
  } = useFinanceiro()

  // ── Evolução mensal empilhada ────────────────────────────────
  const evolucao = useMemo(() => {
    const map = {}
    const add = (arr, campo) => arr.forEach(({ mes, total_realizado }) => {
      if (!map[mes]) map[mes] = { mes, fixo: 0, variavel: 0 }
      map[mes][campo] += total_realizado
    })
    add(historicoFiltrado,         'fixo')
    add(historicoVariavelFiltrado, 'variavel')
    return ordenarMeses(Object.values(map)).slice(-6)
  }, [historicoFiltrado, historicoVariavelFiltrado])

  // ── Custo total do mês (do histórico) ────────────────────────
  const { totalMes, totalAnterior, variacaoR, variacaoPct, mesMostrado } = useMemo(() => {
    if (evolucao.length === 0) return { totalMes:0, totalAnterior:0, variacaoR:0, variacaoPct:0, mesMostrado:'' }
    const ult  = evolucao[evolucao.length - 1]
    const prev = evolucao.length > 1 ? evolucao[evolucao.length - 2] : null
    const totalMes      = ult.fixo + ult.variavel
    const totalAnterior = prev ? prev.fixo + prev.variavel : 0
    const variacaoR     = totalMes - totalAnterior
    const variacaoPct   = totalAnterior > 0 ? (variacaoR / totalAnterior) * 100 : 0
    return { totalMes, totalAnterior, variacaoR, variacaoPct, mesMostrado: ult.mes }
  }, [evolucao])

  // ── Maior alta e queda por categoria ────────────────────────
  const { maiorAlta, maiorQueda } = useMemo(() => {
    const todos = [...historicoCatFixoFiltrado, ...historicoCatVariavelFiltrado]
    const cats  = [...new Set(todos.map(h => h.categoria))]
    const meses = ordenarMeses(
      [...new Set(todos.map(h => h.mes))].map(m => ({ mes: m }))
    ).map(x => x.mes)
    const ultMes  = meses[meses.length - 1]
    const prevMes = meses[meses.length - 2]
    if (!ultMes || !prevMes) return { maiorAlta: null, maiorQueda: null }

    const vars = cats.map(cat => {
      const ult  = todos.filter(h => h.mes === ultMes  && h.categoria === cat).reduce((s,h) => s+h.realizado, 0)
      const prev = todos.filter(h => h.mes === prevMes && h.categoria === cat).reduce((s,h) => s+h.realizado, 0)
      return { categoria: cat, difR: ult - prev, difPct: prev > 0 ? ((ult-prev)/prev)*100 : 0 }
    }).filter(v => v.difR !== 0).sort((a,b) => b.difR - a.difR)

    return { maiorAlta: vars[0] || null, maiorQueda: vars[vars.length-1] || null }
  }, [historicoCatFixoFiltrado, historicoCatVariavelFiltrado])

  // ── Custo por unidade ────────────────────────────────────────
  const porUnidade = useMemo(() => {
    const map = {}
    const add = (arr) => arr.forEach(({ loja, total_realizado }) => {
      if (!map[loja]) map[loja] = { loja, total: 0 }
      map[loja].total += total_realizado
    })
    // Filtra pelo mês selecionado no histórico
    const hf  = mesFiltro ? historicoFiltrado.filter(h => {
      // mes_label no historico já está como "Mai/26", mesFiltro é "2026-05"
      // converte mesFiltro para label para comparar
      const [a, m] = mesFiltro.split('-')
      const MESES  = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
      const label  = `${MESES[parseInt(m)-1]}/${a.substring(2)}`
      return h.mes === label || h.mes === mesFiltro
    }) : historicoFiltrado

    const hvf = mesFiltro ? historicoVariavelFiltrado.filter(h => {
      const [a, m] = mesFiltro.split('-')
      const MESES  = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
      const label  = `${MESES[parseInt(m)-1]}/${a.substring(2)}`
      return h.mes === label || h.mes === mesFiltro
    }) : historicoVariavelFiltrado

    add(hf); add(hvf)
    const lista = Object.values(map).sort((a,b) => b.total - a.total)
    const grand = lista.reduce((s,l) => s+l.total, 0)
    return lista.map(l => ({ ...l, pct: grand > 0 ? (l.total/grand)*100 : 0 }))
  }, [historicoFiltrado, historicoVariavelFiltrado, mesFiltro])

  // ── Alertas ──────────────────────────────────────────────────
  const alertas = useMemo(() => {
    const hoje = new Date(); hoje.setHours(0,0,0,0)
    const em7d = new Date(hoje.getTime() + 7*86400000)
    return [...contasFiltradas]
      .filter(c => {
        if (c.status === 'pago') return false
        const d = new Date(c.vencimento)
        return c.status === 'vencido' || d <= em7d
      })
      .sort((a,b) => {
        const ord = { vencido:0, pendente:1 }
        return (ord[a.status]??2) - (ord[b.status]??2) || b.valor - a.valor
      })
      .slice(0, 6)
  }, [contasFiltradas])

  const totalVencido = contasFiltradas.filter(c => c.status === 'vencido').reduce((s,c) => s+c.valor, 0)

  const card = { background: '#fff', border: '1px solid #EBEBEB', borderRadius: 10 }

  return (
    <div style={{ background: '#F7F7F5', minHeight: '100vh' }}>
      <Header title="Visão Geral" />
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <KpiCard
            label="Custo Total do Mês"
            valor={fmt(totalMes)}
            sub={mesMostrado}
            icon={TrendingUp}
            dark
          />
          <KpiCard
            label="Variação vs Mês Anterior"
            valor={fmtPct(variacaoPct)}
            sub={`${variacaoR >= 0 ? '+' : ''}${fmt(variacaoR)}`}
            subColor={variacaoPct > 5 ? '#C0392B' : variacaoPct > 0 ? '#D4A017' : '#5C7A00'}
            icon={variacaoPct >= 0 ? TrendingUp : TrendingDown}
          />
          {maiorAlta && (
            <KpiCard
              label="Maior Alta"
              valor={maiorAlta.categoria}
              sub={`+${fmt(maiorAlta.difR)}  (${fmtPct(maiorAlta.difPct)})`}
              subColor="#C0392B"
              icon={TrendingUp}
            />
          )}
          {maiorQueda && maiorQueda.difR < 0 && (
            <KpiCard
              label="Maior Queda"
              valor={maiorQueda.categoria}
              sub={`${fmt(maiorQueda.difR)}  (${fmtPct(maiorQueda.difPct)})`}
              subColor="#5C7A00"
              icon={TrendingDown}
            />
          )}
        </div>

        {/* Gráfico + Por unidade */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 14 }}>

          <div style={{ ...card, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#999', marginBottom: 16 }}>
              Evolução de Custo — {lojaFiltro}
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={evolucao} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#111" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#111" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#5C7A00" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#5C7A00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#AAA', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#AAA', fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip formatter={(v, n) => [fmt(v), n === 'fixo' ? 'Fixo' : 'Variável']} contentStyle={{ fontSize: 12, border: '1px solid #EBEBEB', borderRadius: 8, fontFamily: 'Inter' }} />
                <Legend formatter={n => n === 'fixo' ? 'Custo Fixo' : 'Custo Variável'} iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: 'Inter' }} />
                <Area type="monotone" dataKey="variavel" stackId="1" stroke="#5C7A00" strokeWidth={1.5} fill="url(#gV)" />
                <Area type="monotone" dataKey="fixo"     stackId="1" stroke="#111"    strokeWidth={2}   fill="url(#gF)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F3' }}>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#999' }}>
                Por Unidade
              </span>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 280 }}>
              {porUnidade.length === 0
                ? <div style={{ padding: 20, color: '#CCC', fontSize: 13 }}>Sem dados</div>
                : porUnidade.map((u, i) => (
                  <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid #F5F5F3' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{u.loja}</span>
                      <span style={{ ...MONO, fontSize: 13, fontWeight: 600 }}>{fmt(u.total)}</span>
                    </div>
                    <div style={{ height: 2, background: '#F0F0EE', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${u.pct}%`, background: '#111', borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#BBB', marginTop: 3 }}>{u.pct.toFixed(1)}% do total</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #F5F5F3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={13} color="#C0392B" />
                <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#999' }}>
                  Atenção agora
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {totalVencido > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#C0392B' }}>
                    Vencido: <span style={MONO}>{fmt(totalVencido)}</span>
                  </span>
                )}
                <span style={{ fontSize: 11, color: '#BBB' }}>{alertas.length} contas</span>
              </div>
            </div>
            {alertas.map((c, i) => <AlertaItem key={i} conta={c} />)}
          </div>
        )}

      </div>
    </div>
  )
}
