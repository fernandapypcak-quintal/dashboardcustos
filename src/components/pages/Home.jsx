import React, { useMemo } from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import Header from '../layout/Header.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'
import { fmt, fmtPct, fmtData, diasAteVencimento } from '../../utils.js'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, Clock } from 'lucide-react'

const MONO = { fontFamily: "'DM Mono', monospace" }

// ── mini componentes ──────────────────────────────────────────
function KpiPulso({ label, valor, sub, subColor, icon: Icon, destaque }) {
  return (
    <div style={{ background: destaque ? '#0D0D0D' : '#fff', border: '1px solid #E8E8E2', borderRadius: 8, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: destaque ? '#888' : '#8A8A7A' }}>{label}</span>
        {Icon && <Icon size={14} color={destaque ? '#555' : '#C0C0B0'} />}
      </div>
      <div style={{ ...MONO, fontSize: 28, fontWeight: 700, color: destaque ? '#fff' : '#0D0D0D', lineHeight: 1.1 }}>{valor}</div>
      {sub && <div style={{ fontSize: 12, fontWeight: 600, color: subColor || (destaque ? '#888' : '#8A8A7A') }}>{sub}</div>}
    </div>
  )
}

function AlertaLinha({ conta }) {
  const dias     = diasAteVencimento(conta.vencimento)
  const vencido  = conta.status === 'vencido'
  const cor      = vencido ? '#8C1414' : '#D9B504'
  const bgCor    = vencido ? '#F5DCDC' : '#FDF8DC'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid #F0F0E8' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cor, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#0D0D0D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conta.nome}</div>
        <div style={{ fontSize: 11, color: '#8A8A7A', marginTop: 1 }}>{conta.centro}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ ...MONO, fontSize: 13, fontWeight: 700, color: '#0D0D0D' }}>{fmt(conta.valor)}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: cor, background: bgCor, padding: '1px 7px', borderRadius: 10, marginTop: 2 }}>
          {vencido ? `${Math.abs(dias)}d atraso` : `vence em ${dias}d`}
        </div>
      </div>
    </div>
  )
}

