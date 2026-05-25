import React, { useMemo } from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import Header from '../layout/Header.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'
import { fmt, fmtPct, diasAteVencimento } from '../../utils.js'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

const ORDEM_MESES = ['Jan/24','Fev/24','Mar/24','Abr/24','Mai/24','Jun/24','Jul/24','Ago/24','Set/24','Out/24','Nov/24','Dez/24',
                     'Jan/25','Fev/25','Mar/25','Abr/25','Mai/25','Jun/25','Jul/25','Ago/25','Set/25','Out/25','Nov/25','Dez/25',
                     'Jan/26','Fev/26','Mar/26','Abr/26','Mai/26','Jun/26','Jul/26','Ago/26','Set/26','Out/26','Nov/26','Dez/26']

function sortMeses(arr) {
  return [...arr].sort((a,b) => {
    const ia = ORDEM_MESES.indexOf(a.mes), ib = ORDEM_MESES.indexOf(b.mes)
    return (ia<0?999:ia)-(ib<0?999:ib)
  })
}

// Card estilo faturamento — label pequeno cinza, número grande, sub colorido
function KpiCard({ label, valor, sub, subColor, subIcon: SubIcon, wide }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: '1px solid #F0F0F0',
      padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 8,
      gridColumn: wide ? 'span 2' : undefined,
    }}>
      <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#999', display: 'flex', alignItems: 'center', gap: 6 }}>
        {label}
      </span>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a', lineHeight: 1, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
        {valor}
      </div>
      {sub && (
        <div style={{ fontSize: 12.5, fontWeight: 500, color: subColor || '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
          {SubIcon && <SubIcon size={12} />}
          {sub}
        </div>
      )}
    </div>
  )
}

