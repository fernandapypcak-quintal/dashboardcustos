import React, { useMemo, useState } from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import Header from '../layout/Header.jsx'
import { fmt, fmtPct } from '../../utils.js'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend,
} from 'recharts'

const CORES_CAT = {
  'CMV':                   '#0D0D0D',
  'Comissões':             '#97A624',
  'Embalagens':            '#D9B504',
  'Mão de obra variável':  '#8C1414',
}

const CORES_LOJAS = { 'Loja Centro': '#0D0D0D', 'Loja Sul': '#97A624', 'Loja Norte': '#D9B504' }

const TH = ({ children }) => (
  <th style={{
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#fff', background: '#0D0D0D', padding: '10px 14px', textAlign: 'left', whiteSpace: 'nowrap',
  }}>{children}</th>
)

const TD = ({ children, mono, color }) => (
  <td style={{
    padding: '11px 14px', fontSize: 13, color: color || '#0D0D0D',
    borderBottom: '1px solid #F0F0E8',
    fontFamily: mono ? "'DM Mono', monospace" : undefined,
  }}>{children}</td>
)

function VarBadge({ pct }) {
  const color = pct > 10 ? '#8C1414' : pct > 0 ? '#D9B504' : '#97A624'
  const bg    = pct > 10 ? '#F5DCDC' : pct > 0 ? '#FDF8DC' : '#EEF5D5'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
      background: bg, color,
    }}>
      {fmtPct(pct)}
    </span>
  )
}

const S = (ativo) => ({
  padding: '5px 12px', borderRadius: 5, border: '1px solid #E8E8E2', cursor: 'pointer', fontSize: 12,
  background: ativo ? '#0D0D0D' : '#fff', color: ativo ? '#fff' : '#4A4A3A', fontWeight: ativo ? 600 : 400,
})

