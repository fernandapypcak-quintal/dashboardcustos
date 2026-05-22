import React, { useState, useMemo } from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import Header from '../layout/Header.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'
import PainelDetalhe from '../ui/PainelDetalhe.jsx'
import { fmt, fmtData, diasAteVencimento } from '../../utils.js'
import { Search } from 'lucide-react'

const TH = ({ children, onClick, sorted }) => (
  <th onClick={onClick} style={{
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#fff', background: '#0D0D0D', padding: '10px 14px', textAlign: 'left',
    cursor: onClick ? 'pointer' : 'default', whiteSpace: 'nowrap', userSelect: 'none',
  }}>
    {children} {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : ''}
  </th>
)

const TD = ({ children, mono, muted }) => (
  <td style={{
    padding: '11px 14px', fontSize: 13, color: muted ? '#6A6A5A' : '#0D0D0D',
    borderBottom: '1px solid #F0F0E8',
    fontFamily: mono ? "'DM Mono', monospace" : undefined,
    fontWeight: mono ? 500 : undefined,
  }}>
    {children}
  </td>
)

export default function ContasPagar() {
  const { contasFiltradas } = useFinanceiro()
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('todos')
  const [catFiltro, setCatFiltro] = useState('todas')
  const [sortKey, setSortKey] = useState('vencimento')
  const [sortDir, setSortDir] = useState('asc')
  const [contaSelecionada, setContaSelecionada] = useState(null)
  const [topN, setTopN] = useState(null) // null = todos, 20 = top 20

  const categorias = useMemo(() => {
    const set = new Set(contasFiltradas.map((c) => c.categoria))
    return ['todas', ...Array.from(set).sort()]
  }, [contasFiltradas])

  const dados = useMemo(() => {
    let r = contasFiltradas
    if (busca) r = r.filter((c) => [c.nome, c.fornecedor, c.categoria, c.centro].some((f) => f.toLowerCase().includes(busca.toLowerCase())))
    if (statusFiltro !== 'todos') r = r.filter((c) => c.status === statusFiltro)
    if (catFiltro !== 'todas') r = r.filter((c) => c.categoria === catFiltro)
    r = [...r].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey]
      if (sortKey === 'valor') { va = Number(va); vb = Number(vb) }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return r
  }, [contasFiltradas, busca, statusFiltro, catFiltro, sortKey, sortDir])

  // Top N por valor
  const dadosExibidos = useMemo(() => {
    if (!topN) return dados
    return [...dados].sort((a, b) => b.valor - a.valor).slice(0, topN)
  }, [dados, topN])

  const totalExibido = dadosExibidos.reduce((s, c) => s + c.valor, 0)

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const S_BTN = (ativo) => ({
    padding: '5px 12px', borderRadius: 5, border: '1px solid #E8E8E2', cursor: 'pointer', fontSize: 12,
    background: ativo ? '#0D0D0D' : '#fff', color: ativo ? '#fff' : '#4A4A3A', fontWeight: ativo ? 600 : 400,
  })

  return (
    <div>
      <Header title="Contas a Pagar" />
      <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Barra de filtros */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Busca */}
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 280 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#B0B0A0' }} />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar conta, fornecedor..."
              style={{
                width: '100%', padding: '7px 10px 7px 32px', border: '1px solid #E8E8E2',
                borderRadius: 6, fontSize: 13, background: '#fff', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Status */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['todos', 'pago', 'pendente', 'vencido'].map((s) => (
              <button key={s} style={S_BTN(statusFiltro === s)} onClick={() => setStatusFiltro(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Categoria */}
          <select value={catFiltro} onChange={(e) => setCatFiltro(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #E8E8E2', borderRadius: 5, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
            {categorias.map((c) => <option key={c} value={c}>{c === 'todas' ? 'Todas categorias' : c}</option>)}
          </select>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {[null, 20].map((n) => (
              <button key={String(n)} style={S_BTN(topN === n)} onClick={() => setTopN(n)}>
                {n === null ? 'Todos' : `Top ${n} maiores`}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo */}
        <div style={{ fontSize: 12, color: '#8A8A7A' }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: '#0D0D0D' }}>{dadosExibidos.length}</span> contas ·{' '}
          Total: <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: '#0D0D0D' }}>{fmt(totalExibido)}</span>
        </div>

        {/* Tabela */}
        <div style={{ background: '#fff', border: '1px solid #E8E8E2', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <TH onClick={() => toggleSort('nome')} sorted={sortKey === 'nome' ? sortDir : null}>Nome</TH>
                  <TH>Fornecedor</TH>
                  <TH>Centro</TH>
                  <TH>Categoria</TH>
                  <TH onClick={() => toggleSort('vencimento')} sorted={sortKey === 'vencimento' ? sortDir : null}>Vencimento</TH>
                  <TH onClick={() => toggleSort('valor')} sorted={sortKey === 'valor' ? sortDir : null}>Valor</TH>
                  <TH>Status</TH>
                  <TH>Dias</TH>
                </tr>
              </thead>
              <tbody>
                {dadosExibidos.map((c) => {
                  const dias = diasAteVencimento(c.vencimento)
                  const diasLabel = c.status === 'pago' ? '—' : dias === null ? '—' : dias < 0 ? `${Math.abs(dias)}d atraso` : `${dias}d`
                  const diasColor = c.status === 'pago' ? '#B0B0A0' : dias < 0 ? '#8C1414' : dias <= 7 ? '#D9B504' : '#4A4A3A'
                  return (
                    <tr key={c.id}
                      onClick={() => setContaSelecionada(c)}
                      style={{ cursor: 'pointer', transition: 'background 0.08s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAF8'}
                      onMouseLeave={(e) => e.currentTarget.style.background = ''}
                    >
                      <TD>{c.nome}</TD>
                      <TD muted>{c.fornecedor}</TD>
                      <TD muted>{c.centro}</TD>
                      <TD muted>{c.categoria}</TD>
                      <TD mono>{fmtData(c.vencimento)}</TD>
                      <TD mono>{fmt(c.valor)}</TD>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8' }}>
                        <StatusBadge status={c.status} />
                      </td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #F0F0E8', fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 600, color: diasColor }}>
                        {diasLabel}
                      </td>
                    </tr>
                  )
                })}
                {dadosExibidos.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#B0B0A0', fontSize: 13 }}>Nenhuma conta encontrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PainelDetalhe conta={contaSelecionada} onClose={() => setContaSelecionada(null)} />
    </div>
  )
}
