# Relatório Financeiro

> Fecha a semana da revenda: lucro, margem, ROI, capital parado e as 3 ações da semana. **Só lê.**

| | |
|---|---|
| **Negócio** | Seletto Company |
| **Gatilho** | Toda segunda 6h56 (fecha a semana anterior, de segunda a domingo) |
| **Ferramentas** | Hunter HUB MCP (`get_financial_summary`, `get_dre`, `search_orders`, `get_margin_alerts`, `get_abc_analysis`, `get_listing_activity`, `get_catalogs_status`, `get_fulfillment_costs`), Google Sheets (custo e estoque), Gmail (envio) |
| **Autonomia** | Total, porque nunca escreve em anúncio nem planilha |

## O que entrega

1. **Semana**: faturamento, lucro líquido, margem, ROI e número de vendas, com variação contra a semana anterior.
2. **Anúncios com ROI abaixo de 25%**: produto, ROI e motivo provável.
3. **Encalhados**: sem venda há 30+ dias e o capital parado em cada um (`estoque_restante × custo_unitario`).
4. **Catálogos perdidos**: produto, vencedor do catálogo e diferença de preço.
5. **3 ações da semana**, em ordem de impacto em R$.

Sem dado de alguma parte: diz que não tem. Nunca inventa número.

## Por que roda às 6h56 de segunda

Ele é o primeiro elo de uma cadeia. O Gerente Geral (8h12) lê o registro dele, e a Reserva (22h37) confere se ele existe. O horário fora do minuto 00 evita a fila de tarefas que todo mundo agenda na hora cheia.

## Saída

- Registro obrigatório em `eventos/financeiro-<AAAAMMDD>` com os números estruturados (`lucro`, `faturamento`, `margem`, `roi`, `vendas`, `capital_parado`, `acoes[]`).
- E-mail com o fechamento em texto simples.
- Notificação curta:

```text
RELATÓRIO FINANCEIRO
Semana 13/10 a 19/10: lucro R$ 1.284 (+12%)
Faturou R$ 6.910 | margem 18,6% | ROI 29% | 23 vendas
Capital parado: R$ 640
1. Recomprar a garrafa térmica
2. Baixar o preço do encalhado A
3. Não recomprar o produto B (ROI 9%)
```

*(Números fictícios.)*