export default function CustoVariavel() {
  const { custosVariaveisFiltrados, historicoVariavelFiltrado, historicoVariavel, lojaFiltro } = useFinanceiro()
  const [topMode, setTopMode] = useState('todos')
  const [metricHist, setMetricHist] = useState('realizado')

  // ── Totais ──────────────────────────────────────────────────
  const totalOrcado   = custosVariaveisFiltrados.reduce((s, c) => s + c.orcado, 0)
  const totalRealizado = custosVariaveisFiltrados.reduce((s, c) => s + c.realizado, 0)
  const varTotal = totalOrcado > 0 ? ((totalRealizado - totalOrcado) / totalOrcado) * 100 : 0

  // ── Por categoria ───────────────────────────────────────────
  const porCategoria = useMemo(() => {
    const map = {}
    custosVariaveisFiltrados.forEach(({ categoria, orcado, realizado }) => {
      if (!map[categoria]) map[categoria] = { categoria, orcado: 0, realizado: 0 }
      map[categoria].orcado    += orcado
      map[categoria].realizado += realizado
    })
    return Object.values(map).map((r) => ({
      ...r,
      variacao: r.orcado > 0 ? ((r.realizado - r.orcado) / r.orcado) * 100 : 0,
    })).sort((a, b) => b.realizado - a.realizado)
  }, [custosVariaveisFiltrados])

  // ── Por loja ────────────────────────────────────────────────
  const porLoja = useMemo(() => {
    const map = {}
    custosVariaveisFiltrados.forEach(({ loja, orcado, realizado }) => {
      if (!map[loja]) map[loja] = { loja, orcado: 0, realizado: 0 }
      map[loja].orcado    += orcado
      map[loja].realizado += realizado
    })
    return Object.values(map).map((r) => ({
      ...r,
      variacao: r.orcado > 0 ? ((r.realizado - r.orcado) / r.orcado) * 100 : 0,
    }))
  }, [custosVariaveisFiltrados])

  // ── Itens individuais ───────────────────────────────────────
  const porItem = useMemo(() => {
    return custosVariaveisFiltrados.map((c) => ({
      ...c,
      variacao: c.orcado > 0 ? ((c.realizado - c.orcado) / c.orcado) * 100 : 0,
    }))
  }, [custosVariaveisFiltrados])

  const dadosExibidos = useMemo(() => {
    const sorted = [...porItem].sort((a, b) => b.realizado - a.realizado)
    if (topMode === 'top20') return sorted.slice(0, 20)
    if (topMode === 'bot20') return [...sorted].reverse().slice(0, 20)
    return sorted
  }, [porItem, topMode])

  // ── Histórico por loja (pivot) ──────────────────────────────
  const lojas  = useMemo(() => Array.from(new Set(historicoVariavel.map((h) => h.loja))), [historicoVariavel])
  const meses  = useMemo(() => Array.from(new Set(historicoVariavel.map((h) => h.mes))), [historicoVariavel])

  const dadosLinha = useMemo(() => {
    return meses.map((mes) => {
      const row = { mes }
      lojas.forEach((loja) => {
        const e = historicoVariavel.find((h) => h.mes === mes && h.loja === loja)
        row[loja] = e ? e[metricHist] : 0
      })
      return row
    })
  }, [meses, lojas, historicoVariavel, metricHist])

  // ── Oscilação mês a mês ─────────────────────────────────────
  const oscilacao = useMemo(() => {
    const map = {}
    historicoVariavelFiltrado.forEach(({ mes, total_realizado, total_orcado }) => {
      if (!map[mes]) map[mes] = { mes, realizado: 0, orcado: 0 }
      map[mes].realizado += total_realizado
      map[mes].orcado    += total_orcado
    })
    const lista = Object.values(map)
    return lista.map((r, i) => {
      const prev = lista[i - 1]
      const variacao = prev && prev.realizado > 0 ? ((r.realizado - prev.realizado) / prev.realizado) * 100 : 0
      return { ...r, variacao }
    })
  }, [historicoVariavelFiltrado])

  return (
    <div>
      <Header title="Custo Variável" />
      <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* KPI totais */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: 'Total Orçado',   valor: fmt(totalOrcado),    color: '#8A8A7A' },
            { label: 'Total Realizado', valor: fmt(totalRealizado), color: '#0D0D0D' },
            { label: 'Variação',        valor: fmtPct(varTotal),    color: varTotal > 5 ? '#8C1414' : varTotal > 0 ? '#D9B504' : '#97A624' },
          ].map(({ label, valor, color }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, padding: '16px 20px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace", color }}>{valor}</div>
            </div>
          ))}
        </div>

        {/* Por loja (quando Todas) */}
        {lojaFiltro === 'Todas' && (
          <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #E8E8E2' }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>Custo Variável por Loja</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><TH>Loja</TH><TH>Orçado</TH><TH>Realizado</TH><TH>Variação</TH><TH>% do Total</TH></tr></thead>
              <tbody>
                {porLoja.map((l) => (
                  <tr key={l.loja}>
                    <TD>{l.loja}</TD>
                    <TD mono color="#6A6A5A">{fmt(l.orcado)}</TD>
                    <TD mono>{fmt(l.realizado)}</TD>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8' }}><VarBadge pct={l.variacao} /></td>
                    <TD mono color="#6A6A5A">{totalRealizado > 0 ? ((l.realizado / totalRealizado) * 100).toFixed(1) + '%' : '-'}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Gráfico barras por categoria */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginBottom: 16 }}>
            Orçado vs Realizado por Categoria
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={porCategoria} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0E8" vertical={false} />
              <XAxis dataKey="categoria" tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} width={44} />
              <Tooltip formatter={(v, n) => [fmt(v), n === 'orcado' ? 'Orçado' : 'Realizado']} contentStyle={{ fontSize: 12, border: '1px solid #E8E8E2', borderRadius: 6 }} />
              <Bar dataKey="orcado" name="orcado" fill="#E8E8E2" radius={[3, 3, 0, 0]} />
              <Bar dataKey="realizado" name="realizado" radius={[3, 3, 0, 0]}>
                {porCategoria.map((e) => (
                  <Cell key={e.categoria} fill={CORES_CAT[e.categoria] || '#97A624'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Histórico por loja */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>
              Evolução por Loja — 6 meses
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={S(metricHist === 'realizado')} onClick={() => setMetricHist('realizado')}>Realizado</button>
              <button style={S(metricHist === 'total_orcado')} onClick={() => setMetricHist('total_orcado')}>Orçado</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dadosLinha} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0E8" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} width={44} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, border: '1px solid #E8E8E2', borderRadius: 6 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              {lojas.map((loja) => (
                <Line key={loja} type="monotone" dataKey={loja} stroke={CORES_LOJAS[loja] || '#97A624'} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Oscilação */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginBottom: 16 }}>
            Oscilação Mensal — {lojaFiltro}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={oscilacao} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0E8" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v) => [`${v.toFixed(2)}%`, 'Variação']} contentStyle={{ fontSize: 12, border: '1px solid #E8E8E2', borderRadius: 6 }} />
              <Bar dataKey="variacao" radius={[3, 3, 0, 0]}>
                {oscilacao.map((e, i) => (
                  <Cell key={i} fill={e.variacao > 5 ? '#8C1414' : e.variacao > 0 ? '#D9B504' : '#97A624'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela de itens */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #E8E8E2', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginRight: 8 }}>
              Itens de Custo Variável
            </span>
            {[
              { key: 'todos',  label: 'Todos' },
              { key: 'top20', label: '20 Maiores' },
              { key: 'bot20', label: '20 Menores' },
            ].map(({ key, label }) => (
              <button key={key} style={S(topMode === key)} onClick={() => setTopMode(key)}>{label}</button>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <TH>Categoria</TH>
                  <TH>Subcategoria</TH>
                  {lojaFiltro === 'Todas' && <TH>Loja</TH>}
                  <TH>Orçado</TH>
                  <TH>Realizado</TH>
                  <TH>Variação</TH>
                  <TH>Dif. R$</TH>
                </tr>
              </thead>
              <tbody>
                {dadosExibidos.map((c, i) => {
                  const dif = c.realizado - c.orcado
                  return (
                    <tr key={i}>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: CORES_CAT[c.categoria] || '#ccc', flexShrink: 0 }} />
                          {c.categoria}
                        </span>
                      </td>
                      <TD color="#6A6A5A">{c.subcategoria}</TD>
                      {lojaFiltro === 'Todas' && <TD color="#6A6A5A">{c.loja}</TD>}
                      <TD mono color="#6A6A5A">{fmt(c.orcado)}</TD>
                      <TD mono>{fmt(c.realizado)}</TD>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8' }}><VarBadge pct={c.variacao} /></td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8', fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: dif > 0 ? '#8C1414' : '#97A624' }}>
                        {dif >= 0 ? '+' : ''}{fmt(dif)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
