# Registro de decisões

Formato curto de ADR: contexto, decisão e consequência. As decisões estão em ordem cronológica.

---

### ADR-001: Tarefa agendada + skill + banco, em vez de framework de agentes

**Contexto**: o objetivo era ter agentes operando dois negócios reais logo, com uma pessoa só e tempo limitado.
**Decisão**: usar o que a plataforma já oferece: tarefas agendadas com cron, skills para lógica reutilizável, conectores MCP e um Artifact com banco para estado e interface.
**Consequência**: nenhum servidor para manter e primeiro agente em produção no mesmo dia. Em troca, o sistema fica preso à plataforma. A migração para um orquestrador próprio está no [roadmap](roadmap.md).

### ADR-002: Separar o "Caçador" em Buscador + Avaliador

**Contexto**: um agente que buscava e avaliava ao mesmo tempo misturava duas responsabilidades e ficava caro.
**Decisão**: Buscador só garimpa candidatos; Avaliador só audita um produto.
**Consequência**: o Avaliador virou uma skill reutilizável, que funciona com o link que o humano manda no chat.

### ADR-003: Dado de bot é só triagem

**Contexto**: os cards dos bots dos grupos de promoção traziam lucro, margem e vendas/dia errados com frequência.
**Decisão**: o número do bot nunca sustenta um APROVADO. Tudo é recalculado com dado do ML e do Hunter.
**Consequência**: surgiu o veredito `PENDENTE` e a regra "pode reprovar com dado não verificado, nunca aprovar".

### ADR-004: Human-in-the-loop no preço, com aplicação direto do painel

**Contexto**: mudar preço errado custa dinheiro na hora. Esperar a próxima rodada do agente para aplicar uma aprovação era lento.
**Decisão**: o Vigia só propõe. O botão "Sim" do painel chama o conector do Hunter direto da página (dry-run, depois confirm). Se o conector não estiver disponível, a proposta fica `aprovado` e o Vigia aplica na próxima rodada.
**Consequência**: aprovação em 1 toque e efeito em segundos. Exigiu a máquina de estados com `verificar` para resultado incerto.

### ADR-005: Painel como escritório em pixel art

**Contexto**: um log de texto não mostra de relance "quem está trabalhando, quem precisa de mim".
**Decisão**: cada agente é um personagem com mesa. Sentado = trabalhando; andando com zZ = ocioso; mão levantada = precisa de você.
**Consequência**: o estado do time é lido em 2 segundos, até no celular. O tamanho do painel foi mantido em cerca de 60 KB, sem dependências.

### ADR-006: Recados assíncronos (coleção `ordens`)

**Contexto**: o humano queria ajustar um agente sem editar o prompt dele.
**Decisão**: caixa de entrada por agente. O humano escreve pelo painel e o agente lê na próxima execução, responde e marca como feito.
**Consequência**: o mesmo canal passou a servir ao Gerente Geral para dar o "foco da semana", e a regra de conflito ficou simples: humano vence.

### ADR-007: Gerente Geral como supervisor assíncrono

**Contexto**: dois negócios, sete agentes e um humano sem tempo para ler sete relatórios.
**Decisão**: um agente que roda depois dos outros, lê tudo, entrega 3 ações e dá foco a cada agente pelo canal de recados.
**Consequência**: o humano lê **um** relatório por semana.

### ADR-008: Reserva de segunda

**Contexto**: o limite semanal de uso acabava no fim de semana e as tarefas de domingo e segunda simplesmente não rodavam.
**Decisão**: um agente às 22h37 de segunda (logo após o reset) confere por `doc_id` o que faltou e re-dispara só isso.
**Consequência**: a cadeia semanal passou a se recuperar sozinha. Isso exigiu que **todo** agente gravasse um registro com ID previsível.

### ADR-009: Um perfil de navegador por negócio

**Contexto**: os dois negócios usam contas diferentes, e um agente chegou a abrir a conta errada.
**Decisão**: cada prompt fixa o perfil de navegador do seu negócio, com fallback por verificação da conta logada. É proibido perguntar ou trocar.
**Consequência**: isolamento entre negócios garantido no prompt.

### ADR-010: Enxugar o time

**Contexto**: o Buscador rodava 4 vezes por dia e o Garimpeiro diariamente, consumindo boa parte do limite semanal com pouco resultado aproveitado.
**Decisão**: aposentar Buscador e Garimpeiro. O Vigia caiu de 3 rodadas por dia para 1. A busca de ofertas voltou a ser humana, com o Avaliador sob demanda.
**Consequência**: o custo caiu de forma significativa e os agentes que sobraram são os que geram decisão. **Lição: agente que ninguém lê é custo, não automação.**

---

## Linha do tempo

| Quando | Marco |
|---|---|
| Dia 1, 01h | Estrutura definida: Project + Skill + tarefa agendada |
| Dia 1, 01h45 | Caçador dividido em Buscador + Avaliador |
| Dia 1, 10h57 | Primeiro produto aprovado de verdade (ROI 64,6%) |
| Dia 1, 14h | Relatório Financeiro e Buscador em produção |
| Dia 1, 16h40 | Painel ao vivo |
| Dia 1, 16h50 | Sala em pixel art |
| Dia 1, 19h50 | Vigia de Preço com propostas Sim/Não no painel |
| Dia 1, 20h05 | O Sim aplica o preço na hora, direto do painel |
| Dia 2 | Time Musko (3 agentes em cadeia), recados, mão levantada, Gerente Geral e Conciliador |
| Dia 2, noite | Um perfil de navegador por negócio; Reserva de segunda |
| Dia 7 | Time enxugado (ADR-010) |
