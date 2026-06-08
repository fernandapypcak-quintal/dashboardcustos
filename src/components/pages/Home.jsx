import React, { useMemo } from 'react'
import { useFinanceiro, sortMesLabel } from '../../hooks/useFinanceiro.jsx'
import Header from '../layout/Header.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'
import { fmt, fmtPct, diasAteVencimento } from '../../utils.js'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Activity, ArrowUp, ArrowDown } from 'lucide-react'


// Card grande estilo faturamento
function BigCard({ label, valor, sub, subColor, icon: Icon, iconBg, iconColor }) {
  // ── Fora do escopo ───────────────────────────────────────────
  const dadosFora = useMemo(() => {
    const foraItems = (historicoRaw||[]).filter(h => h.tipo === 'Fora')
    const foraLoja  = lojaFiltro !== 'Todas' ? foraItems.filter(h => h.loja === lojaFiltro) : foraItems
    const porCat = {}, porMes = {}
    foraLoja.forEach(({ categoria, mes, total_realizado }) => {
      porCat[categoria] = (porCat[categoria]||0) + total_realizado
      porMes[mes]       = (porMes[mes]||0)       + total_realizado
    })
    const mesesFora = sortMesLabel(Object.keys(porMes)).slice(-5)
    const total = Object.values(porCat).reduce((s,v)=>s+v,0)
    return { porCat, porMes, mesesFora, total }
  }, [historicoRaw, lojaFiltro])


  return (
    <div style={{ background:'#fff', border:'1px solid #F0F0F0', borderRadius:12, padding:'20px 22px', display:'flex', flexDirection:'column', gap:12, minWidth:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:11, fontWeight:500, letterSpacing:'0.05em', textTransform:'uppercase', color:'#999' }}>{label}</span>
        {Icon && (
          <div style={{ width:32, height:32, borderRadius:8, background: iconBg||'#F5F5F5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon size={15} color={iconColor||'#999'}/>
          </div>
        )}
      </div>
      <div style={{ fontSize:30, fontWeight:700, color:'#1a1a1a', lineHeight:1, letterSpacing:'-0.5px', fontVariantNumeric:'tabular-nums', wordBreak:'break-word' }}>
        {valor}
      </div>
      {sub && (
        <div style={{ fontSize:12.5, fontWeight:500, color: subColor||'#999', display:'flex', alignItems:'center', gap:4 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function AlertaItem({ conta }) {
  const dias    = diasAteVencimento(conta.vencimento)
  const vencido = conta.status === 'vencido'
  const cor     = vencido ? '#dc2626' : '#d97706'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom:'1px solid #F7F7F7' }}>
      <StatusBadge status={conta.status}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13.5, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{conta.nome}</div>
        <div style={{ fontSize:11.5, color:'#999', marginTop:1 }}>{conta.centro}</div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontSize:14, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{fmt(conta.valor)}</div>
        <div style={{ fontSize:11, color:cor, fontWeight:500, marginTop:1 }}>
          {vencido ? `${Math.abs(dias)}d atraso` : dias===0 ? 'vence hoje' : `${dias}d`}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const {
    contasFiltradas, lojaFiltro, mesFiltro, historicoRaw,
    historicoFiltrado, historicoVariavelFiltrado,
    historicoCatFixoFiltrado, historicoCatVariavelFiltrado,
  } = useFinanceiro()

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

  const evolucao = useMemo(() => {
    const map = {}
    const add = (arr, campo) => arr.forEach(({ mes, total_realizado }) => {
      if (!map[mes]) map[mes] = { mes, fixo:0, variavel:0 }
      map[mes][campo] += total_realizado
    })
    add(historicoFiltrado, 'fixo')
    add(historicoVariavelFiltrado, 'variavel')
    const sorted = Object.values(map)
    sorted.sort((a, b) => {
      const list = sortMesLabel(sorted.map(x => x.mes))
      return list.indexOf(a.mes) - list.indexOf(b.mes)
    })
    return sorted.slice(-6)
  }, [historicoFiltrado, historicoVariavelFiltrado])

  const { totalMes, variacaoPct, variacaoR, mesMostrado } = useMemo(() => {
    if (!evolucao.length) return { totalMes:0, variacaoPct:0, variacaoR:0, mesMostrado:'' }
    const ult  = evolucao[evolucao.length-1]
    const prev = evolucao.length > 1 ? evolucao[evolucao.length-2] : null
    const tot  = ult.fixo + ult.variavel
    const ant  = prev ? prev.fixo + prev.variavel : 0
    return { totalMes:tot, variacaoPct: ant>0?((tot-ant)/ant)*100:0, variacaoR:tot-ant, mesMostrado:ult.mes }
  }, [evolucao])

  const { maiorAlta, maiorQueda } = useMemo(() => {
    const todos = [...historicoCatFixoFiltrado, ...historicoCatVariavelFiltrado]
    const meses = sortMesLabel([...new Set(todos.map(h=>h.mes))].map(m=>({mes:m}))).map(x=>x.mes)
    const ult = meses[meses.length-1], prev = meses[meses.length-2]
    if (!ult || !prev) return { maiorAlta:null, maiorQueda:null }
    const cats = [...new Set(todos.map(h=>h.categoria))]
    const vars = cats.map(cat => {
      const u = todos.filter(h=>h.mes===ult&&h.categoria===cat).reduce((s,h)=>s+h.realizado,0)
      const p = todos.filter(h=>h.mes===prev&&h.categoria===cat).reduce((s,h)=>s+h.realizado,0)
      return { categoria:cat, difR:u-p, difPct:p>0?((u-p)/p)*100:0 }
    }).filter(v=>v.difR!==0).sort((a,b)=>b.difR-a.difR)
    return { maiorAlta:vars[0]||null, maiorQueda:vars[vars.length-1]||null }
  }, [historicoCatFixoFiltrado, historicoCatVariavelFiltrado])

  const porUnidade = useMemo(() => {
    const toLabel = m => {
      if (!m) return ''
      const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
      const [a,mo] = m.split('-')
      return `${MESES[parseInt(mo)-1]}/${a.substring(2)}`
    }
    const lbl = mesFiltro ? toLabel(mesFiltro) : null
    const map = {}
    const add = arr => arr.forEach(({ loja, total_realizado, mes }) => {
      if (lbl && mes !== lbl && mes !== mesFiltro) return
      if (!map[loja]) map[loja] = { loja, total:0 }
      map[loja].total += total_realizado
    })
    add(historicoFiltrado); add(historicoVariavelFiltrado)
    const lista = Object.values(map).sort((a,b)=>b.total-a.total)
    const grand = lista.reduce((s,l)=>s+l.total,0)
    return lista.map(l=>({ ...l, pct: grand>0?(l.total/grand)*100:0 }))
  }, [historicoFiltrado, historicoVariavelFiltrado, mesFiltro])

  const alertas = useMemo(() => {
    const h = new Date(); h.setHours(0,0,0,0)
    const e7 = new Date(h.getTime()+7*86400000)
    return [...contasFiltradas]
      .filter(c => c.status!=='pago' && (c.status==='vencido'||new Date(c.vencimento)<=e7))
      .sort((a,b)=>({vencido:0,pendente:1}[a.status]??2)-({vencido:0,pendente:1}[b.status]??2)||b.valor-a.valor)
      .slice(0,6)
  }, [contasFiltradas])

  const totalVencido = contasFiltradas.filter(c=>c.status==='vencido').reduce((s,c)=>s+c.valor,0)

  // ── Fora do escopo ───────────────────────────────────────────
  const dadosFora = useMemo(() => {
    const foraItems = (historicoRaw||[]).filter(h => h.tipo === 'Fora')
    const foraLoja  = lojaFiltro !== 'Todas' ? foraItems.filter(h => h.loja === lojaFiltro) : foraItems
    const porCat = {}, porMes = {}
    foraLoja.forEach(({ categoria, mes, total_realizado }) => {
      porCat[categoria] = (porCat[categoria]||0) + total_realizado
      porMes[mes]       = (porMes[mes]||0)       + total_realizado
    })
    const mesesFora = sortMesLabel(Object.keys(porMes)).slice(-5)
    const total = Object.values(porCat).reduce((s,v)=>s+v,0)
    return { porCat, porMes, mesesFora, total }
  }, [historicoRaw, lojaFiltro])


  return (
    <div style={{ background:'#fff', minHeight:'100vh' }}>
      <Header title="Visão Geral" subtitle={hoje}/>

      <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 }}>

        {/* ── 4 KPI cards em linha ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          <BigCard
            label="Custo Total do Mês"
            valor={fmt(totalMes)}
            sub={mesMostrado || '—'}
            icon={DollarSign} iconBg="#F0FDF4" iconColor="#16a34a"
          />
          <BigCard
            label="Variação vs Mês Anterior"
            valor={fmtPct(variacaoPct)}
            sub={
              <span style={{ color: variacaoPct>5?'#dc2626':variacaoPct>0?'#d97706':'#16a34a', display:'flex', alignItems:'center', gap:4 }}>
                {variacaoPct >= 0 ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
                {variacaoR >= 0 ? '+' : ''}{fmt(variacaoR)} vs mês anterior
              </span>
            }
            icon={Activity} iconBg="#F5F5F5" iconColor="#999"
          />
          <BigCard
            label="Maior Alta do Mês"
            valor={maiorAlta ? maiorAlta.categoria : '—'}
            sub={maiorAlta ? (
              <span style={{ color:'#dc2626', display:'flex', alignItems:'center', gap:4 }}>
                <ArrowUp size={12}/>+{fmt(maiorAlta.difR)} ({fmtPct(maiorAlta.difPct)})
              </span>
            ) : null}
            icon={TrendingUp} iconBg="#FEF2F2" iconColor="#dc2626"
          />
          <BigCard
            label="Maior Queda do Mês"
            valor={maiorQueda && maiorQueda.difR < 0 ? maiorQueda.categoria : '—'}
            sub={maiorQueda && maiorQueda.difR < 0 ? (
              <span style={{ color:'#16a34a', display:'flex', alignItems:'center', gap:4 }}>
                <ArrowDown size={12}/>{fmt(maiorQueda.difR)} ({fmtPct(maiorQueda.difPct)})
              </span>
            ) : null}
            icon={TrendingDown} iconBg="#F0FDF4" iconColor="#16a34a"
          />
        </div>

        {/* ── Gráfico evolução (full width) ── */}
        <div style={{ border:'1px solid #F0F0F0', borderRadius:12, padding:'20px 24px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#1a1a1a' }}>Evolução de Custo</div>
              <div style={{ fontSize:12, color:'#999', marginTop:2 }}>{lojaFiltro} · últimos 6 meses</div>
            </div>
            <div style={{ display:'flex', gap:16, fontSize:12, color:'#999', alignItems:'center' }}>
              <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:12, height:2, background:'#1a1a1a', display:'inline-block', borderRadius:1 }}/>Custo Fixo
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:12, height:2, background:'#22c55e', display:'inline-block', borderRadius:1 }}/>Custo Variável
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
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
              <XAxis dataKey="mes" tick={{ fontSize:12, fill:'#BBB', fontFamily:'Inter' }} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>`${(v/1000).toFixed(0)}k`} tick={{ fontSize:12, fill:'#BBB', fontFamily:'Inter' }} axisLine={false} tickLine={false} width={44}/>
              <Tooltip
                formatter={(v,n)=>[fmt(v), n==='fixo'?'Custo Fixo':'Custo Variável']}
                contentStyle={{ fontSize:12, border:'1px solid #F0F0F0', borderRadius:10, boxShadow:'0 4px 20px rgba(0,0,0,0.08)', fontFamily:'Inter' }}
              />
              <Area type="monotone" dataKey="variavel" stackId="1" stroke="#22c55e" strokeWidth={2} fill="url(#gV)" dot={false}/>
              <Area type="monotone" dataKey="fixo"     stackId="1" stroke="#1a1a1a" strokeWidth={2} fill="url(#gF)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Por loja + Alertas (side by side) ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

          {/* Por loja */}
          <div style={{ border:'1px solid #F0F0F0', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px 14px', borderBottom:'1px solid #F7F7F7' }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#1a1a1a' }}>Por Loja</div>
              <div style={{ fontSize:12, color:'#999', marginTop:2 }}>Custo total do período</div>
            </div>
            <div style={{ padding:'4px 0', maxHeight:320, overflowY:'auto' }}>
              {porUnidade.length === 0
                ? <div style={{ padding:'20px', color:'#CCC', fontSize:13 }}>Sem dados para o filtro selecionado</div>
                : porUnidade.map((u,i) => (
                  <div key={i} style={{ padding:'10px 20px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <span style={{ fontSize:13.5, fontWeight:500, color:'#1a1a1a' }}>{u.loja}</span>
                      <span style={{ fontSize:13.5, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{fmt(u.total)}</span>
                    </div>
                    <div style={{ height:3, background:'#F5F5F5', borderRadius:99 }}>
                      <div style={{ height:'100%', width:`${u.pct}%`, background:'#1a1a1a', borderRadius:99, transition:'width 0.5s' }}/>
                    </div>
                    <div style={{ fontSize:11, color:'#BBB', marginTop:4 }}>{u.pct.toFixed(1)}% do total</div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Alertas */}
          <div style={{ border:'1px solid #F0F0F0', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px 14px', borderBottom:'1px solid #F7F7F7', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#1a1a1a', display:'flex', alignItems:'center', gap:7 }}>
                  <AlertTriangle size={14} color="#d97706"/> Atenção agora
                </div>
                <div style={{ fontSize:12, color:'#999', marginTop:2 }}>Vencido e vence em 7 dias</div>
              </div>
              {totalVencido > 0 && (
                <span style={{ fontSize:13, fontWeight:600, color:'#dc2626', fontVariantNumeric:'tabular-nums' }}>
                  {fmt(totalVencido)} vencido
                </span>
              )}
            </div>
            <div style={{ padding:'0 20px', maxHeight:320, overflowY:'auto' }}>
              {alertas.length === 0
                ? <div style={{ padding:'20px 0', color:'#CCC', fontSize:13 }}>Nenhuma conta crítica 🎉</div>
                : alertas.map((c,i) => <AlertaItem key={i} conta={c}/>)
              }
            </div>
          </div>

        </div>

        {/* ── Fora do escopo operacional ── */}
        {dadosFora.total > 0 && (
          <div style={{ border:'1px solid #F0F0F0', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px 14px', borderBottom:'1px solid #F7F7F7', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#1a1a1a' }}>Fora do Escopo Operacional</div>
                <div style={{ fontSize:12, color:'#999', marginTop:2 }}>Dividendos, mútuo, royalties, aplicações financeiras</div>
              </div>
              <div style={{ fontSize:20, fontWeight:700, fontVariantNumeric:'tabular-nums', color:'#888' }}>{fmt(dadosFora.total)}</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:`repeat(${dadosFora.mesesFora.length||1}, 1fr)`, borderBottom:'1px solid #F7F7F7' }}>
              {dadosFora.mesesFora.map(mes => (
                <div key={mes} style={{ padding:'12px 16px', borderRight:'1px solid #F7F7F7', textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'#BBB', marginBottom:4 }}>{mes}</div>
                  <div style={{ fontSize:14, fontWeight:600, fontVariantNumeric:'tabular-nums', color:'#888' }}>{fmt(dadosFora.porMes[mes]||0)}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:'8px 0' }}>
              {Object.entries(dadosFora.porCat).sort((a,b)=>b[1]-a[1]).map(([cat,val]) => (
                <div key={cat} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#CCC', flexShrink:0 }}/>
                    <span style={{ fontSize:13, color:'#555' }}>{cat}</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:500, fontVariantNumeric:'tabular-nums', color:'#888' }}>{fmt(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
