import React, { useMemo, useState } from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import { useVariacaoMensal } from '../../hooks/useVariacaoMensal.js'
import Header from '../layout/Header.jsx'
import { fmt, fmtPct } from '../../utils.js'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend,
} from 'recharts'

const CORES_CAT = ['#0D0D0D','#97A624','#D9B504','#8C1414','#5A6A10','#2A4A8A','#8A5A2A','#5A8A2A']

const TH = ({ children }) => (
  <th style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', background: '#0D0D0D', padding: '10px 14px', textAlign: 'left', whiteSpace: 'nowrap' }}>
    {children}
  </th>
)
const TD = ({ children, mono, color, right }) => (
  <td style={{ padding: '10px 14px', fontSize: 13, color: color || '#0D0D0D', borderBottom: '1px solid #F0F0E8', fontFamily: mono ? "'DM Mono', monospace" : undefined, textAlign: right ? 'right' : 'left' }}>
    {children}
  </td>
)

function VarBadge({ pct }) {
  const color = pct > 10 ? '#8C1414' : pct > 0 ? '#D9B504' : '#97A624'
  const bg    = pct > 10 ? '#F5DCDC' : pct > 0 ? '#FDF8DC' : '#EEF5D5'
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", background: bg, color }}>
      {fmtPct(pct)}
    </span>
  )
}

const S = (ativo) => ({
  padding: '5px 12px', borderRadius: 5, border: '1px solid #E8E8E2', cursor: 'pointer', fontSize: 12,
  background: ativo ? '#0D0D0D' : '#fff', color: ativo ? '#fff' : '#4A4A3A', fontWeight: ativo ? 600 : 400,
})