function AlertaItem({ conta }) {
  const dias    = diasAteVencimento(conta.vencimento)
  const vencido = conta.status === 'vencido'
  const cor     = vencido ? '#ef4444' : '#f59e0b'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: '1px solid #F7F7F7' }}>
      <StatusBadge status={conta.status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conta.nome}</div>
        <div style={{ fontSize: 11.5, color: '#999', marginTop: 1 }}>{conta.centro}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt(conta.valor)}</div>
        <div style={{ fontSize: 11, color: cor, fontWeight: 500, marginTop: 1 }}>
          {vencido ? `${Math.abs(dias)}d atraso` : dias === 0 ? 'vence hoje' : `${dias}d`}
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
  } = useFinanceiro()

  // hoje como string para subtitle
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

  // ── Evolução 6 meses ─────────────────────────────────────────
  const evolucao = useMemo(() => {
    const map = {}
    const add = (arr, campo) => arr.forEach(({ mes, total_realizado }) => {
      if (!map[mes]) map[mes] = { mes, fixo:0, variavel:0 }
      map[mes][campo] += total_realizado
    })
    add(historicoFiltrado,         'fixo')
    add(historicoVariavelFiltrado, 'variavel')
    return sortMeses(Object.values(map)).slice(-6)
  }, [historicoFiltrado, historicoVariavelFiltrado])

  // ── KPIs ─────────────────────────────────────────────────────
  const { totalMes, variacaoPct, variacaoR, mesMostrado } = useMemo(() => {
    if (!evolucao.length) return { totalMes:0, variacaoPct:0, variacaoR:0, mesMostrado:'' }
    const ult  = evolucao[evolucao.length-1]
    const prev = evolucao.length > 1 ? evolucao[evolucao.length-2] : null
    const total    = ult.fixo + ult.variavel
    const anterior = prev ? prev.fixo + prev.variavel : 0
    const difR     = total - anterior
    const difPct   = anterior > 0 ? (difR/anterior)*100 : 0
    return { totalMes: total, variacaoPct: difPct, variacaoR: difR, mesMostrado: ult.mes }
  }, [evolucao])

  // ── Maior alta/queda ─────────────────────────────────────────
  const { maiorAlta, maiorQueda } = useMemo(() => {
    const todos = [...historicoCatFixoFiltrado, ...historicoCatVariavelFiltrado]
    const meses = sortMeses([...new Set(todos.map(h=>h.mes))].map(m=>({mes:m}))).map(x=>x.mes)
    const ultMes = meses[meses.length-1], prevMes = meses[meses.length-2]
    if (!ultMes || !prevMes) return { maiorAlta:null, maiorQueda:null }
    const cats = [...new Set(todos.map(h=>h.categoria))]
    const vars = cats.map(cat => {
      const u = todos.filter(h=>h.mes===ultMes&&h.categoria===cat).reduce((s,h)=>s+h.realizado,0)
      const p = todos.filter(h=>h.mes===prevMes&&h.categoria===cat).reduce((s,h)=>s+h.realizado,0)
      return { categoria:cat, difR:u-p, difPct: p>0?((u-p)/p)*100:0 }
    }).filter(v=>v.difR!==0).sort((a,b)=>b.difR-a.difR)
    return { maiorAlta: vars[0]||null, maiorQueda: vars[vars.length-1]||null }
  }, [historicoCatFixoFiltrado, historicoCatVariavelFiltrado])

  // ── Por unidade ───────────────────────────────────────────────
  const porUnidade = useMemo(() => {
    const mesLabel = (m) => {
      if (!m) return ''
      const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
      const [a, mo] = m.split('-')
      return `${MESES[parseInt(mo)-1]}/${a.substring(2)}`
    }
    const label = mesFiltro ? mesLabel(mesFiltro) : null

    const map = {}
    const add = (arr) => arr.forEach(({ loja, total_realizado, mes }) => {
      if (label && mes !== label && mes !== mesFiltro) return
      if (!map[loja]) map[loja] = { loja, total:0 }
      map[loja].total += total_realizado
    })
    add(historicoFiltrado)
    add(historicoVariavelFiltrado)
    const lista = Object.values(map).sort((a,b)=>b.total-a.total)
    const grand = lista.reduce((s,l)=>s+l.total,0)
    return lista.map(l=>({ ...l, pct: grand>0?(l.total/grand)*100:0 }))
  }, [historicoFiltrado, historicoVariavelFiltrado, mesFiltro])

  // ── Alertas ───────────────────────────────────────────────────
  const alertas = useMemo(() => {
    const hoje = new Date(); hoje.setHours(0,0,0,0)
    const em7d = new Date(hoje.getTime()+7*86400000)
    return [...contasFiltradas]
      .filter(c => c.status!=='pago' && (c.status==='vencido' || new Date(c.vencimento)<=em7d))
      .sort((a,b)=>({vencido:0,pendente:1}[a.status]??2)-({vencido:0,pendente:1}[b.status]??2)||b.valor-a.valor)
      .slice(0,6)
  }, [contasFiltradas])

  const totalVencido = contasFiltradas.filter(c=>c.status==='vencido').reduce((s,c)=>s+c.valor,0)

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Header title="Visão Geral" subtitle={hoje} />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── KPIs principais ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <KpiCard
            label="Custo Total do Mês"
            valor={fmt(totalMes)}
            sub={mesMostrado}
          />
          <KpiCard
            label="Variação vs Mês Anterior"
            valor={fmtPct(variacaoPct)}
            sub={`${variacaoR>=0?'+':''}${fmt(variacaoR)}`}
            subColor={variacaoPct>5?'#ef4444':variacaoPct>0?'#f59e0b':'#22c55e'}
            subIcon={variacaoPct>=0?TrendingUp:TrendingDown}
          />
          {maiorAlta ? (
            <KpiCard
              label="Maior Alta do Mês"
              valor={maiorAlta.categoria}
              sub={`+${fmt(maiorAlta.difR)}  (${fmtPct(maiorAlta.difPct)})`}
              subColor="#ef4444"
              subIcon={TrendingUp}
            />
          ) : <div />}
          {maiorQueda && maiorQueda.difR < 0 ? (
            <KpiCard
              label="Maior Queda do Mês"
              valor={maiorQueda.categoria}
              sub={`${fmt(maiorQueda.difR)}  (${fmtPct(maiorQueda.difPct)})`}
              subColor="#22c55e"
              subIcon={TrendingDown}
            />
          ) : <div />}
        </div>

        {/* ── Gráfico + Por unidade ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14 }}>

          {/* Gráfico */}
          <div style={{ border: '1px solid #F0F0F0', borderRadius: 12, padding: '20px 20px 12px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#999', marginBottom: 18 }}>
              Evolução de Custo — {lojaFiltro}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={evolucao} margin={{ top:4, right:4, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1a1a1a" stopOpacity={0.06}/>
                    <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false}/>
                <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#BBB' }} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>`${(v/1000).toFixed(0)}k`} tick={{ fontSize:11, fill:'#BBB' }} axisLine={false} tickLine={false} width={40}/>
                <Tooltip formatter={(v,n)=>[fmt(v), n==='fixo'?'Fixo':'Variável']} contentStyle={{ fontSize:12, border:'1px solid #F0F0F0', borderRadius:8, boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}/>
                <Legend formatter={n=>n==='fixo'?'Custo Fixo':'Custo Variável'} iconSize={8} wrapperStyle={{ fontSize:11, paddingTop:8 }}/>
                <Area type="monotone" dataKey="variavel" stackId="1" stroke="#22c55e" strokeWidth={1.5} fill="url(#gV)"/>
                <Area type="monotone" dataKey="fixo"     stackId="1" stroke="#1a1a1a" strokeWidth={2}   fill="url(#gF)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Por unidade */}
          <div style={{ border: '1px solid #F0F0F0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #F7F7F7' }}>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#999' }}>
                Por Loja
              </span>
            </div>
            <div style={{ padding: '8px 0', maxHeight: 260, overflowY: 'auto' }}>
              {porUnidade.length === 0
                ? <div style={{ padding:'20px 18px', color:'#CCC', fontSize:13 }}>Sem dados</div>
                : porUnidade.map((u,i) => (
                  <div key={i} style={{ padding:'9px 18px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                      <span style={{ fontSize:13.5, fontWeight:500 }}>{u.loja}</span>
                      <span style={{ fontSize:13.5, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{fmt(u.total)}</span>
                    </div>
                    <div style={{ height:3, background:'#F5F5F5', borderRadius:99 }}>
                      <div style={{ height:'100%', width:`${u.pct}%`, background:'#1a1a1a', borderRadius:99 }}/>
                    </div>
                    <div style={{ fontSize:11, color:'#BBB', marginTop:3 }}>{u.pct.toFixed(1)}% do total</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* ── Alertas ── */}
        {alertas.length > 0 && (
          <div style={{ border: '1px solid #F0F0F0', borderRadius: 12, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid #F7F7F7', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <AlertTriangle size={13} color="#f59e0b"/>
                <span style={{ fontSize:11, fontWeight:500, letterSpacing:'0.05em', textTransform:'uppercase', color:'#999' }}>
                  Atenção agora
                </span>
              </div>
              <div style={{ display:'flex', gap:16 }}>
                {totalVencido > 0 && (
                  <span style={{ fontSize:12.5, fontWeight:600, color:'#ef4444' }}>
                    Vencido: {fmt(totalVencido)}
                  </span>
                )}
                <span style={{ fontSize:11.5, color:'#BBB' }}>{alertas.length} contas</span>
              </div>
            </div>
            <div style={{ padding:'0 20px' }}>
              {alertas.map((c,i) => <AlertaItem key={i} conta={c}/>)}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
