# Quintal do Espeto — Dashboard Financeiro

Dashboard web de **Custo Fixo** e **Contas a Pagar** com visão por loja, totais, top/bottom itens, oscilação e novos custos.

## Stack

- React + Vite + Tailwind CSS
- Recharts para gráficos
- Google Apps Script como backend (Web App)
- Deploy via Vercel + GitHub

---

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

---

## Conectando ao Google Apps Script

### 1. Crie o Web App

No seu Google Apps Script, publique um `doGet` com `?tipo=xxx`:

```javascript
function doGet(e) {
  const tipo = e.parameter.tipo;
  const ss = SpreadsheetApp.openById('SEU_ID_DA_PLANILHA');

  if (tipo === 'contas') {
    const sheet = ss.getSheetByName('ContasPagar');
    return jsonResponse(sheetToJson(sheet));
  }
  if (tipo === 'custos_fixos') {
    const sheet = ss.getSheetByName('CustoFixo');
    return jsonResponse(sheetToJson(sheet));
  }
  if (tipo === 'historico') {
    const sheet = ss.getSheetByName('Historico');
    return jsonResponse(sheetToJson(sheet));
  }
  return jsonResponse({ erro: 'tipo inválido' });
}

function sheetToJson(sheet) {
  const [headers, ...rows] = sheet.getDataRange().getValues();
  return rows.map(row =>
    Object.fromEntries(headers.map((h, i) => [h, row[i]]))
  );
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Publique como Web App: **Executar como: Eu** | **Acesso: Qualquer pessoa**

### 2. Configure a URL

Em `src/data/loader.js`, mude `USE_MOCK` para `false` e cole a URL em `src/data/config.js`:

```js
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/SEU_ID/exec'
```

### 3. Estrutura esperada das abas

#### Aba `ContasPagar`
| Nome | Fornecedor | Valor | Vencimento | Status | Categoria | Loja | Observação |
|------|-----------|-------|------------|--------|-----------|------|-----------|

- **Status**: `pago` / `pendente` / `vencido`
- **Vencimento**: formato `YYYY-MM-DD`

#### Aba `CustoFixo`
| Categoria | Subcategoria | Orçado | Realizado | Mês | Loja |
|-----------|-------------|--------|-----------|-----|------|

- **Mês**: formato `YYYY-MM` (ex: `2025-03`)

#### Aba `Historico`
| Mês | Loja | Total Realizado | Total Orçado |
|-----|------|----------------|-------------|

- **Mês**: formato textual `Abr/25`

---

## Deploy na Vercel

```bash
# Instale a CLI da Vercel (se não tiver)
npm i -g vercel

# Na pasta do projeto
vercel
```

Ou conecte o repositório GitHub direto no painel da Vercel — build automático em cada push.

---

## Estrutura de arquivos

```
src/
  App.jsx                        # Roteamento principal
  main.jsx                       # Entry point
  index.css                      # Estilos globais + painel lateral
  utils.js                       # fmt, fmtPct, fmtData, diasAteVencimento

  data/
    config.js                    # APPS_SCRIPT_URL e constantes
    loader.js                    # fetchTipo + parsers (USE_MOCK aqui)
    mockData.js                  # Dados de exemplo (3 lojas)

  hooks/
    useFinanceiro.jsx             # Contexto global: dados + filtros + KPIs

  components/
    layout/
      Sidebar.jsx                 # Sidebar branca com nav e badges "em breve"
      Header.jsx                  # Header fixo com filtro por loja

    ui/
      KpiCard.jsx                 # Card de KPI
      StatusBadge.jsx             # Badge colorida de status
      PainelDetalhe.jsx           # Painel lateral deslizante

    pages/
      Home.jsx                    # Visão geral: KPIs + evolução + contas críticas
      ContasPagar.jsx             # Tabela completa com busca, filtros, top 20
      CustoFixo.jsx               # Por categoria, por loja, top/bottom 20
      Evolucao.jsx                # Histórico, oscilação, novos custos
```

---

## Paleta de cores

| Cor        | Hex       | Uso                              |
|------------|-----------|----------------------------------|
| Verde      | `#97A624` | Dentro do orçamento, pago, OK    |
| Vermelho   | `#8C1414` | Vencido, crítico, acima do limite|
| Âmbar      | `#D9B504` | Atenção, próximo do vencimento   |
| Preto      | `#0D0D0D` | Headers, item ativo na sidebar   |
| Off-white  | `#FAFAF8` | Background geral                 |
| Borda      | `#E8E8E2` | Linhas e bordas de cards         |
