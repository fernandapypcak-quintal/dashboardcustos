import { APPS_SCRIPT_URL } from './config.js'
import { MOCK_CONTAS, MOCK_CUSTOS_FIXOS, MOCK_HISTORICO } from './mockData.js'
import { MOCK_CUSTOS_VARIAVEIS, MOCK_HISTORICO_VARIAVEL } from './mockDataVariavel.js'

// Troque USE_MOCK para false quando o Apps Script estiver pronto
const USE_MOCK = true

// ── Fetch genérico ──────────────────────────────────────────
async function fetchTipo(tipo) {
  const url = `${APPS_SCRIPT_URL}?tipo=${tipo}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Erro ao buscar ${tipo}: ${res.status}`)
  return res.json()
}

// ── Parsers ─────────────────────────────────────────────────
function parseContas(rows) {
  return rows.map((r, i) => ({
    id: i + 1,
    nome: r['Nome'] || r['nome'] || '',
    fornecedor: r['Fornecedor'] || r['fornecedor'] || '',
    valor: Number(r['Valor'] || r['valor'] || 0),
    vencimento: r['Vencimento'] || r['vencimento'] || '',
    status: (r['Status'] || r['status'] || 'pendente').toLowerCase(),
    categoria: r['Categoria'] || r['categoria'] || 'Outros',
    centro: r['Centro de Custo'] || r['centro'] || '',
    observacao: r['Observação'] || r['observacao'] || '',
  }))
}

function parseCustosFixos(rows) {
  return rows.map((r, i) => ({
    id: i + 1,
    categoria: r['Categoria'] || r['categoria'] || '',
    subcategoria: r['Subcategoria'] || r['subcategoria'] || '',
    orcado: Number(r['Orçado'] || r['orcado'] || 0),
    realizado: Number(r['Realizado'] || r['realizado'] || 0),
    mes: r['Mês'] || r['mes'] || '',
    loja: r['Loja'] || r['loja'] || '',
  }))
}

function parseCustosVariaveis(rows) {
  return rows.map((r, i) => ({
    id: i + 1,
    categoria: r['Categoria'] || r['categoria'] || '',
    subcategoria: r['Subcategoria'] || r['subcategoria'] || '',
    orcado: Number(r['Orçado'] || r['orcado'] || 0),
    realizado: Number(r['Realizado'] || r['realizado'] || 0),
    mes: r['Mês'] || r['mes'] || '',
    loja: r['Loja'] || r['loja'] || '',
  }))
}

function parseHistorico(rows) {
  return rows.map((r) => ({
    mes: r['Mês'] || r['mes'] || '',
    loja: r['Loja'] || r['loja'] || '',
    total_realizado: Number(r['Total Realizado'] || r['total_realizado'] || 0),
    total_orcado: Number(r['Total Orçado'] || r['total_orcado'] || 0),
  }))
}

// ── Exportações públicas ────────────────────────────────────
export async function loadContas() {
  if (USE_MOCK) return MOCK_CONTAS
  const data = await fetchTipo('contas')
  return parseContas(data)
}

export async function loadCustosFixos() {
  if (USE_MOCK) return MOCK_CUSTOS_FIXOS
  const data = await fetchTipo('custos_fixos')
  return parseCustosFixos(data)
}

export async function loadCustosVariaveis() {
  if (USE_MOCK) return MOCK_CUSTOS_VARIAVEIS
  const data = await fetchTipo('custos_variaveis')
  return parseCustosVariaveis(data)
}

export async function loadHistorico() {
  if (USE_MOCK) return MOCK_HISTORICO
  const data = await fetchTipo('historico')
  return parseHistorico(data)
}

export async function loadHistoricoVariavel() {
  if (USE_MOCK) return MOCK_HISTORICO_VARIAVEL
  const data = await fetchTipo('historico_variavel')
  return parseHistorico(data)
}
