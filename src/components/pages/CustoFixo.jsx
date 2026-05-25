import React, { useMemo, useState } from 'react'
import { useFinanceiro } from '../../hooks/useFinanceiro.jsx'
import { useVariacaoMensal } from '../../hooks/useVariacaoMensal.js'
import Header from '../layout/Header.jsx'
import { fmt, fmtPct } from '../../utils.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts'

const CORES = ['#1a1a1a','#22c55e','#f59e0b','#3b82f6','#ef4444','#8b5cf6','#ec4899','#14b8a6']

const TH = ({ ch, right }) => (
  <th style={{ fontSize:10, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'#fff', background:'#1a1a1a', padding:'10px 14px', textAlign: right?'right':'left', whiteSpace:'nowrap' }}>{ch}</th>
)
const TD = ({ ch, mono, muted, right, color }) => (
  <td style={{ padding:'10px 14px', fontSize:13, borderBottom:'1px solid #F7F7F7', color: color||(muted?'#888':'#1a1a1a'), fontVariantNumeric: mono?'tabular-nums':undefined, textAlign: right?'right':'left' }}>{ch}</td>
)

function VarBadge({ pct }) {
  const color = pct>10?'#dc2626':pct>0?'#d97706':'#16a34a'
  const bg    = pct>10?'#FEF2F2':pct>0?'#FFFBEB':'#F0FDF4'
  return <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:600, fontVariantNumeric:'tabular-nums', background:bg, color }}>{fmtPct(pct)}</span>
}

function TabBtn({ label, ativo, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:'6px 16px', borderRadius:8, border: ativo?'none':'1px solid #E8E8E8', background: ativo?'#1a1a1a':'#fff', color: ativo?'#fff':'#666', fontSize:13, fontWeight: ativo?600:400, cursor:'pointer', fontFamily:'inherit' }}>
      {label}
    </button>
  )
}