export default function CustoFixo() {
  const { custosFiltrados, historicoCatFixoFiltrado, custosFixos, lojaFiltro } = useFinanceiro()
  const [topMode, setTopMode] = useState('todos')
  const { meses, categorias, dadosGrafico, tabelaHistorica, ranking } = useVariacaoMensal(historicoCatFixoFiltrado)

  // ── Totais do mês corrente ──────────────────────────────────
  const totalOrcado    = custosFiltrados.reduce((s, c) => s + c.orcado, 0)
  const totalRealizado = custosFiltrados.reduce((s, c) => s + c.realizado, 0)
  const varTotal = totalOrcado > 0 ? ((totalRealizado - totalOrcado) / totalOrcado) * 100 : 0

  // ── Por categoria (mês atual) ────────────────────────────────
  const porCategoria = useMemo(() => {
    const map = {}
    custosFiltrados.forEach(({ categoria, orcado, realizado }) => {
      if (!map[categoria]) map[categoria] = { categoria, orcado: 0, realizado: 0 }
      map[categoria].orcado    += orcado
      map[categoria].realizado += realizado
    })
    return Object.values(map).map((r) => ({
      ...r, variacao: r.orcado > 0 ? ((r.realizado - r.orcado) / r.orcado) * 100 : 0,
    })).sort((a, b) => b.realizado - a.realizado)
  }, [custosFiltrados])

  // ── Por loja ─────────────────────────────────────────────────
  const porLoja = useMemo(() => {
    const map = {}
    custosFiltrados.forEach(({ loja, orcado, realizado }) => {
      if (!map[loja]) map[loja] = { loja, orcado: 0, realizado: 0 }
      map[loja].orcado += orcado; map[loja].realizado += realizado
    })
    return Object.values(map).map((r) => ({ ...r, variacao: r.orcado > 0 ? ((r.realizado - r.orcado) / r.orcado) * 100 : 0 }))
  }, [custosFiltrados])

  // ── Itens (top/bottom) ───────────────────────────────────────
  const porItem = useMemo(() => custosFiltrados.map((c) => ({
    ...c, variacao: c.orcado > 0 ? ((c.realizado - c.orcado) / c.orcado) * 100 : 0,
  })), [custosFiltrados])

  const dadosExibidos = useMemo(() => {
    const sorted = [...porItem].sort((a, b) => b.realizado - a.realizado)
    if (topMode === 'top20') return sorted.slice(0, 20)
    if (topMode === 'bot20') return [...sorted].reverse().slice(0, 20)
    return sorted
  }, [porItem, topMode])

  return (
    <div>
      <Header title="Custo Fixo" />
      <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: 'Total Orçado',    valor: fmt(totalOrcado),    color: '#8A8A7A' },
            { label: 'Total Realizado', valor: fmt(totalRealizado), color: '#0D0D0D' },
            { label: 'Variação vs Orçamento', valor: fmtPct(varTotal), color: varTotal > 5 ? '#8C1414' : varTotal > 0 ? '#D9B504' : '#97A624' },
          ].map(({ label, valor, color }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, padding: '16px 20px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace", color }}>{valor}</div>
            </div>
          ))}
        </div>

        {/* Ranking variação MoM */}
        {(ranking.maioresAltas.length > 0 || ranking.maioresBaixas.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Maiores altas */}
            <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8E8E2', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8C1414' }} />
                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>
                  Maiores Altas — mês a mês
                </span>
              </div>
              {ranking.maioresAltas.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #F0F0E8' }}>
                  <span style={{ fontSize: 13 }}>{r.categoria}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: '#8C1414', fontWeight: 600 }}>+{fmt(r.variacaoR)}</span>
                    <VarBadge pct={r.variacaoPct} />
                  </div>
                </div>
              ))}
            </div>

            {/* Maiores baixas */}
            <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8E8E2', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#97A624' }} />
                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>
                  Maiores Quedas — mês a mês
                </span>
              </div>
              {ranking.maioresBaixas.length === 0
                ? <div style={{ padding: 20, fontSize: 13, color: '#B0B0A0' }}>Nenhuma queda no período</div>
                : ranking.maioresBaixas.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #F0F0E8' }}>
                    <span style={{ fontSize: 13 }}>{r.categoria}</span>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: '#97A624', fontWeight: 600 }}>{fmt(r.variacaoR)}</span>
                      <VarBadge pct={r.variacaoPct} />
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Gráfico histórico por categoria */}
        {dadosGrafico.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, padding: '16px 20px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginBottom: 16 }}>
              Evolução Histórica por Categoria — {lojaFiltro}
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={dadosGrafico} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0E8" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, border: '1px solid #E8E8E2', borderRadius: 6 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                {categorias.map((cat, i) => (
                  <Line key={cat} type="monotone" dataKey={cat} stroke={CORES_CAT[i % CORES_CAT.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tabela histórica com variação MoM por categoria */}
        {tabelaHistorica.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #E8E8E2' }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>
                Histórico por Categoria (R$ realizado)
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <TH>Categoria</TH>
                    {meses.map((m) => <TH key={m}>{m}</TH>)}
                    <TH>Var. R$ (MoM)</TH>
                    <TH>Var. % (MoM)</TH>
                  </tr>
                </thead>
                <tbody>
                  {tabelaHistorica.map((row, i) => (
                    <tr key={i}>
                      <TD>{row.categoria}</TD>
                      {meses.map((m, mi) => {
                        const val = row[m] || 0
                        const prev = mi > 0 ? (row[meses[mi-1]] || 0) : null
                        const changed = prev !== null && val !== prev
                        const up = changed && val > prev
                        return (
                          <td key={m} style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0E8', fontFamily: "'DM Mono', monospace", fontSize: 12, color: changed ? (up ? '#8C1414' : '#97A624') : '#0D0D0D', fontWeight: changed ? 600 : 400 }}>
                            {val > 0 ? fmt(val) : '—'}
                          </td>
                        )
                      })}
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0E8', fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: row.variacaoR > 0 ? '#8C1414' : '#97A624' }}>
                        {row.variacaoR >= 0 ? '+' : ''}{fmt(row.variacaoR)}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0E8' }}>
                        <VarBadge pct={row.variacaoPct} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Por loja */}
        {lojaFiltro === 'Todas' && (
          <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #E8E8E2' }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>Custo por Loja — mês atual</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><TH>Loja</TH><TH>Orçado</TH><TH>Realizado</TH><TH>Variação</TH><TH>% do Total</TH></tr></thead>
              <tbody>
                {porLoja.map((l) => (
                  <tr key={l.loja}>
                    <TD>{l.loja}</TD>
                    <TD mono color="#6A6A5A">{fmt(l.orcado)}</TD>
                    <TD mono>{fmt(l.realizado)}</TD>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0E8' }}><VarBadge pct={l.variacao} /></td>
                    <TD mono color="#6A6A5A">{totalRealizado > 0 ? ((l.realizado/totalRealizado)*100).toFixed(1)+'%' : '-'}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Gráfico orçado vs realizado mês atual */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginBottom: 16 }}>
            Orçado vs Realizado — mês atual
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={porCategoria} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0E8" vertical={false} />
              <XAxis dataKey="categoria" tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} width={44} />
              <Tooltip formatter={(v, n) => [fmt(v), n === 'orcado' ? 'Orçado' : 'Realizado']} contentStyle={{ fontSize: 12, border: '1px solid #E8E8E2', borderRadius: 6 }} />
              <Bar dataKey="orcado" name="orcado" fill="#E8E8E2" radius={[3,3,0,0]} />
              <Bar dataKey="realizado" name="realizado" radius={[3,3,0,0]}>
                {porCategoria.map((e) => <Cell key={e.categoria} fill={e.variacao > 10 ? '#8C1414' : e.variacao > 0 ? '#D9B504' : '#97A624'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela de itens top/bottom */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #E8E8E2', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginRight: 8 }}>Itens</span>
            {[{key:'todos',label:'Todos'},{key:'top20',label:'20 Maiores'},{key:'bot20',label:'20 Menores'}].map(({key,label}) => (
              <button key={key} style={S(topMode===key)} onClick={() => setTopMode(key)}>{label}</button>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <TH>Categoria</TH><TH>Subcategoria</TH>
                  {lojaFiltro === 'Todas' && <TH>Loja</TH>}
                  <TH>Orçado</TH><TH>Realizado</TH><TH>Variação</TH><TH>Dif. R$</TH>
                </tr>
              </thead>
              <tbody>
                {dadosExibidos.map((c, i) => {
                  const dif = c.realizado - c.orcado
                  return (
                    <tr key={i}>
                      <TD>{c.categoria}</TD>
                      <TD color="#6A6A5A">{c.subcategoria}</TD>
                      {lojaFiltro === 'Todas' && <TD color="#6A6A5A">{c.loja}</TD>}
                      <TD mono color="#6A6A5A">{fmt(c.orcado)}</TD>
                      <TD mono>{fmt(c.realizado)}</TD>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0E8' }}><VarBadge pct={c.variacao} /></td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0E8', fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: dif > 0 ? '#8C1414' : '#97A624' }}>
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
