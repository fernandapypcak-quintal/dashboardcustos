import React, { useMemo } from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import KpiCard from '../ui/KpiCard.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'
import Header from '../layout/Header.jsx'
import { fmt, fmtPct, fmtData } from '../../utils.js'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { AlertTriangle, TrendingUp, Clock, Wallet } from 'lucide-react'

const TH_STYLE = {
  fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: '#fff', background: '#0D0D0D', padding: '10px 14px', textAlign: 'left', whiteSpace: 'nowrap',
}
const TD_STYLE = {
  padding: '11px 14px', fontSize: 13.5, color: '#0D0D0D',
  borderBottom: '1px solid #F0F0E8',
}

export default function Home() {
  const { kpis, contasFiltradas, historicoFiltrado, lojaFiltro } = useFinanceiro()

  // Histórico agregado por mês (todas as lojas somadas quando 'Todas')
  const evolucao = useMemo(() => {
    const map = {}
    historicoFiltrado.forEach(({ mes, total_realizado, total_orcado }) => {
      if (!map[mes]) map[mes] = { mes, realizado: 0, orcado: 0 }
      map[mes].realizado += total_realizado
      map[mes].orcado += total_orcado
    })
    return Object.values(map).slice(-6)
  }, [historicoFiltrado])

  // Contas críticas (vencido ou pendente de maior valor)
  const criticas = useMemo(() =>
    [...contasFiltradas]
      .filter((c) => c.status !== 'pago')
      .sort((a, b) => {
        const ord = { vencido: 0, pendente: 1 }
        return (ord[a.status] ?? 2) - (ord[b.status] ?? 2) || b.valor - a.valor
      })
      .slice(0, 8),
    [contasFiltradas]
  )

  return (
    <div>
      <Header title="Visão Geral" />
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <KpiCard
            label="Total a Pagar"
            valor={fmt(kpis.totalAPagar)}
            subtitulo="Em aberto (pendente + vencido)"
            icon={Wallet}
          />
          <KpiCard
            label="Vencido"
            valor={fmt(kpis.totalVencido)}
            subtitulo="⚠ Requer ação imediata"
            subtituloColor="#8C1414"
            icon={AlertTriangle}
          />
          <KpiCard
            label="A Vencer em 7 dias"
            valor={fmt(kpis.aVencer7d)}
            subtitulo="Atenção ao fluxo"
            subtituloColor="#D9B504"
            icon={Clock}
          />
          <KpiCard
            label="Orçado vs Realizado"
            valor={fmt(kpis.realizadoTotal)}
            subtitulo={`${fmtPct(kpis.variacaoOrcado)} vs orçamento de ${fmt(kpis.orcadoTotal)}`}
            subtituloColor={kpis.variacaoOrcado > 5 ? '#8C1414' : kpis.variacaoOrcado > 0 ? '#D9B504' : '#97A624'}
            icon={TrendingUp}
          />
        </div>

        {/* Gráfico evolução */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, padding: '20px 20px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>
              Evolução de Custo Fixo — {lojaFiltro}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={evolucao} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gRealizado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D0D0D" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#0D0D0D" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gOrcado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#97A624" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#97A624" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0E8" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} width={56} />
              <Tooltip formatter={(v, n) => [fmt(v), n === 'realizado' ? 'Realizado' : 'Orçado']} contentStyle={{ fontSize: 12, border: '1px solid #E8E8E2', borderRadius: 6 }} />
              <Legend formatter={(v) => v === 'realizado' ? 'Realizado' : 'Orçado'} iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="orcado" stroke="#97A624" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#gOrcado)" dot={false} />
              <Area type="monotone" dataKey="realizado" stroke="#0D0D0D" strokeWidth={2} fill="url(#gRealizado)" dot={{ r: 3, fill: '#0D0D0D' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Contas críticas */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #E8E8E2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>
              Contas Críticas
            </span>
            <span style={{ fontSize: 11, color: '#9E9E8E' }}>{criticas.length} itens em aberto</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Nome', 'Fornecedor', 'Centro', 'Vencimento', 'Valor', 'Status'].map((h) => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criticas.map((c) => (
                  <tr key={c.id} style={{ cursor: 'default' }}>
                    <td style={TD_STYLE}>{c.nome}</td>
                    <td style={{ ...TD_STYLE, color: '#6A6A5A' }}>{c.fornecedor}</td>
                    <td style={{ ...TD_STYLE, color: '#6A6A5A' }}>{c.centro}</td>
                    <td style={{ ...TD_STYLE, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{fmtData(c.vencimento)}</td>
                    <td style={{ ...TD_STYLE, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{fmt(c.valor)}</td>
                    <td style={TD_STYLE}><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
