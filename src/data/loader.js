import { APPS_SCRIPT_URL } from './config.js'

// ─────────────────────────────────────────────────────────────
//  USE_MOCK = false → puxa do Apps Script (produção)
//  USE_MOCK = true  → usa dados locais de exemplo
// ─────────────────────────────────────────────────────────────
const USE_MOCK = false

// ── Fetch com CORS + timeout ──────────────────────────────────
async function fetchTipo(tipo, params = {}) {
  const qs = new URLSearchParams({ tipo, ...params }).toString()
  const url = `${APPS_SCRIPT_URL}?${qs}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000) // 20s timeout

  try {
    // Apps Script exige mode: 'no-cors' NÃO — precisa de redirect follow
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data && data.erro) throw new Error(`Apps Script: ${data.erro}`)
    return Array.isArray(data) ? data : []
  } catch (e) {
    clearTimeout(timer)
    console.error(`[loader] fetchTipo(${tipo}) falhou:`, e.message)
    return []
  }
}

// ── Parsers — espelham exatamente o que o Apps Script retorna ─
// O Apps Script já devolve objetos com os campos certos (lowercase)
// então só mapeamos para garantir os campos que o dashboard usa

function parseContas(rows) {
  return rows.map((r, i) => ({
    id:         i + 1,
    nome:       r.nome       || r.descricao  || '',
    fornecedor: r.fornecedor || '',
    valor:      Number(r.valor || 0),
    vencimento: r.vencimento || r.vencto     || '',
    status:     (r.status    || 'pago').toLowerCase(),
    categoria:  r.categoria  || '',
    centro:     r.centro     || r.unidade    || '',
    observacao: r.observacao || '',
  }))
}

function parseCustos(rows) {
  return rows.map((r, i) => ({
    id:           i + 1,
    categoria:    r.categoria    || '',
    subcategoria: r.subcategoria || r.descricao || '',
    orcado:       Number(r.orcado    || 0),
    realizado:    Number(r.realizado || 0),
    mes:          r.mes  || '',
    loja:         r.loja || r.unidade || '',
  }))
}

function parseHistorico(rows) {
  return rows.map((r) => ({
    mes:              r.mes           || r.mes_label        || '',
    loja:             r.loja          || r.unidade          || '',
    total_realizado:  Number(r.total_realizado              || 0),
    total_orcado:     Number(r.total_orcado                 || 0),
  }))
}

function parseHistoricoCat(rows) {
  return rows.map((r) => ({
    mes:       r.mes       || r.mes_label || '',
    loja:      r.loja      || r.unidade   || '',
    categoria: r.categoria || '',
    realizado: Number(r.realizado         || 0),
  }))
}

// ── Mock imports (só usados se USE_MOCK = true) ───────────────
async function getMock(tipo) {
  const { MOCK_CONTAS, MOCK_CUSTOS_FIXOS, MOCK_HISTORICO, MOCK_HISTORICO_CAT_FIXO } = await import('./mockData.js')
  const { MOCK_CUSTOS_VARIAVEIS, MOCK_HISTORICO_VARIAVEL, MOCK_HISTORICO_CAT_VARIAVEL } = await import('./mockDataVariavel.js')
  const map = {
    contas:               MOCK_CONTAS,
    custos_fixos:         MOCK_CUSTOS_FIXOS,
    custos_variaveis:     MOCK_CUSTOS_VARIAVEIS,
    historico:            MOCK_HISTORICO,
    historico_variavel:   MOCK_HISTORICO_VARIAVEL,
    historico_cat_fixo:   MOCK_HISTORICO_CAT_FIXO,
    historico_cat_variavel: MOCK_HISTORICO_CAT_VARIAVEL,
  }
  return map[tipo] || []
}

// ── Exports públicos ──────────────────────────────────────────
export async function loadContas() {
  if (USE_MOCK) return await getMock('contas')
  return parseContas(await fetchTipo('contas'))
}

export async function loadCustosFixos() {
  if (USE_MOCK) return parseCustos(await getMock('custos_fixos'))
  return parseCustos(await fetchTipo('custos_fixos'))
}

export async function loadCustosVariaveis() {
  if (USE_MOCK) return parseCustos(await getMock('custos_variaveis'))
  return parseCustos(await fetchTipo('custos_variaveis'))
}

export async function loadHistorico() {
  if (USE_MOCK) return parseHistorico(await getMock('historico'))
  return parseHistorico(await fetchTipo('historico'))
}

export async function loadHistoricoVariavel() {
  if (USE_MOCK) return parseHistorico(await getMock('historico_variavel'))
  return parseHistorico(await fetchTipo('historico_variavel'))
}

export async function loadHistoricoCatFixo() {
  if (USE_MOCK) return parseHistoricoCat(await getMock('historico_cat_fixo'))
  return parseHistoricoCat(await fetchTipo('historico_cat_fixo'))
}

export async function loadHistoricoCatVariavel() {
  if (USE_MOCK) return parseHistoricoCat(await getMock('historico_cat_variavel'))
  return parseHistoricoCat(await fetchTipo('historico_cat_variavel'))
}