// ── página principal ──────────────────────────────────────────
export default function Home() {
  const {
    contasFiltradas, historicoCatFixoFiltrado, historicoCatVariavelFiltrado,
    historicoFiltrado, historicoVariavelFiltrado, lojaFiltro,
    custosFiltrados, custosVariaveisFiltrados,
  } = useFinanceiro()

  // ── Evolução mensal total (fixo + variável empilhado) ────────
  const evolucao = useMemo(() => {
    const map = {}
    const agregar = (hist, campo) => {
      hist.forEach(({ mes, total_realizado }) => {
        if (!map[mes]) map[mes] = { mes, fixo: 0, variavel: 0 }
        map[mes][campo] += total_realizado
      })
    }
    agregar(historicoFiltrado,        'fixo')
    agregar(historicoVariavelFiltrado,'variavel')
    return Object.values(map).slice(-6)
  }, [historicoFiltrado, historicoVariavelFiltrado])

  // ── Variação mês a mês (total) ───────────────────────────────
  const { totalMes, totalAnterior, variacaoR, variacaoPct } = useMemo(() => {
    if (evolucao.length < 2) return { totalMes: 0, totalAnterior: 0, variacaoR: 0, variacaoPct: 0 }
    const ult  = evolucao[evolucao.length - 1]
    const prev = evolucao[evolucao.length - 2]
    const totalMes      = (ult.fixo  + ult.variavel)
    const totalAnterior = (prev.fixo + prev.variavel)
    const variacaoR     = totalMes - totalAnterior
    const variacaoPct   = totalAnterior > 0 ? (variacaoR / totalAnterior) * 100 : 0
    return { totalMes, totalAnterior, variacaoR, variacaoPct }
  }, [evolucao])

  // ── Maior alta e maior queda (categoria, último mês) ─────────
  const { maiorAlta, maiorQueda } = useMemo(() => {
    const ORDEM = ['Out/24','Nov/24','Dez/24','Jan/25','Fev/25','Mar/25','Abr/25','Mai/25','Jun/25']
    const todos = [...historicoCatFixoFiltrado, ...historicoCatVariavelFiltrado]
    const cats  = [...new Set(todos.map(h => h.categoria))]
    const meses = [...new Set(todos.map(h => h.mes))].sort((a,b) => ORDEM.indexOf(a) - ORDEM.indexOf(b))
    const ultMes  = meses[meses.length - 1]
    const prevMes = meses[meses.length - 2]
    if (!ultMes || !prevMes) return { maiorAlta: null, maiorQueda: null }

    const variacoes = cats.map(cat => {
      const ult  = todos.filter(h => h.mes === ultMes  && h.categoria === cat).reduce((s,h) => s+h.realizado, 0)
      const prev = todos.filter(h => h.mes === prevMes && h.categoria === cat).reduce((s,h) => s+h.realizado, 0)
      const difR   = ult - prev
      const difPct = prev > 0 ? (difR / prev) * 100 : 0
      return { categoria: cat, difR, difPct }
    }).filter(v => v.difR !== 0)

    const sorted    = [...variacoes].sort((a,b) => b.difR - a.difR)
    const maiorAlta  = sorted[0]   || null
    const maiorQueda = sorted[sorted.length - 1] || null
    return { maiorAlta, maiorQueda }
  }, [historicoCatFixoFiltrado, historicoCatVariavelFiltrado])

  // ── Custo por unidade (mês atual) ────────────────────────────
  const porUnidade = useMemo(() => {
    const map = {}
    const agregar = (dados) => dados.forEach(({ loja, realizado }) => {
      if (!map[loja]) map[loja] = { loja, total: 0 }
      map[loja].total += realizado
    })
    agregar(custosFiltrados)
    agregar(custosVariaveisFiltrados)
    const lista  = Object.values(map).sort((a,b) => b.total - a.total)
    const grand  = lista.reduce((s,l) => s + l.total, 0)
    // Variação vs mês anterior por unidade
    const ORDEM  = ['Out/24','Nov/24','Dez/24','Jan/25','Fev/25','Mar/25','Abr/25','Mai/25','Jun/25']
    const todos  = [...historicoFiltrado, ...historicoVariavelFiltrado]
    const meses  = [...new Set(todos.map(h => h.mes))].sort((a,b) => ORDEM.indexOf(a) - ORDEM.indexOf(b))
    const ultMes = meses[meses.length - 1]
    const prevMes= meses[meses.length - 2]
    return lista.map(l => {
      const ult  = todos.filter(h => h.loja === l.loja && h.mes === ultMes).reduce((s,h) => s+h.total_realizado, 0)
      const prev = todos.filter(h => h.loja === l.loja && h.mes === prevMes).reduce((s,h) => s+h.total_realizado, 0)
      const varR   = ult - prev
      const varPct = prev > 0 ? (varR / prev) * 100 : 0
      return { ...l, pct: grand > 0 ? (l.total / grand) * 100 : 0, varR, varPct }
    })
  }, [custosFiltrados, custosVariaveisFiltrados, historicoFiltrado, historicoVariavelFiltrado])

  // ── Alertas de contas ─────────────────────────────────────────
  const alertas = useMemo(() => {
    const hoje   = new Date(); hoje.setHours(0,0,0,0)
    const em7d   = new Date(hoje.getTime() + 7 * 86400000)
    return [...contasFiltradas]
      .filter(c => {
        if (c.status === 'pago') return false
        const d = new Date(c.vencimento)
        return c.status === 'vencido' || d <= em7d
      })
      .sort((a,b) => {
        const ord = { vencido: 0, pendente: 1 }
        return (ord[a.status]??2) - (ord[b.status]??2) || b.valor - a.valor
      })
      .slice(0, 6)
  }, [contasFiltradas])

  const totalVencido = contasFiltradas.filter(c => c.status === 'vencido').reduce((s,c) => s+c.valor, 0)
  const totalAlerta  = alertas.reduce((s,c) => s+c.valor, 0)

  return (
    <div>
      <Header title="Visão Geral" />
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Bloco 1: Pulso do mês ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
          <KpiPulso
            label="Custo Total do Mês"
            valor={fmt(totalMes)}
            sub={`${evolucao.length > 0 ? evolucao[evolucao.length-1]?.mes : ''}`}
            icon={TrendingUp}
            destaque
          />
          <KpiPulso
            label="Variação vs Mês Anterior"
            valor={fmtPct(variacaoPct)}
            sub={`${variacaoR >= 0 ? '+' : ''}${fmt(variacaoR)} em relação ao mês anterior`}
            subColor={variacaoPct > 5 ? '#8C1414' : variacaoPct > 0 ? '#D9B504' : '#97A624'}
            icon={variacaoPct > 0 ? TrendingUp : TrendingDown}
          />
          {maiorAlta && (
            <KpiPulso
              label="Maior Alta do Mês"
              valor={maiorAlta.categoria}
              sub={`+${fmt(maiorAlta.difR)}  (${fmtPct(maiorAlta.difPct)})`}
              subColor="#8C1414"
              icon={TrendingUp}
            />
          )}
          {maiorQueda && maiorQueda.difR < 0 && (
            <KpiPulso
              label="Maior Queda do Mês"
              valor={maiorQueda.categoria}
              sub={`${fmt(maiorQueda.difR)}  (${fmtPct(maiorQueda.difPct)})`}
              subColor="#97A624"
              icon={TrendingDown}
            />
          )}
        </div>

        {/* ── Bloco 2: Evolução empilhada + Custo por unidade ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>

          {/* Gráfico evolução */}
          <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, padding: '16px 20px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginBottom: 16 }}>
              Evolução de Custo — {lojaFiltro} (6 meses)
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={evolucao} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gFixo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0D0D0D" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0D0D0D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gVar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#97A624" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#97A624" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0E8" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip formatter={(v, n) => [fmt(v), n === 'fixo' ? 'Custo Fixo' : 'Custo Variável']} contentStyle={{ fontSize: 12, border: '1px solid #E8E8E2', borderRadius: 6 }} />
                <Legend formatter={n => n === 'fixo' ? 'Custo Fixo' : 'Custo Variável'} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="variavel" stackId="1" stroke="#97A624" strokeWidth={1.5} fill="url(#gVar)" />
                <Area type="monotone" dataKey="fixo"     stackId="1" stroke="#0D0D0D" strokeWidth={2}   fill="url(#gFixo)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Custo por unidade */}
          <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E8E8E2' }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>
                Custo por Unidade — mês atual
              </span>
            </div>
            {porUnidade.length === 0
              ? <div style={{ padding: 24, fontSize: 13, color: '#B0B0A0' }}>Sem dados</div>
              : porUnidade.map((u, i) => (
                <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid #F0F0E8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{u.loja}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ ...MONO, fontSize: 13, fontWeight: 700 }}>{fmt(u.total)}</span>
                      <span style={{ ...MONO, fontSize: 11, fontWeight: 700, color: u.varPct > 5 ? '#8C1414' : u.varPct > 0 ? '#D9B504' : '#97A624' }}>
                        {u.varPct >= 0 ? '+' : ''}{u.varPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {/* Barra proporcional */}
                  <div style={{ height: 3, background: '#F0F0E8', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${u.pct}%`, background: '#0D0D0D', borderRadius: 2, transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#B0B0A0', marginTop: 3 }}>{u.pct.toFixed(1)}% do total</div>
                </div>
              ))
            }
          </div>
        </div>

        {/* ── Bloco 3: Alertas de contas ── */}
        {alertas.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8E8E2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={14} color="#8C1414" />
                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>
                  Contas que precisam de atenção
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {totalVencido > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#8C1414' }}>
                    Vencido: <span style={MONO}>{fmt(totalVencido)}</span>
                  </span>
                )}
                <span style={{ fontSize: 11, color: '#9E9E8E' }}>{alertas.length} contas · {fmt(totalAlerta)}</span>
              </div>
            </div>
            {alertas.map((c, i) => <AlertaLinha key={i} conta={c} />)}
          </div>
        )}

      </div>
    </div>
  )
}
