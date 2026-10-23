# Roadmap

## v1: em produção ✅
- [x] 7 agentes em produção com cadência própria
- [x] Painel em pixel art em tempo real
- [x] Aprovação humana de preço em 1 toque
- [x] Recados assíncronos humano → agente e Gerente → agente
- [x] Auto-recuperação semanal (Reserva)
- [x] Modo demonstração para rodar fora da plataforma

## v2: dados e observabilidade
- [ ] Migrar o estado para **Supabase (Postgres)**: consultas SQL ("ROI médio por categoria nos últimos 3 meses") e acesso fora do Claude
- [ ] Métricas por agente: custo em tokens, duração e taxa de sucesso por rodada
- [ ] Gráfico de lucro semanal no painel a partir do histórico do Financeiro
- [ ] Testes de regressão dos prompts: um conjunto de ofertas com veredito conhecido rodando contra o Avaliador a cada mudança

## v3: orquestração própria
- [ ] Reescrever os agentes com o **Claude Agent SDK** (Python), com o cron em GitHub Actions ou num servidor pequeno
- [ ] Definição declarativa dos agentes ([`agentes.config.json`](../agentes.config.json)) como fonte única da verdade para o agendamento
- [ ] Interface multi-usuário: outros revendedores plugam a própria conta
