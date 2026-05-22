// =============================================================
//  QUINTAL DO ESPETO — Configuração de dados
//  Troque APPS_SCRIPT_URL pela URL publicada do seu Web App
// =============================================================

export const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/SEU_ID_AQUI/exec'

export const LOJAS = ['Todas', 'Loja Centro', 'Loja Sul', 'Loja Norte']

export const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

export const CATEGORIAS_CUSTO = [
  'Aluguel', 'Energia', 'Água', 'Folha', 'Pró-labore',
  'Contador', 'Software', 'Marketing', 'Manutenção', 'Outros',
]

export const STATUS_CONTA = {
  pago: { label: 'Pago', cor: '#97A624' },
  pendente: { label: 'Pendente', cor: '#D9B504' },
  vencido: { label: 'Vencido', cor: '#8C1414' },
}
