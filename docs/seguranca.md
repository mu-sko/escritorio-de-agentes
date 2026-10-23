# Segurança e guardrails

Agentes com acesso a conta de marketplace, planilha financeira e e-mail precisam de limites explícitos. Esta é a matriz de riscos do sistema.

| # | Risco | Impacto | Mitigação |
|---|---|---|---|
| 1 | Agente altera preço errado | Prejuízo direto | Só propõe. Aplicar exige o Sim humano. Proposta expira em 12h. Piso de ROI no prompt. |
| 2 | Preço aplicado duas vezes | Prejuízo direto | Estados `aplicando` e `verificar`. Confere o preço atual antes de reaplicar. Botão desabilita no clique. |
| 3 | Agente sobrescreve fórmula da planilha | Planilha corrompida | Escrita só em colunas R a Z. `null` nas colunas de fórmula. Nunca cria linha. Relê e confere depois de gravar. |
| 4 | Decisão de compra com dado ruim | Capital parado | Dado de bot é triagem. `PENDENTE` quando não verificado. Proibido estimar número. |
| 5 | Agente age na conta do negócio errado | Vazamento e confusão | Perfil de navegador fixo por negócio, com verificação da conta logada. |
| 6 | Agente posta ou comenta em nome do humano | Reputação | Escopo "só leitura" em comunidades e redes. Publicar é sempre humano. |
| 7 | Prompt injection via página web ou mensagem | Ação indevida | Conteúdo externo é tratado como dado. Ações críticas exigem o Sim. Agentes não têm ferramenta de compra. |
| 8 | Recado malicioso ou errado no painel | Ação fora da regra | Escrita no banco só pelo dono. O agente atende o recado **se couber nas regras dele**. |
| 9 | Agente morre no meio e fica "trabalhando" para sempre | Painel mente | Estado com mais de 45 min sem atualização é exibido como ocioso. O Gerente alerta agente parado. |
| 10 | Exploits de cupom e contas falsas | Banimento das contas | Fora de escopo, escrito no prompt. |
| 11 | Dados sensíveis no repositório | Vazamento | Este repositório não tem IDs de planilha, e-mails, IDs de dispositivo nem URL do painel real. Dados de demonstração são fictícios. |

## Rodando a sua versão

Se for adaptar este projeto:

- Troque os placeholders `<PLANILHA_ID>`, `<URL_DO_PAINEL>` e `<PERFIL_CHROME_*>` nos prompts. **Não versione os valores reais.**
- Comece com tudo em modo "só propõe" e libere autonomia por ação, nunca por agente.
- Dê a cada agente um `doc_id` previsível desde o primeiro dia: é o que torna o sistema observável.
