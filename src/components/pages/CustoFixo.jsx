import React, { useMemo, useState } from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import Header from '../layout/Header.jsx'
import { fmt, fmtPct } from '../../utils.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const TH = ({ children }) => (
  <th style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', background: '#0D0D0D', padding: '10px 14px', textAlign: 'left', whiteSpace: 'nowrap' }}>
    {children}
  </th>
)
const TD = ({ children, mono, color, right }) => (
  <td style={{ padding: '11px 14px', fontSize: 13, color: color || '#0D0D0D', borderBottom: '1px solid #F0F0E8', fontFamily: mono ? "'DM Mono', monospace" : undefined, textAlign: right ? 'right' : 'left' }}>
    {children}
  </td>
)

function VarBadge({ pct }) {
  const color = pct > 10 ? '#8C1414' : pct > 0 ? '#D9B504' : '#97A624'
  const bg = pct > 10 ? '#F5DCDC' : pct > 0 ? '#FDF8DC' : '#EEF5D5'
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", background: bg, color }}>
      {fmtPct(pct)}
    </span>
  )
}

export default function CustoFixo() {
  const { custosFiltrados, lojaFiltro } = useFinanceiro()
  const [topMode, setTopMode] = useState('todos') // 'todos' | 'top20' | 'bot20' | 'novas'
  const [viewMode, setViewMode] = useState('tabela') // 'tabela' | 'grafico'

  // Agrupado por categoria
  const porCategoria = useMemo(() => {
    const map = {}
    custosFiltrados.forEach(({ categoria, subcategoria, orcado, realizado, loja }) => {
      const key = categoria
      if (!map[key]) map[key] = { categoria, subcategoria, orcado: 0, realizado: 0, lojas: new Set(), linhas: [] }
      map[key].orcado += orcado
      map[key].realizado += realizado
      map[key].lojas.add(loja)
      map[key].linhas.push({ subcategoria, orcado, realizado, loja })
    })
    return Object.values(map)
      .map((r) => ({ ...r, variacao: r.orcado > 0 ? ((r.realizado - r.orcado) / r.orcado) * 100 : 0 }))
      .sort((a, b) => b.realizado - a.realizado)
  }, [custosFiltrados])

  // Por loja (agrupado)
  const porLoja = useMemo(() => {
    const map = {}
    custosFiltrados.forEach(({ loja, realizado, orcado }) => {
      if (!map[loja]) map[loja] = { loja, realizado: 0, orcado: 0 }
      map[loja].realizado += realizado
      map[loja].orcado += orcado
    })
    return Object.values(map).map((r) => ({ ...r, variacao: r.orcado > 0 ? ((r.realizado - r.orcado) / r.orcado) * 100 : 0 }))
  }, [custosFiltrados])

  // Por item individual (subcategoria+loja)
  const porItem = useMemo(() => {
    return custosFiltrados.map((c) => ({
      ...c,
      variacao: c.orcado > 0 ? ((c.realizado - c.orcado) / c.orcado) * 100 : 0,
      label: `${c.subcategoria} (${c.loja})`,
    }))
  }, [custosFiltrados])

  const dadosExibidos = useMemo(() => {
    const sorted = [...porItem].sort((a, b) => b.realizado - a.realizado)
    if (topMode === 'top20') return sorted.slice(0, 20)
    if (topMode === 'bot20') return sorted.reverse().slice(0, 20)
    return sorted
  }, [porItem, topMode])

  const totalOrcado = porCategoria.reduce((s, r) => s + r.orcado, 0)
  const totalRealizado = porCategoria.reduce((s, r) => s + r.realizado, 0)
  const varTotal = totalOrcado > 0 ? ((totalRealizado - totalOrcado) / totalOrcado) * 100 : 0

  const S = (ativo) => ({
    padding: '5px 12px', borderRadius: 5, border: '1px solid #E8E8E2', cursor: 'pointer', fontSize: 12,
    background: ativo ? '#0D0D0D' : '#fff', color: ativo ? '#fff' : '#4A4A3A', fontWeight: ativo ? 600 : 400,
  })

  return (
    <div>
      <Header title="Custo Fixo" />
      <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Totalizadores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: 'Total Orçado', valor: fmt(totalOrcado), color: '#8A8A7A' },
            { label: 'Total Realizado', valor: fmt(totalRealizado), color: '#0D0D0D' },
            { label: 'Variação', valor: fmtPct(varTotal), color: varTotal > 5 ? '#8C1414' : varTotal > 0 ? '#D9B504' : '#97A624' },
          ].map(({ label, valor, color }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, padding: '16px 20px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace", color }}>{valor}</div>
            </div>
          ))}
        </div>

        {/* Por Loja (quando "Todas") */}
        {lojaFiltro === 'Todas' && (
          <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #E8E8E2' }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>Custo por Loja</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <TH>Loja</TH>
                    <TH>Orçado</TH>
                    <TH>Realizado</TH>
                    <TH>Variação</TH>
                    <TH>% do Total</TH>
                  </tr>
                </thead>
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
          </div>
        )}

        {/* Por Categoria — Gráfico */}
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
                  <Cell key={e.categoria} fill={e.variacao > 10 ? '#8C1414' : e.variacao > 0 ? '#D9B504' : '#97A624'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela detalhada com top/bottom */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #E8E8E2', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginRight: 8 }}>
              Itens de Custo
            </span>
            {[
              { key: 'todos', label: 'Todos' },
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
                {dadosExibidos.map((c, i) => (
                  <tr key={i}>
                    <TD>{c.categoria}</TD>
                    <TD color="#6A6A5A">{c.subcategoria}</TD>
                    {lojaFiltro === 'Todas' && <TD color="#6A6A5A">{c.loja}</TD>}
                    <TD mono color="#6A6A5A">{fmt(c.orcado)}</TD>
                    <TD mono>{fmt(c.realizado)}</TD>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8' }}><VarBadge pct={c.variacao} /></td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8', fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: c.realizado - c.orcado > 0 ? '#8C1414' : '#97A624' }}>
                      {c.realizado - c.orcado >= 0 ? '+' : ''}{fmt(c.realizado - c.orcado)}
                    </td>
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
