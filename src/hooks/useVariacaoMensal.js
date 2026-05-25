import { useMemo } from 'react'

// Ordem cronológica dos meses para ordenação
const ORDEM_MES = ['Out/24','Nov/24','Dez/24','Jan/25','Fev/25','Mar/25','Abr/25','Mai/25','Jun/25']

/**
 * Recebe historicoCat (array de { mes, loja, categoria, realizado })
 * já filtrado por loja e devolve:
 *   - meses: lista ordenada de meses presentes
 *   - categorias: lista de categorias
 *   - dadosGrafico: [{ mes, Cat1: val, Cat2: val, ... }]
 *   - tabelaHistorica: [{ categoria, ...meses, variacaoUltimo, variacaoUltimoR$ }]
 *   - ranking: { maioresAltas, maioresBaixas } — top 5 variação % último mês
 */
export function useVariacaoMensal(historicoCat) {
  return useMemo(() => {
    if (!historicoCat || historicoCat.length === 0) {
      return { meses: [], categorias: [], dadosGrafico: [], tabelaHistorica: [], ranking: { maioresAltas: [], maioresBaixas: [] } }
    }

    // Meses ordenados
    const mesSet = new Set(historicoCat.map((h) => h.mes))
    const meses = Array.from(mesSet).sort((a, b) => ORDEM_MES.indexOf(a) - ORDEM_MES.indexOf(b))

    // Categorias
    const categorias = Array.from(new Set(historicoCat.map((h) => h.categoria))).sort()

    // Pivot para gráfico de linha: [{ mes, Cat1, Cat2, ... }]
    const dadosGrafico = meses.map((mes) => {
      const row = { mes }
      categorias.forEach((cat) => {
        const entries = historicoCat.filter((h) => h.mes === mes && h.categoria === cat)
        row[cat] = entries.reduce((s, h) => s + h.realizado, 0)
      })
      return row
    })

    // Tabela histórica por categoria com variação MoM
    const tabelaHistorica = categorias.map((cat) => {
      const row = { categoria: cat }
      let prevVal = null
      meses.forEach((mes) => {
        const entries = historicoCat.filter((h) => h.mes === mes && h.categoria === cat)
        const val = entries.reduce((s, h) => s + h.realizado, 0)
        row[mes] = val
        prevVal = val
      })

      // Variação do último mês vs penúltimo
      const ultMes = meses[meses.length - 1]
      const penultMes = meses[meses.length - 2]
      const ultVal = row[ultMes] || 0
      const penultVal = penultMes ? (row[penultMes] || 0) : 0
      row.variacaoPct = penultVal > 0 ? ((ultVal - penultVal) / penultVal) * 100 : 0
      row.variacaoR = ultVal - penultVal
      row.ultimoMes = ultMes
      row.penultimoMes = penultMes
      return row
    })

    // Ranking — top 5 maiores altas e baixas (último mês vs anterior)
    const sorted = [...tabelaHistorica].sort((a, b) => b.variacaoPct - a.variacaoPct)
    const maioresAltas  = sorted.filter((r) => r.variacaoPct > 0).slice(0, 5)
    const maioresBaixas = sorted.filter((r) => r.variacaoPct < 0).slice(-5).reverse()

    return { meses, categorias, dadosGrafico, tabelaHistorica, ranking: { maioresAltas, maioresBaixas } }
  }, [historicoCat])
}