export default function CustoFixo() {
  const { custosFiltrados, historicoCatFixoFiltrado, custosFixos, lojaFiltro } = useFinanceiro()
  const [topMode,   setTopMode]   = useState('todos')   // todos | top20 | bot20
  const [lojaMode,  setLojaMode]  = useState('geral')   // geral | porloja

  const { meses, categorias, dadosGrafico, tabelaHistorica, ranking } = useVariacaoMensal(historicoCatFixoFiltrado)

  const totalOrcado    = custosFiltrados.reduce((s,c)=>s+c.orcado,0)
  const totalRealizado = custosFiltrados.reduce((s,c)=>s+c.realizado,0)
  const varTotal = totalOrcado>0?((totalRealizado-totalOrcado)/totalOrcado)*100:0

  // Agrupado por categoria (geral)
  const porCategoria = useMemo(()=>{
    const map={}
    custosFiltrados.forEach(({categoria,orcado,realizado})=>{
      if(!map[categoria]) map[categoria]={categoria,orcado:0,realizado:0}
      map[categoria].orcado+=orcado; map[categoria].realizado+=realizado
    })
    return Object.values(map).map(r=>({...r,variacao:r.orcado>0?((r.realizado-r.orcado)/r.orcado)*100:0})).sort((a,b)=>b.realizado-a.realizado)
  },[custosFiltrados])

  // Por loja
  const porLoja = useMemo(()=>{
    const map={}
    custosFiltrados.forEach(({loja,orcado,realizado})=>{
      if(!map[loja]) map[loja]={loja,orcado:0,realizado:0}
      map[loja].orcado+=orcado; map[loja].realizado+=realizado
    })
    return Object.values(map).map(r=>({...r,variacao:r.orcado>0?((r.realizado-r.orcado)/r.orcado)*100:0}))
  },[custosFiltrados])

  // Itens individuais
  const porItem = useMemo(()=>custosFiltrados.map(c=>({...c,variacao:c.orcado>0?((c.realizado-c.orcado)/c.orcado)*100:0})),[custosFiltrados])

  // Agrupado por categoria+loja para o modo "por loja"
  const porCatLoja = useMemo(()=>{
    const map={}
    custosFiltrados.forEach(({categoria,loja,orcado,realizado})=>{
      const k=`${categoria}||${loja}`
      if(!map[k]) map[k]={categoria,loja,orcado:0,realizado:0}
      map[k].orcado+=orcado; map[k].realizado+=realizado
    })
    return Object.values(map).map(r=>({...r,variacao:r.orcado>0?((r.realizado-r.orcado)/r.orcado)*100:0})).sort((a,b)=>b.realizado-a.realizado)
  },[custosFiltrados])

  const baseItens = lojaMode==='geral' ? porCatLoja.map(r=>({...r,subcategoria:r.categoria})) : porItem
  const dadosExibidos = useMemo(()=>{
    const sorted=[...baseItens].sort((a,b)=>b.realizado-a.realizado)
    if(topMode==='top20') return sorted.slice(0,20)
    if(topMode==='bot20') return [...sorted].reverse().slice(0,20)
    return sorted
  },[baseItens,topMode])

  return (
    <div style={{ background:'#fff', minHeight:'100vh' }}>
      <Header title="Custo Fixo"/>
      <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 }}>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {[
            { label:'Total Orçado',    valor:fmt(totalOrcado),    color:'#888' },
            { label:'Total Realizado', valor:fmt(totalRealizado), color:'#1a1a1a' },
            { label:'Variação vs Orçamento', valor:fmtPct(varTotal), color:varTotal>5?'#dc2626':varTotal>0?'#d97706':'#16a34a' },
          ].map(({label,valor,color})=>(
            <div key={label} style={{ border:'1px solid #F0F0F0', borderRadius:12, padding:'18px 20px' }}>
              <div style={{ fontSize:11, fontWeight:500, letterSpacing:'0.05em', textTransform:'uppercase', color:'#999', marginBottom:8 }}>{label}</div>
              <div style={{ fontSize:28, fontWeight:700, color, fontVariantNumeric:'tabular-nums' }}>{valor}</div>
            </div>
          ))}
        </div>

        {/* Ranking MoM */}
        {(ranking.maioresAltas.length>0||ranking.maioresBaixas.length>0) && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {[{titulo:'Maiores Altas — mês a mês', dados:ranking.maioresAltas, up:true},{titulo:'Maiores Quedas — mês a mês', dados:ranking.maioresBaixas, up:false}].map(({titulo,dados,up})=>(
              <div key={titulo} style={{ border:'1px solid #F0F0F0', borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'14px 18px', borderBottom:'1px solid #F7F7F7', fontSize:11, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', color:'#999' }}>{titulo}</div>
                {dados.length===0
                  ? <div style={{ padding:'16px 18px', fontSize:13, color:'#CCC' }}>Nenhum dado</div>
                  : dados.map((r,i)=>(
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 18px', borderBottom:'1px solid #F7F7F7' }}>
                      <span style={{ fontSize:13 }}>{r.categoria}</span>
                      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                        <span style={{ fontSize:12, fontVariantNumeric:'tabular-nums', fontWeight:600, color: up?'#dc2626':'#16a34a' }}>{up?'+':''}{fmt(r.variacaoR)}</span>
                        <VarBadge pct={r.variacaoPct}/>
                      </div>
                    </div>
                  ))
                }
              </div>
            ))}
          </div>
        )}

        {/* Gráfico histórico por categoria */}
        {dadosGrafico.length>0 && (
          <div style={{ border:'1px solid #F0F0F0', borderRadius:12, padding:'20px 24px 16px' }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>Evolução Histórica por Categoria</div>
            <div style={{ fontSize:12, color:'#999', marginBottom:18 }}>Custo realizado mês a mês</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dadosGrafico} margin={{ top:4, right:4, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false}/>
                <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#BBB' }} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>`${(v/1000).toFixed(0)}k`} tick={{ fontSize:11, fill:'#BBB' }} axisLine={false} tickLine={false} width={44}/>
                <Tooltip formatter={v=>fmt(v)} contentStyle={{ fontSize:12, border:'1px solid #F0F0F0', borderRadius:10 }}/>
                <Legend iconSize={8} wrapperStyle={{ fontSize:11 }}/>
                {categorias.map((cat,i)=>(
                  <Line key={cat} type="monotone" dataKey={cat} stroke={CORES[i%CORES.length]} strokeWidth={2} dot={false} activeDot={{ r:4 }}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tabela histórica MoM */}
        {tabelaHistorica.length>0 && (
          <div style={{ border:'1px solid #F0F0F0', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid #F7F7F7' }}>
              <div style={{ fontSize:13, fontWeight:600 }}>Histórico por Categoria</div>
              <div style={{ fontSize:12, color:'#999', marginTop:2 }}>Valores realizados — variação em destaque</div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr>
                  <TH ch="Categoria"/>
                  {meses.map(m=><TH key={m} ch={m}/>)}
                  <TH ch="Var. R$ (MoM)" right/>
                  <TH ch="Var. %" right/>
                </tr></thead>
                <tbody>
                  {tabelaHistorica.map((row,i)=>(
                    <tr key={i}>
                      <TD ch={row.categoria}/>
                      {meses.map((m,mi)=>{
                        const val=row[m]||0, prev=mi>0?(row[meses[mi-1]]||0):null
                        const changed=prev!==null&&val!==prev
                        return <td key={m} style={{ padding:'10px 14px', borderBottom:'1px solid #F7F7F7', fontSize:12, fontVariantNumeric:'tabular-nums', color: changed?(val>prev?'#dc2626':'#16a34a'):'#1a1a1a', fontWeight: changed?600:400 }}>{val>0?fmt(val):'—'}</td>
                      })}
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #F7F7F7', fontSize:12, fontVariantNumeric:'tabular-nums', fontWeight:600, color: row.variacaoR>0?'#dc2626':'#16a34a', textAlign:'right' }}>{row.variacaoR>=0?'+':''}{fmt(row.variacaoR)}</td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #F7F7F7', textAlign:'right' }}><VarBadge pct={row.variacaoPct}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Por loja (quando Todas) */}
        {lojaFiltro==='Todas' && (
          <div style={{ border:'1px solid #F0F0F0', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid #F7F7F7' }}>
              <div style={{ fontSize:13, fontWeight:600 }}>Custo por Loja — mês atual</div>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr><TH ch="Loja"/><TH ch="Orçado" right/><TH ch="Realizado" right/><TH ch="Variação" right/><TH ch="% do Total" right/></tr></thead>
              <tbody>
                {porLoja.map((l,i)=>(
                  <tr key={i}>
                    <TD ch={l.loja}/>
                    <TD ch={fmt(l.orcado)} mono muted right/>
                    <TD ch={fmt(l.realizado)} mono right/>
                    <td style={{ padding:'10px 14px', borderBottom:'1px solid #F7F7F7', textAlign:'right' }}><VarBadge pct={l.variacao}/></td>
                    <TD ch={totalRealizado>0?((l.realizado/totalRealizado)*100).toFixed(1)+'%':'-'} mono muted right/>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Gráfico orçado vs realizado */}
        <div style={{ border:'1px solid #F0F0F0', borderRadius:12, padding:'20px 24px 16px' }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:18 }}>Orçado vs Realizado — mês atual</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={porCategoria} margin={{ top:4, right:4, left:0, bottom:0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false}/>
              <XAxis dataKey="categoria" tick={{ fontSize:11, fill:'#BBB' }} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>`${(v/1000).toFixed(0)}k`} tick={{ fontSize:11, fill:'#BBB' }} axisLine={false} tickLine={false} width={44}/>
              <Tooltip formatter={(v,n)=>[fmt(v),n==='orcado'?'Orçado':'Realizado']} contentStyle={{ fontSize:12, border:'1px solid #F0F0F0', borderRadius:10 }}/>
              <Bar dataKey="orcado" name="orcado" fill="#F0F0F0" radius={[4,4,0,0]}/>
              <Bar dataKey="realizado" name="realizado" radius={[4,4,0,0]}>
                {porCategoria.map(e=><Cell key={e.categoria} fill={e.variacao>10?'#dc2626':e.variacao>0?'#f59e0b':'#22c55e'}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela de itens — Geral / Por Loja */}
        <div style={{ border:'1px solid #F0F0F0', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid #F7F7F7', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>Itens de Custo</div>
              <div style={{ fontSize:12, color:'#999', marginTop:2 }}>
                {lojaMode==='geral' ? 'Totais por categoria (todas as lojas consolidadas)' : 'Detalhado por subcategoria e loja'}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ display:'flex', gap:6 }}>
                <TabBtn label="Geral"    ativo={lojaMode==='geral'}   onClick={()=>setLojaMode('geral')}/>
                <TabBtn label="Por Loja" ativo={lojaMode==='porloja'} onClick={()=>setLojaMode('porloja')}/>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <TabBtn label="Todos"      ativo={topMode==='todos'} onClick={()=>setTopMode('todos')}/>
                <TabBtn label="20 Maiores" ativo={topMode==='top20'} onClick={()=>setTopMode('top20')}/>
                <TabBtn label="20 Menores" ativo={topMode==='bot20'} onClick={()=>setTopMode('bot20')}/>
              </div>
            </div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>
                <TH ch="Categoria"/>
                {lojaMode==='porloja' && <TH ch="Subcategoria"/>}
                {(lojaMode==='porloja'||lojaFiltro==='Todas') && <TH ch="Loja"/>}
                <TH ch="Orçado" right/>
                <TH ch="Realizado" right/>
                <TH ch="Variação" right/>
                <TH ch="Dif. R$" right/>
              </tr></thead>
              <tbody>
                {dadosExibidos.map((c,i)=>{
                  const dif=c.realizado-c.orcado
                  return (
                    <tr key={i}>
                      <TD ch={c.categoria}/>
                      {lojaMode==='porloja' && <TD ch={c.subcategoria} muted/>}
                      {(lojaMode==='porloja'||lojaFiltro==='Todas') && <TD ch={lojaMode==='geral'?c.loja:c.loja} muted/>}
                      <TD ch={fmt(c.orcado)} mono muted right/>
                      <TD ch={fmt(c.realizado)} mono right/>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #F7F7F7', textAlign:'right' }}><VarBadge pct={c.variacao}/></td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #F7F7F7', fontSize:13, fontVariantNumeric:'tabular-nums', fontWeight:600, color:dif>0?'#dc2626':'#16a34a', textAlign:'right' }}>{dif>=0?'+':''}{fmt(dif)}</td>
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
