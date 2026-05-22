import React, { useMemo, useState } from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import Header from '../layout/Header.jsx'
import { fmt, fmtPct } from '../../utils.js'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'

const CORES_LOJAS = { 'Loja Centro': '#0D0D0D', 'Loja Sul': '#97A624', 'Loja Norte': '#D9B504' }

export default function Evolucao() {
  const { historico, historicoFiltrado, lojaFiltro } = useFinanceiro()
  const [metric, setMetric] = useState('realizado') // 'realizado' | 'orcado'

  // Dados para o gráfico de linhas (por loja, série temporal)
  const meses = useMemo(() => {
    const set = new Set(historico.map((h) => h.mes))
    return Array.from(set)
  }, [historico])

  // Pivot: { mes, 'Loja Centro': val, 'Loja Sul': val, ... }
  const lojas = useMemo(() => Array.from(new Set(historico.map((h) => h.loja))), [historico])

  const dadosLinha = useMemo(() => {
    return meses.map((mes) => {
      const row = { mes }
      lojas.forEach((loja) => {
        const entry = historico.find((h) => h.mes === mes && h.loja === loja)
        row[loja] = entry ? entry[metric] : 0
      })
      return row
    })
  }, [meses, lojas, historico, metric])

  // Oscilação mês a mês (para a loja/total filtrado)
  const oscilacao = useMemo(() => {
    const map = {}
    historicoFiltrado.forEach(({ mes, total_realizado, total_orcado }) => {
      if (!map[mes]) map[mes] = { mes, realizado: 0, orcado: 0 }
      map[mes].realizado += total_realizado
      map[mes].orcado += total_orcado
    })
    const lista = Object.values(map)
    return lista.map((r, i) => {
      const prev = lista[i - 1]
      const variacao = prev && prev.realizado > 0 ? ((r.realizado - prev.realizado) / prev.realizado) * 100 : 0
      return { ...r, variacao }
    })
  }, [historicoFiltrado])

  // Novos custos = itens que aparecem no último mês mas não no anterior (mock: simulado)
  const novosCustos = useMemo(() => {
    return [
      { item: 'Licença App Delivery', loja: 'Loja Norte', valor: 1200, mes: 'Mar/25' },
    ]
  }, [])

  const S = (ativo) => ({
    padding: '5px 12px', borderRadius: 5, border: '1px solid #E8E8E2', cursor: 'pointer', fontSize: 12,
    background: ativo ? '#0D0D0D' : '#fff', color: ativo ? '#fff' : '#4A4A3A', fontWeight: ativo ? 600 : 400,
  })

  return (
    <div>
      <Header title="Evolução Histórica" />
      <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Gráfico de linhas por loja */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>
              Custo Fixo por Loja — 6 meses
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={S(metric === 'realizado')} onClick={() => setMetric('realizado')}>Realizado</button>
              <button style={S(metric === 'orcado')} onClick={() => setMetric('orcado')}>Orçado</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dadosLinha} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0E8" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#8A8A7A' }} axisLine={false} tickLine={false} width={44} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, border: '1px solid #E8E8E2', borderRadius: 6 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              {lojas.map((loja) => (
                <Line
                  key={loja}
                  type="monotone"
                  dataKey={loja}
                  stroke={CORES_LOJAS[loja] || '#97A624'}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Oscilação mês a mês */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginBottom: 16 }}>
            Oscilação Mensal — {lojaFiltro}
          </div>
          <ResponsiveContainer width="100%" height={180}>
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

        {/* Tabela de evolução */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #E8E8E2' }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>
              Resumo Mensal
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Mês', 'Orçado', 'Realizado', 'Variação Mês a Mês', 'vs Orçamento'].map((h) => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', background: '#0D0D0D', padding: '10px 14px', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {oscilacao.map((r, i) => {
                const vsOrc = r.orcado > 0 ? ((r.realizado - r.orcado) / r.orcado) * 100 : 0
                return (
                  <tr key={i}>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8', fontWeight: 600 }}>{r.mes}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8', fontFamily: "'DM Mono', monospace", color: '#6A6A5A' }}>{fmt(r.orcado)}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8', fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{fmt(r.realizado)}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8' }}>
                      {i === 0 ? <span style={{ color: '#B0B0A0', fontSize: 12 }}>—</span> : (
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, color: r.variacao > 5 ? '#8C1414' : r.variacao > 0 ? '#D9B504' : '#97A624' }}>
                          {fmtPct(r.variacao)}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8' }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, color: vsOrc > 5 ? '#8C1414' : vsOrc > 0 ? '#D9B504' : '#97A624' }}>
                        {fmtPct(vsOrc)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Novos Custos */}
        {novosCustos.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #E8E8E2', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A' }}>
                Novos Custos (última competência)
              </span>
              <span style={{ background: '#EEF5D5', color: '#5A6A10', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                {novosCustos.length} novo{novosCustos.length > 1 ? 's' : ''}
              </span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Item', 'Loja', 'Mês de Entrada', 'Valor'].map((h) => (
                    <th key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', background: '#0D0D0D', padding: '10px 14px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {novosCustos.map((n, i) => (
                  <tr key={i}>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8', fontWeight: 600 }}>{n.item}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8', color: '#6A6A5A' }}>{n.loja}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8', color: '#6A6A5A' }}>{n.mes}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8', fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{fmt(n.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}
