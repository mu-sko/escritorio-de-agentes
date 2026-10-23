# Conciliador de Vendas

> Puxa as vendas novas do Mercado Livre e lança na planilha de controle, alocando por FIFO. Escreve **só** nas colunas permitidas.

| | |
|---|---|
| **Negócio** | Seletto Company |
| **Gatilho** | Toda segunda 7h50 |
| **Implementação** | Tarefa agendada + skill `seletto-conciliar-vendas-ml` |
| **Ferramentas** | Hunter HUB MCP (`search_orders`, `get_order_detail`), Google Sheets (`get_values`, `update_values`) |
| **Autonomia** | Escreve, mas com escopo de colunas travado |

## Algoritmo

1. `search_orders` (100 mais recentes). Ignora `cancelled` e vendas manuais (`external`).
2. Lê a aba de lançamentos da planilha.
3. Para cada SKU vendido, acha a linha de compra pelo nome do produto. Venda nova = pedido posterior à última data de venda da linha, ou unidades que faltam no acumulado.
4. **FIFO**: com dois lotes do mesmo produto, aloca no lote mais antigo que ainda tem estoque.
5. `get_order_detail` em cada venda nova para pegar taxa, frete e data de liberação do dinheiro.
6. Grava acumulado (nunca só o pedido novo) com **um `update_values` por linha**.
7. **Confere**: relê as linhas e compara o líquido calculado pela planilha com o payout do Hunter (tolerância de R$ 1).

## Mapeamento de colunas

| Coluna | Campo | Regra |
|---|---|---|
| R | Qtd vendida | acumulado |
| S | Plataforma | `gold_special` → Clássico, `gold_pro` → Premium |
| T | Preço unitário | `Σ totalAmount ÷ R` |
| U | Preço bruto | **fórmula: envia `null`** |
| V | Taxa | `Σ marketplaceFee` |
| W | Frete por unidade | `(Σ shippingCost − Σ shippingBonus) ÷ R` (pode ser negativo) |
| X | Líquido | **fórmula: envia `null`** |
| Y | Data da venda | serial do Sheets (dias desde 30/12/1899) |
| Z | Liberação do dinheiro | `moneyReleaseDate` |
| AA em diante | Status, lucro, ROI, giro | **nunca escreve** |

## Guardrails

- Nunca cria linha. Venda sem compra lançada vira só um aviso.
- Nunca escreve em coluna de fórmula: passar `null` pula a célula sem apagar a fórmula.
- Na nuvem não há Chrome para clicar em "sincronizar" no Hunter. Por isso confere a data do pedido mais recente e avisa se os dados parecerem defasados.

## Saída

Registro obrigatório em `eventos/conciliador-<AAAAMMDD>` com `lancadas`, `sem_compra[]` e `alertas[]`, mais uma notificação só quando há algo acionável: margem negativa, reembolso, recompra ou venda sem compra.
