# Modelo de dados

Banco de documentos com seis coleções. Leitura liberada a quem vê o painel; escrita só do dono (os agentes rodam com a identidade dele). Schemas formais em [`/schemas`](../schemas).

```mermaid
erDiagram
  ESTADO ||--o{ EVENTOS : "agente"
  ESTADO ||--o{ ORDENS : "agente"
  PROPOSTAS }o--|| ESTADO : "vigia"
  PAUTAS ||--|| EVENTOS : "pauta-AAAAMMDD"
  RELATORIOS ||--|| EVENTOS : "gerente-AAAAMMDD"

  ESTADO {
    string id PK "id do agente"
    string status "trabalhando | ocioso"
    string tarefa
    string precisa "opcional: mão levantada"
    datetime ts
  }
  EVENTOS {
    string id PK "agente-AAAAMMDD[HHMM]"
    string agente
    datetime ts
    string veredito "info|preco|aprovado|reprovado|semana|pauta|..."
    string titulo
    string resumo
    string link "opcional"
  }
  PROPOSTAS {
    string id PK "listingId-AAAAMMDDHHMM"
    string status "pendente|aplicando|aplicado|aprovado|verificar|falhou|recusado"
    string tipo "baixar | subir"
    number preco_atual
    number preco_novo
    number roi_novo
    datetime expira_em
  }
  ORDENS {
    string id PK "agente-AAAAMMDDHHMMSS"
    string agente
    string texto
    string de "painel | gerente"
    string status "pendente | feito"
    string resposta
  }
  PAUTAS {
    string id PK "AAAA-MM-DD do domingo"
    object metricas
    array itens "2 Reels + 1 carrossel"
    array stories
  }
  RELATORIOS {
    string id PK "AAAA-MM-DD da segunda"
    array acoes "exatamente 3"
    array travado
    array alertas
    object seletto
    object musko
  }
```

## Coleções

| Coleção | Quem escreve | Quem lê | Papel |
|---|---|---|---|
| `estado` | cada agente (a própria mesa) | painel, Gerente | O que cada agente está fazendo agora |
| `eventos` | todos os agentes; painel (preço aplicado) | painel, Gerente, Reserva | Feed e trilha de auditoria |
| `propostas` | Vigia (cria); painel (decide); Vigia (aplica) | painel, Vigia, Gerente | Fila de aprovação humana |
| `ordens` | humano pelo painel; Gerente | agente destinatário | Recados assíncronos (caixa de entrada por agente) |
| `pautas` | Time Musko | painel, Gerente, Reserva | Conteúdo da semana |
| `relatorios` | Gerente | painel, Reserva | Visão semanal consolidada |

## Convenções

- **Datas**: sempre ISO 8601 em UTC no campo `ts`. Datas "de negócio" no `doc_id` usam o fuso de São Paulo, porque a semana do humano é a semana local.
- **IDs determinísticos** para tudo que é periódico: garantem idempotência e permitem checar se algo rodou com um `get`.
- **Escrita condicional**: agentes fazem `get` e depois `set` com `if_version` no próprio estado, para não sobrescrever uma mudança concorrente.
- **Nada sensível no banco**: custos e IDs de anúncio, sim; credenciais, nunca.
