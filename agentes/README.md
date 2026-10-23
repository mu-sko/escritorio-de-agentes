# Agentes

Cada arquivo desta pasta é a **especificação de um agente**: papel, gatilho, ferramentas, passo a passo, guardrails e o contrato de saída com o painel. Em sistemas com LLM, o prompt é o código: estes arquivos são a versão sanitizada (sem IDs, e-mails nem identificadores de dispositivo) dos prompts que rodam em produção.

| Agente | Negócio | Gatilho | Autonomia | Arquivo |
|---|---|---|---|---|
| Avaliador de Produtos | Seletto | Sob demanda (link de oferta) | Total, só analisa | [avaliador-de-produtos.md](avaliador-de-produtos.md) |
| Vigia de Anúncios | Seletto | Todo dia 9h28 | Propõe; aplica só com o Sim humano | [vigia-de-anuncios.md](vigia-de-anuncios.md) |
| Relatório Financeiro | Seletto | Segunda 6h56 | Total, só lê | [relatorio-financeiro.md](relatorio-financeiro.md) |
| Conciliador de Vendas | Seletto | Segunda 7h50 | Escreve só em colunas permitidas | [conciliador-de-vendas.md](conciliador-de-vendas.md) |
| Time Musko (3 agentes em cadeia) | Musko | Domingo 17h52 | Rascunho, nunca publica | [time-musko.md](time-musko.md) |
| Gerente Geral | Os dois | Segunda 8h12 | Recomenda e dá foco aos agentes | [gerente-geral.md](gerente-geral.md) |
| Reserva de segunda | Infra | Segunda 22h37 | Re-dispara só o que falhou | [reserva-de-segunda.md](reserva-de-segunda.md) |

## Contrato comum a todos

Todo agente agendado segue o mesmo protocolo com o painel (detalhes em [`docs/modelo-de-dados.md`](../docs/modelo-de-dados.md)):

1. **Ao começar**: grava `estado/<id>` = `{status: "trabalhando", tarefa, ts}`. O personagem senta na mesa.
2. **Lê recados**: consulta `ordens` com `agente == <id>` e `status == "pendente"`. Recado do humano vence recado do Gerente.
3. **Trabalha** dentro dos guardrails dele.
4. **Registra** em `eventos` com um `doc_id` determinístico (`<agente>-<AAAAMMDD>`), o que torna a gravação idempotente e permite à Reserva saber se ele rodou.
5. **Ao terminar, sempre (mesmo com erro)**: `estado/<id>` = `{status: "ocioso", tarefa: "<resumo>"}`. Se travou em algo que só o humano resolve, inclui `precisa` e o personagem levanta a mão.
6. **Notificação final** curta, sem markdown, só quando há algo acionável.
