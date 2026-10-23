/*
 * DemoStore: banco em memória que imita a API de coleções usada pelo painel
 * (collection / orderBy / limit / onSnapshot / doc().set / doc().update).
 *
 * No claude.ai o painel usa o banco real do Artifact (window.claude.use("db")).
 * Fora dele (GitHub Pages, arquivo local) o painel cai aqui e roda com dados
 * fictícios, pra qualquer pessoa ver o escritório funcionando sem login.
 */
(function () {
  "use strict";

  const agora = Date.now();
  const iso = (msAtras) => new Date(agora - msAtras).toISOString();
  const H = 3600e3, D = 24 * H;

  /* ---------- dados fictícios (nenhum número aqui é real) ---------- */
  const SEED = {
    estado: {
      vigia: { status: "ocioso", tarefa: "Última rodada 9h28: 2 propostas, 1 aplicada", ts: iso(3 * H) },
      financeiro: { status: "ocioso", tarefa: "Semana 13/10 a 19/10: lucro R$ 1.284", ts: iso(2 * D) },
      conciliador: { status: "ocioso", tarefa: "Última conciliação 20/10: 9 vendas lançadas", ts: iso(2 * D) },
      gerente: { status: "ocioso", tarefa: "Semana 20/10: 3 ações e foco de cada agente", ts: iso(2 * D) },
      metricas: { status: "ocioso", tarefa: "Semana: 18,4 mil de alcance, +212 seguidores", ts: iso(3 * D) },
      pauteiro: { status: "ocioso", tarefa: "Pauta pronta: 2 Reels + 1 carrossel", ts: iso(3 * D) },
      roteirista: { status: "trabalhando", tarefa: "Escrevendo o roteiro de quinta", ts: iso(60e3) }
    },
    eventos: {
      "vigia-1": { agente: "vigia", ts: iso(3 * H), veredito: "info", titulo: "Rodada 9h28: 2 propostas", resumo: "14 anúncios, 11 ganhando o catálogo, 3 perdendo, 1 aplicada" },
      "vigia-2": { agente: "vigia", ts: iso(5 * H), veredito: "preco", titulo: "Fone Bluetooth X1: R$ 189,90 → R$ 179,90", resumo: "Aplicado com o seu sim. ROI 31%" },
      "aval-1": { agente: "avaliador", ts: iso(7 * H), veredito: "aprovado", titulo: "Garrafa térmica 1,2 L: ROI 38%", resumo: "Vende 4/dia, 6 vendedores, vencedor do catálogo sem Full. Comprar 10 un." },
      "aval-2": { agente: "avaliador", ts: iso(9 * H), veredito: "reprovado", titulo: "Mouse gamer Y: varejo vende perto do seu custo", resumo: "Preço mínimo de venda R$ 142, varejo grande vende a R$ 129" },
      "fin-1": { agente: "financeiro", ts: iso(2 * D), veredito: "semana", titulo: "Semana 13/10 a 19/10: lucro R$ 1.284", resumo: "Faturou R$ 6.910, margem 18,6%, ROI 29%, 23 vendas (+12% vs semana anterior)" },
      "conc-1": { agente: "conciliador", ts: iso(2 * D - 50 * 60e3), veredito: "conciliacao", titulo: "9 vendas lançadas na planilha", resumo: "7 linhas atualizadas, 0 sem compra lançada, 1 alerta de margem" },
      "ger-1": { agente: "gerente", ts: iso(2 * D - 90 * 60e3), veredito: "decisao", titulo: "Semana 20/10: 3 ações", resumo: "Recomprar a garrafa térmica antes do fim da promoção" },
      "met-1": { agente: "metricas", ts: iso(3 * D), veredito: "metricas", titulo: "Semana: 18,4 mil de alcance, +212 seguidores", resumo: "Melhor post: taxa de importação explicada em 30s | pior: unboxing sem gancho" },
      "pauta-1": { agente: "pauteiro", ts: iso(3 * D - 20 * 60e3), veredito: "pauta", titulo: "Pauta da semana: 2 Reels + 1 carrossel", resumo: "Taxa de 20% na prática · 3 erros do primeiro pedido · Agente de compra em 5 passos" }
    },
    propostas: {
      "MLB0000000001-demo": {
        ts: iso(3 * H), status: "pendente", expira_em: new Date(agora + 9 * H).toISOString(), tipo: "baixar",
        produto: "Caixa de som portátil Z (exemplo)", listingId: "MLB0000000001",
        preco_atual: 249.9, preco_novo: 236.9, roi_novo: 27, lucro_novo: 38.4,
        motivo: "Vencedor do catálogo está R$ 9 abaixo, sem Full", link: "https://www.mercadolivre.com.br/"
      }
    },
    ordens: {
      "vigia-demo": { agente: "vigia", texto: "Não baixe preço de colecionável abaixo de ROI 30%", ts: iso(2 * D), status: "feito", de: "gerente", resposta: "Entendido: piso de 30% pra colecionáveis.", feito_em: iso(1 * D) }
    },
    relatorios: {
      "2026-10-20": {
        ts: iso(2 * D), semana: "13/10 a 19/10", resumo: "Seletto estável no automático; Musko ganhou tração com conteúdo educativo.",
        acoes: ["Recomprar a garrafa térmica (ROI 38%, giro de 4 dias)", "Gravar os 2 Reels da pauta até quinta", "Liquidar os 2 encalhados há 40+ dias"],
        travado: ["1 preço esperando o seu Sim"], alertas: [],
        seletto: { titulo: "Lucro de R$ 1.284 (+12%)", rendeu: ["23 vendas", "Vigia recuperou 2 catálogos"], observacoes: ["Capital parado de R$ 640 em 2 itens"], melhorias: ["Avaliar 3 ofertas por semana no mínimo"] },
        musko: { titulo: "+212 seguidores", rendeu: ["Reel de taxas foi o melhor da semana"], observacoes: ["Unboxing sem gancho performa mal"], melhorias: ["Sempre abrir com a conta China × Brasil em R$"] },
        ordens: ["Vigia: piso de ROI 30% em colecionáveis"]
      }
    },
    pautas: {
      "2026-10-19": {
        ts: iso(3 * D), semana: "20/10 a 26/10",
        metricas: { resumo: "18,4 mil de alcance, +212 seguidores", alcance: 18400, seguidores: 212 },
        itens: [
          { tipo: "video", dia: "terça", duracao: "até 45s", titulo: "A taxa de 20% na prática", por_que: "Dúvida nº 1 da comunidade na semana",
            gancho: "Paguei R$ 100 lá fora. Quanto chegou aqui?", ganchos_alt: ["Ninguém te conta essa conta", "A taxa que assusta, explicada em 30s"],
            roteiro: ["Mostra o produto e o preço na China", "Soma frete e taxa na tela", "Compara com o preço no Brasil", "Conclusão: quando compensa"],
            texto_tela: ["R$ 100 + frete", "+ 20% de taxa", "Total vs Brasil"], cta: "Comenta TAXA que eu te mando a planilha",
            legenda: "Paguei R$ 100 lá fora. Quanto chegou aqui?\nFiz a conta inteira no vídeo.\nComenta TAXA que eu te mando a planilha.", hashtags: "#importacao #comprasinternacionais #achados" },
          { tipo: "video", dia: "quinta", duracao: "até 45s", titulo: "3 erros do primeiro pedido", por_que: "Formato de lista teve o maior número de salvos",
            gancho: "Errei isso no meu primeiro pedido.", roteiro: ["Erro 1: não pesar o frete", "Erro 2: juntar tudo num pacote só", "Erro 3: não conferir a loja"], cta: "Comenta GUIA", legenda: "3 erros que eu cometi pra você não cometer.", hashtags: "#importacao #dicas" },
          { tipo: "carrossel", dia: "sábado", titulo: "Agente de compra em 5 passos", por_que: "Carrossel educativo gera salvamento",
            gancho: "Como comprar da China sem dor de cabeça", roteiro: ["Card 1: capa", "Card 2: crie a conta", "Card 3: cole o link", "Card 4: escolha o frete", "Card 5: acompanhe", "Card 6: Comenta PASSO"], cta: "Comenta PASSO", legenda: "Salva pra fazer o seu primeiro pedido.", hashtags: "#importacao" }
        ],
        stories: ["Enquete: qual produto você importaria?", "Bastidor da gravação", "Caixinha de perguntas sobre taxa"]
      }
    }
  };

  /* ---------- motor do banco em memória ---------- */
  const dados = JSON.parse(JSON.stringify(SEED));
  const ouvintes = []; // {nome, campo, dir, n, cb}

  function snapshot(nome, campo, dir, n) {
    let docs = Object.entries(dados[nome] || {}).map(([id, d]) => ({ id, data: () => ({ ...d }) }));
    if (campo) {
      docs.sort((a, b) => {
        const x = a.data()[campo], y = b.data()[campo];
        return (x < y ? -1 : x > y ? 1 : 0) * (dir === "desc" ? -1 : 1);
      });
    }
    if (n) docs = docs.slice(0, n);
    return { docs };
  }
  function avisar(nome) {
    ouvintes.filter((o) => o.nome === nome).forEach((o) => {
      try { o.cb(snapshot(o.nome, o.campo, o.dir, o.n)); } catch (e) { console.error(e); }
    });
  }
  function consulta(nome, campo, dir, n) {
    return {
      orderBy: (c, d) => consulta(nome, c, d, n),
      limit: (k) => consulta(nome, campo, dir, k),
      onSnapshot(cb) {
        const o = { nome, campo, dir, n, cb };
        ouvintes.push(o);
        setTimeout(() => cb(snapshot(nome, campo, dir, n)), 0);
        return () => ouvintes.splice(ouvintes.indexOf(o), 1);
      }
    };
  }
  function collection(nome) {
    dados[nome] = dados[nome] || {};
    return {
      ...consulta(nome),
      doc(id) {
        return {
          async set(d) { dados[nome][id] = { ...d }; avisar(nome); },
          async update(d) { dados[nome][id] = { ...(dados[nome][id] || {}), ...d }; avisar(nome); }
        };
      }
    };
  }

  /* ---------- "MCP" falso: simula o Hunter aplicando o preço ---------- */
  const mcp = {
    async callTool(servidor, ferramenta, input) {
      await new Promise((r) => setTimeout(r, 600));
      return { ok: true, servidor, ferramenta, input, demo: true };
    }
  };

  /* ---------- vida no escritório: agentes pegam e largam tarefas ---------- */
  const ROTINA = [
    ["vigia", "Vigiando os anúncios"], ["financeiro", "Fechando a semana"], ["conciliador", "Lançando as vendas da semana"],
    ["metricas", "Lendo o Instagram da semana"], ["pauteiro", "Montando a pauta"], ["roteirista", "Escrevendo o roteiro de quinta"],
    ["gerente", "Lendo a semana do time"]
  ];
  function simularVida() {
    setInterval(() => {
      const [id, tarefa] = ROTINA[Math.floor(Math.random() * ROTINA.length)];
      const e = dados.estado[id] || {};
      const trabalhando = e.status !== "trabalhando";
      dados.estado[id] = trabalhando
        ? { status: "trabalhando", tarefa, ts: new Date().toISOString() }
        : { status: "ocioso", tarefa: "Rodada de demonstração concluída", ts: new Date().toISOString() };
      avisar("estado");
    }, 9000);
  }

  window.DemoStore = {
    create() { simularVida(); return { collection }; },
    mcp
  };
})();
