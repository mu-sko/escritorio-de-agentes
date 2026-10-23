# Reserva de segunda

> Agente de confiabilidade. Os créditos de uso do plano resetam toda segunda às 22h. Se acabaram no domingo ou na segunda cedo, as tarefas desses dias não rodaram. A Reserva confere o que faltou e **re-dispara só o que faltou**.

| | |
|---|---|
| **Gatilho** | Toda segunda 22h37, logo depois do reset de créditos |
| **Ferramentas** | Banco do painel (leitura), `list_triggers` e `fire_trigger` |
| **Autonomia** | Só `fire_trigger` nas tarefas que faltaram. Nunca cria, edita ou apaga tarefa. |

## Como sabe o que faltou

Cada agente grava um registro com **`doc_id` determinístico** por data. Basta um `get` por documento: se não existe, não rodou.

| Tarefa | Prova de execução |
|---|---|
| Time Musko (domingo) | `pautas/<DOMINGO AAAA-MM-DD>` |
| Relatório Financeiro (segunda) | `eventos/financeiro-<HOJE AAAAMMDD>` |
| Conciliador (segunda) | `eventos/conciliador-<HOJE AAAAMMDD>` |
| Gerente Geral (segunda) | `relatorios/<HOJE AAAA-MM-DD>` |

## Ordem de re-disparo

Time Musko → Financeiro → Conciliador → Gerente (por último, só se faltou, porque ele lê o que os outros gravarem).

## Por que importa

É o equivalente a um *dead letter queue* com *retry* em sistemas de filas. Sem ele, um fim de semana sem créditos apagava a semana inteira do Gerente, já que ele depende dos outros três. Se tudo rodou, a Reserva termina **em silêncio**: sem notificação, e com custo quase zero.
