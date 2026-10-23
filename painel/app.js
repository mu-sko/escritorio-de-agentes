"use strict";
/* Escritório de Agentes: sala em pixel art (canvas), feed ao vivo, aprovações human-in-the-loop e fichas dos agentes. */
const STATUS={pronto:"Contratado",proximo:"Próximo",spec:"Spec feita",ideia:"Ideia"};
const SPRITE=["..hhhh..",".hhhhhh.",".hssssh.",".sesess.",".ssssss.","..cccc..",".cccccc.",".cc..cc."];
/* x,y = centro da mesa, em pixels da sala (200 x 120) */
const AGENTS=[
 {id:"avaliador",curto:"Avaliador",nome:"Avaliador de Produtos",cargo:"Diz se uma oferta vale comprar",status:"pronto",hue:"#e8622c",hair:"#3a2a1c",x:40,y:64,area:"seletto",
  quando:"Sob demanda: você manda o link",onde:"Chrome do seu PC + Hunter HUB",autonomia:"Total (só analisa)",
  como:["Abre o link da loja pelo Chrome","Pré-filtro: varejo grande e histórico","Acha o catálogo no ML e lê o Hunter Spy","Concorrentes, Full e vencedor do catálogo","Simula o líquido real e o ROI","Veredito, quantidade, capital e link"],
  regras:["ROI mín. 25% sobre o custo, alvo 30%","Venda < 1/dia só com ROI ≥ 100%","3% abaixo do Full quando houver","Dado só do bot = PENDENTE","Planilha Seletto como fonte reserva"]},
 {id:"financeiro",curto:"Financeiro",nome:"Relatório Financeiro",cargo:"Fecha a semana: lucro e o que fazer",status:"pronto",hue:"#2f8f4e",hair:"#1a1a1a",x:112,y:64,area:"seletto",
  quando:"Toda segunda 6h56",onde:"Nuvem (PC pode estar desligado)",autonomia:"Total (só lê dados)",
  como:["Lucro, margem e ROI da semana","Compara com a semana anterior","Anúncios abaixo de 25% de ROI","Encalhados e capital parado","Catálogos que você está perdendo","3 ações da semana"],
  regras:["Só lê, nunca altera preço","Entrega: notificação + e-mail"]},
 {id:"vigia",curto:"Vigia",nome:"Vigia de Anúncios",cargo:"Protege a margem dos anúncios",status:"pronto",hue:"#c07a2c",hair:"#2b2b2b",x:40,y:156,area:"seletto",
  quando:"Todo dia 9h28 (o Sim aplica na hora)",onde:"Hunter + Chrome da Seletto",autonomia:"Sugere; aplica só com seu sim",
  como:["Ganhando ou perdendo o catálogo, e por quanto","Custo real na planilha, payout no Hunter","Baixa até o piso: ROI 25% (15% se parado há 30+ dias)","Sobe preço quando o concorrente sumir ou subir","Recompra: avisa se o produto entra em promo no varejo","Proposta aparece aqui: o Sim aplica na hora"],
  regras:["Nunca muda preço sem o seu Sim","Proposta vence em 12h","Testa a troca no Hunter antes de aplicar","Hunter fora do ar: aplica pelo site do ML"]},
 {id:"pauteiro",curto:"Planejador",nome:"Planejador de Conteúdo",cargo:"Monta a semana de conteúdo",status:"pronto",hue:"#3d6fb6",hair:"#111",x:248,y:64,area:"musko",
  quando:"Domingo 17h52, logo depois do Analista",onde:"Nuvem + Chrome do seu PC",autonomia:"Total (rascunho)",como:["Lê o relatório do Métricas","Dúvidas que mais aparecem no Discord Musko Hub","O que os criadores de referência postaram","2 vídeos + 1 carrossel, com dia de gravar","Cada pauta diz por que entrou"],regras:["Nicho: ensinar importação e achados de lifestyle","Nada de réplica nem jeitinho na alfândega","Publicar é com você"]},
 {id:"roteirista",curto:"Roteirista",nome:"Roteirista de Reels",cargo:"Roteiro pronto pra gravar",status:"pronto",hue:"#7a4fb3",hair:"#4a2f1a",x:320,y:64,area:"musko",
  quando:"Domingo, junto com a pauta",onde:"Nuvem",autonomia:"Total (rascunho)",como:["Gancho dos 3 primeiros segundos","Fala em frases curtas, do jeito que você fala","Texto na tela e cortes","Chamada final: Comenta PALAVRA (ManyChat)","Legenda e hashtags","Carrossel card a card"],regras:["Vídeo até 45s","Sem travessão","Tom educado no Instagram"]},
 {id:"metricas",curto:"Analista IG",nome:"Analista do Instagram",cargo:"O que funcionou no Instagram",status:"pronto",hue:"#2f8f8a",hair:"#222",x:248,y:156,area:"musko",
  quando:"Domingo 17h52, abre a cadeia",onde:"Chrome (Meta Business Suite, CSSBuy, ByteMax, YouTube)",autonomia:"Total (só lê)",como:["Alcance, visualizações, salvos e compartilhamentos","Seguidores ganhos na semana","Melhor e pior post, com o porquê","Formato e tema que mais rendem","Passa tudo pro Pauteiro"],regras:["Só lê, nunca posta","Sem dado = diz que não tem"]},
 {id:"conciliador",curto:"Conciliador",nome:"Conciliador de Vendas",cargo:"Lança as vendas do ML na planilha",status:"pronto",hue:"#5a7d3a",hair:"#3a2a1c",x:112,y:156,area:"seletto",
  quando:"Toda segunda 7h50",onde:"Hunter + planilha Seletto",autonomia:"Total (só escreve vendas nas colunas R a Z)",como:["Puxa os pedidos novos no Hunter","Acha a linha da compra na planilha (FIFO)","Lança quantidade, preço, taxa, frete e data","Confere o líquido com o payout do Hunter","Avisa margem negativa, reembolso e recompra"],regras:["Nunca mexe da coluna AA em diante","Venda sem compra lançada: só avisa"]},
 {id:"gerente",curto:"Gerente",nome:"Gerente Geral",cargo:"Maestro: orquestra a Seletto e o Musko",status:"pronto",hue:"#6d5aa8",hair:"#555",x:180,y:64,area:"musko",
  quando:"Toda segunda 8h12, depois do Financeiro e do Conciliador",onde:"Nuvem (lê o escritório e a memória dos projetos)",autonomia:"Recomenda e dá o foco da semana a cada agente",como:["Lê tudo que o time registrou na semana","O que rendeu na Seletto e no Musko","Observações e melhorias de cada projeto","Onde pôr tempo e dinheiro: 3 ações","O que está travado esperando você","Alerta se algum agente parou de rodar","Manda o foco da semana pra cada agente"],regras:["Nunca compra, muda preço nem publica","Recado dele segue as regras de cada agente","Você pode responder ou desfazer qualquer foco"]}
];
const TIMELINE=[
 ["01:04","Estrutura definida: Project + Skill + tarefa agendada"],["01:45","Caçador dividido em Buscador + Avaliador"],
 ["02:14","Avaliador: bot vira só triagem"],["09:28","Primeiro teste 100% pelo Chrome com Hunter Spy"],
 ["10:57","Primeiro aprovado: Nutren Control, ROI 64,6%"],["14:14","Financeiro contratado"],
 ["14:27","Buscador contratado"],["14:42","Avaliador usa a planilha Seletto como reserva"],
 ["16:40","Painel ao vivo"],["16:50","Sala em pixel art com agentes trabalhando"],["17:25","Diretoria no corredor: o Gerente coordena os dois"],["17:30","Buscador de hora em hora, com triagem de todas as promos"],["19:50","Vigia de Preço contratado: propostas com Sim/Não aqui no painel"],["20:05","O Sim aplica o preço na hora, direto do painel"],["20:20","Sala maior, nome em balão seguindo cada agente, movimento suave"],["20:40","Escritório redesenhado: vista de cima, mesas em 3D, gente de costas trabalhando"],["16/10 08:20","Time do Musko contratado: Métricas, Pauteiro e Roteirista, todo domingo 18h"],["16/10 09:40","Toque no agente abre a conversa: recado vai pra mesa dele. Quem precisa de você levanta a mão"],["16/10 09:45","Nomes que dizem o que cada agente faz"],["16/10 10:00","Gerente Geral contratado: o maestro dos dois times. Conciliador de Vendas ganha mesa"],["16/10 20:40","Cada time no seu Chrome (Seletto e Musko). Buscador 4x e Vigia 3x por dia pra economizar. Garimpeiro de Achados ganha mesa"],["21/10","Time enxugado: Buscador e Garimpeiro aposentados, Vigia 1x por dia (9h28). Time Musko usa a fórmula do Reels Audit e marca o que a fábrica de reels faz sem gravar"]
];
const STALE_MS=45*60e3;
let estados={}, eventos=[];

function esc(s){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function contratado(a){return a.status==="pronto"}
var propostas=[],ordens=[];
/* mão levantada: o agente precisa de você (preço esperando o Sim, ou ele gravou "precisa" no estado) */
function precisaDe(a){
  if(a.id==="vigia"){const n=propostas.filter(p=>p.status==="pendente"&&(!p.expira_em||new Date(p.expira_em)>Date.now())).length;
    if(n)return {txt:n===1?"1 preço esperando seu sim":n+" preços esperando seu sim",ir:"aprov"}}
  const e=estados[a.id];
  if(e&&e.precisa&&Date.now()-new Date(e.ts)<24*3600e3)return {txt:String(e.precisa)};
  return null;
}
function estadoDe(a){
  if(!contratado(a))return {k:"vaga",txt:"Vaga aberta"};
  const pede=precisaDe(a);if(pede)return {k:"mao",txt:pede.txt,ir:pede.ir};
  const e=estados[a.id];
  if(e&&e.status==="trabalhando"&&Date.now()-new Date(e.ts)<STALE_MS)return {k:"trab",txt:e.tarefa||"Trabalhando"};
  return {k:"ocioso",txt:(e&&e.tarefa)||"Esperando a próxima tarefa"};
}

/* ---------- Cena (vista de cima, meio inclinada, pixel art) ---------- */
const cv=document.getElementById("scene"),ctx=cv.getContext("2d");
const W=360,H=216,S=4;let frame=0;
cv.width=W*S;cv.height=H*S;
/* O Windows com "efeitos de animação" desligados pede menos movimento e a sala congelava.
   Agora a sala anda por padrão; o botão abaixo da sala desliga, e a escolha fica salva neste navegador. */
const sistemaReduz=matchMedia("(prefers-reduced-motion: reduce)");
let parado=false;try{parado=localStorage.getItem("mov")==="off"}catch(e){}
const reduce={get matches(){return parado}};
function botaoMov(){const b=document.getElementById("mov");if(!b)return;b.textContent=parado?"Ligar movimento":"Parar movimento";b.setAttribute("aria-pressed",String(parado))}
document.getElementById("mov").addEventListener("click",()=>{parado=!parado;try{localStorage.setItem("mov",parado?"off":"on")}catch(e){}botaoMov()});
botaoMov();
/* paleta fixa da cena: é uma ilustração, fica igual no claro e no escuro */
const P={piso1:"#ecdcb8",piso2:"#e3cfa6",junta:"#cfb88c",azulejo:"#e6e9ec",azulejo2:"#dde1e5",rejunte:"#c9cfd5",corr:"#f3f1ec",corr2:"#e9e6df",
  carpete:"#c7d3e6",carpete2:"#bccae0",parede:"#cfd9e1",paredeEsc:"#b5c2cc",topo:"#6c7a86",topoClaro:"#8e9ba6",rodape:"#9fadb8",
  madeira:"#d19a5f",madeiraClara:"#e2b37b",madeiraFrente:"#a06d3e",madeiraEsc:"#714a27",
  monitor:"#262b33",telaOff:"#3c4653",tela:"#5aa9e6",telaLinha:"#e3f2ff",teclado:"#dfe3e8",papel:"#fbfaf6",
  cadeira:"#3b4c70",cadeiraEsc:"#27334d",roda:"#1d2333",
  folha:"#4e9c48",folhaEsc:"#33783a",folhaClara:"#73bf5c",vaso:"#cf6a3f",vasoEsc:"#9e4a2a",
  sofa:"#4b7fc4",sofaEsc:"#335f99",cinza:"#a7b0b8",cinzaEsc:"#7d8790",branco:"#ffffff",vidro:"#bfe3f5",vidroEsc:"#8ec4de",
  tapeteS:"#f0b38e",tapeteS2:"#e58f63",tapeteM:"#a9c1e8",tapeteM2:"#7f9fd6",laranja:"#e8622c",azul:"#3d6fb6",verde:"#2f8f4e",
  contorno:"#2a2320",pele:"#f2c09a",peleEsc:"#d99d76",calca:"#3b4a63",sapato:"#2a2320",zz:"#5b8fd6",sombra:"rgba(30,20,10,.18)"};
let g=ctx;
function r(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x*S)/S,Math.round(y*S)/S,w,h)}
/* desenha um sprite (linhas de texto) com contorno escuro automático */
function blit(rows,map,x,y,contorno=true){
  const cheio=(i,j)=>j>=0&&j<rows.length&&i>=0&&i<rows[j].length&&map[rows[j][i]]!==undefined;
  if(contorno)rows.forEach((row,j)=>[...row].forEach((ch,i)=>{if(!cheio(i,j))return;
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{if(!cheio(i+dx,j+dy))r(x+i+dx,y+j+dy,1,1,P.contorno)})}));
  rows.forEach((row,j)=>[...row].forEach((ch,i)=>{const c=map[ch];if(c)r(x+i,y+j,1,1,c)}));
}
/* ----- personagens (12 x 17) ----- */
const FRENTE=["...hhhhhh...","..hhhhhhhh..",".hhhhhhhhhh.",".hssssssssh.",".ssllssllss.",".ssssssssss.","..ssssssss..","...ssssss...",
  "..cccccccc..",".cccccccccc.","sccccccccccs","sccccccccccs",".cccccccccc.",".pppppppppp.",".pppp..pppp.",".pppp..pppp.",".kkkk..kkkk."];
const PASSO_A=[".pppp..pppp.","..ppp..pppp.","..kkk..kkkk."], PASSO_B=[".pppp..pppp.",".pppp..ppp..",".kkkk..kkk.."];
const COSTAS=["...hhhhhh...","..hhhhhhhh..",".hhhhhhhhhh.",".hhhhhhhhhh.",".hhhhhhhhhh.",".shhhhhhhhs.","..hhhhhhhh..","...ssssss...",
  "..cccccccc..",".cccccccccc.","sccccccccccs","sccccccccccs"];
function mapa(a){return {h:a.hair,s:P.pele,l:"#3a2a20",c:a.hue,p:P.calca,k:P.sapato}}
function andando(a,x,y,passo){                 // x,y = pés
  let rows=FRENTE;if(passo!==undefined)rows=FRENTE.slice(0,14).concat(passo?PASSO_A:PASSO_B);
  r(x-6,y-1,12,2,P.sombra);
  blit(rows,mapa(a),x-6,y-17);
}
/* ----- móveis ----- */
function cadeira(x,y){                          // y = topo do encosto
  r(x-6,y,12,7,P.cadeira);r(x-6,y,12,1,P.cadeiraEsc);r(x-6,y+6,12,1,P.cadeiraEsc);r(x-7,y+1,1,5,P.cadeiraEsc);r(x+6,y+1,1,5,P.cadeiraEsc);
  r(x-1,y+7,2,3,P.roda);r(x-5,y+10,10,1,P.roda);r(x-5,y+11,2,1,P.roda);r(x+3,y+11,2,1,P.roda);
}
function mesa(a,trab){
  const x=a.x,y=a.y,t=reduce.matches?0:frame;
  r(x-18,y+9,36,3,P.sombra);
  r(x-17,y-7,34,10,P.madeira);r(x-17,y-7,34,1,P.madeiraClara);r(x-17,y+3,34,6,P.madeiraFrente);r(x-17,y+8,34,1,P.madeiraEsc);
  r(x-18,y-7,1,16,P.madeiraEsc);r(x+17,y-7,1,16,P.madeiraEsc);
  r(x-16,y+9,2,4,P.madeiraEsc);r(x+14,y+9,2,4,P.madeiraEsc);
  // monitor
  r(x-8,y-21,16,12,P.monitor);r(x-1,y-9,2,3,P.monitor);r(x-4,y-7,8,1,P.monitor);
  if(trab){r(x-7,y-20,14,10,P.tela);for(let i=0;i<4;i++)if((t+i)%4)r(x-6,y-19+i*2,((t*5+i*3)%9)+3,1,P.telaLinha)}
  else{r(x-7,y-20,14,10,P.telaOff);r(x-6,y-19,3,1,"#55606e")}
  // tampo
  r(x-6,y-3,12,3,P.teclado);r(x-6,y-1,12,1,P.cinza);r(x+8,y-2,3,2,P.teclado);
  r(x-15,y-5,6,5,P.papel);r(x-14,y-4,4,1,P.cinza);r(x-14,y-2,3,1,P.cinza);
  r(x+12,y-6,3,4,a.hue);r(x+15,y-5,1,2,a.hue);
}
/* em pé ao lado da mesa, com a mão levantada e um "!" pulando */
const EXC=["1","1","1",".","1"];
function maoLevantada(a,x,y){
  const up=reduce.matches?0:Math.floor(performance.now()/400)%2;
  andando(a,x,y);
  r(x+6,y-24-up,2,9+up,P.pele);r(x+6,y-25-up,2,2,P.pele);r(x+5,y-17,3,3,a.hue);           // braço erguido
  r(x+5,y-25-up,1,1,P.contorno);r(x+8,y-25-up,1,9+up,P.contorno);
  const bx=x+9,by=y-31-up;                                                             // balão "!"
  r(bx-1,by-1,7,9,P.contorno);r(bx,by,5,7,"#ffd84a");r(bx+2,by+8,2,2,P.contorno);
  EXC.forEach((row,j)=>{if(row==="1")r(bx+2,by+1+j,1,1,P.contorno)});
}
function sentado(a,trab){                      // pessoa de costas, sentada virada pra mesa
  const x=a.x,y=a.y,bob=trab&&!reduce.matches&&frame%2?1:0;
  if(trab)blit(COSTAS,mapa(a),x-6,y+1+bob);
  cadeira(x,y+8);
  if(trab&&!reduce.matches){const up=frame%2;r(x-7,y+(up?10:11),2,2,P.pele);r(x+5,y+(up?11:10),2,2,P.pele)}  // mãos digitando
}
function planta(x,y){                           // x,y = base do vaso
  r(x-6,y,12,2,P.sombra);
  blit(["...ffff...","..fFffFf..",".fFfffffF.","fffFfffFff",".fffFfff..","..ffFff...","....tt....","..vvvvvv..","..vVvvvv..","...vvvv..."],
    {f:P.folha,F:P.folhaClara,t:P.folhaEsc,v:P.vaso,V:P.vasoEsc},x-5,y-10);
}
function janela(x,y,w){r(x-1,y-1,w+2,14,P.branco);r(x,y,w,12,P.vidro);r(x+(w>>1),y,1,12,P.branco);r(x,y+6,w,1,P.branco);
  r(x+2,y+2,1,3,P.branco);r(x+3,y+1,1,2,P.branco);r(x-2,y+12,w+4,2,P.paredeEsc)}
function arquivo(x,y){r(x,y,10,16,P.cinza);r(x,y,10,1,P.branco);[3,8,13].forEach(d=>{r(x+1,y+d-1,8,1,P.cinzaEsc);r(x+4,y+d,2,1,P.cinzaEsc)});r(x,y+16,10,2,P.sombra)}
function abajur(x,y){r(x-3,y+1,6,1,P.sombra);r(x,y-16,1,16,P.cinzaEsc);r(x-2,y,5,1,P.cinzaEsc);r(x-4,y-21,9,5,"#f6e7b8");r(x-4,y-17,9,1,"#d8c48a")}
function sofa(x,y){r(x,y+12,32,2,P.sombra);r(x,y,32,5,P.sofaEsc);r(x,y+4,32,8,P.sofa);r(x-2,y+2,3,10,P.sofaEsc);r(x+31,y+2,3,10,P.sofaEsc);
  r(x+2,y+5,13,1,"#6a98d4");r(x+17,y+5,13,1,"#6a98d4")}
function bebedouro(x,y){r(x-4,y+1,9,2,P.sombra);r(x-4,y-12,9,13,P.branco);r(x-4,y-12,9,1,P.cinza);r(x-3,y-19,7,7,"#9fd2f0");r(x-3,y-19,7,1,"#c9e8f8");r(x-1,y-8,3,2,P.azul)}
/* ----- planta da sala ----- */
const TOPW=30, WL=152, WR=202, ESP=6, PORTA_Y=122, PORTA_H=26, VIDRO_Y=100;
function chaoTabuas(x0,x1){for(let y=TOPW;y<H;y+=6){r(x0,y,x1-x0,6,(y/6)%2?P.piso1:P.piso2);r(x0,y+5,x1-x0,1,P.junta);
  const off=((y/6)*17)%36;for(let x=x0+off;x<x1;x+=36)r(x,y,1,5,P.junta)}}
function chaoAzulejo(x0,x1,y0,y1,c1,c2,lin,t){for(let y=y0;y<y1;y+=t)for(let x=x0;x<x1;x+=t){r(x,y,Math.min(t,x1-x),Math.min(t,y1-y),((x+y)/t)%2?c1:c2);r(x,y,Math.min(t,x1-x),1,lin);r(x,y,1,Math.min(t,y1-y),lin)}}
const bg=document.createElement("canvas");bg.width=W*S;bg.height=H*S;
function drawFundo(){
  const b=bg.getContext("2d");b.setTransform(S,0,0,S,0,0);b.imageSmoothingEnabled=false;g=b;
  chaoTabuas(0,WL);                                                      // Seletto: tábuas
  chaoAzulejo(WR+ESP,W,TOPW,H,P.azulejo,P.azulejo2,P.rejunte,12);        // Musko: azulejo
  chaoAzulejo(WL+ESP,WR,VIDRO_Y,H,P.corr,P.corr2,"#dcd7cc",11);          // corredor
  chaoAzulejo(WL+ESP,WR,TOPW,VIDRO_Y,P.carpete,P.carpete2,P.carpete2,4); // diretoria: carpete
  // parede do fundo, com profundidade
  r(0,0,W,TOPW,P.parede);r(0,0,W,3,P.topo);r(0,3,W,1,P.topoClaro);r(0,TOPW-3,W,3,P.rodape);r(0,TOPW,W,2,"rgba(0,0,0,.08)");
  janela(10,7,26);janela(164,7,12);janela(184,7,12);janela(222,7,26);janela(322,7,26);
  r(48,6,40,18,P.branco);r(48,6,40,1,P.cinza);r(47,6,1,18,P.cinza);r(88,6,1,18,P.cinza);                    // quadro de metas
  r(52,10,16,2,P.laranja);r(52,14,26,1,P.cinza);r(52,17,20,1,P.cinza);r(52,20,12,1,P.cinza);r(78,17,6,5,P.verde);
  r(100,6,9,9,P.branco);r(100,6,9,1,P.cinzaEsc);r(104,8,1,4,P.contorno);r(104,11,3,1,P.contorno);              // relógio
  r(116,4,24,30,P.madeiraEsc);r(117,5,22,28,P.madeiraFrente);                                                   // estante
  [6,15,24].forEach(d=>{r(117,4+d+7,22,2,P.madeiraEsc);[0,4,8,12,16].forEach((o,i)=>r(118+o,4+d,3,7,[P.laranja,P.azul,P.verde,P.branco,P.vaso][i]))});
  r(258,4,50,22,P.monitor);r(260,6,46,18,P.azul);r(264,9,10,4,P.branco);r(264,15,30,2,"#8fb3e6");r(264,19,22,2,"#8fb3e6"); // painel de métricas
  r(292,9,10,8,P.laranja);
  // paredes do corredor (vistas de cima) com portas
  [WL,WR].forEach(x=>{
    const parede=(y0,y1)=>{r(x,y0,ESP,y1-y0,P.topo);r(x,y0,ESP,y1-y0,P.topo);r(x+1,y0,ESP-2,y1-y0,P.topoClaro);r(x+ESP,y0,2,y1-y0,"rgba(0,0,0,.10)")};
    parede(TOPW-2,PORTA_Y);parede(PORTA_Y+PORTA_H,H);
    r(x-1,PORTA_Y-2,ESP+2,2,P.madeiraEsc);r(x-1,PORTA_Y+PORTA_H,ESP+2,2,P.madeiraEsc)});
  r(WL-16,PORTA_Y,16,3,P.madeira);r(WL-16,PORTA_Y,16,1,P.madeiraClara);                                        // portas abertas
  r(WR+ESP,PORTA_Y,16,3,P.madeira);r(WR+ESP,PORTA_Y,16,1,P.madeiraClara);
  // vidro da diretoria
  r(WL+ESP,VIDRO_Y,18,3,P.vidroEsc);r(WL+ESP+34,VIDRO_Y,WR-(WL+ESP+34),3,P.vidroEsc);
  r(WL+ESP,VIDRO_Y,18,1,P.branco);r(WL+ESP+34,VIDRO_Y,WR-(WL+ESP+34),1,P.branco);
  r(WL+ESP+18,VIDRO_Y,1,4,P.cinzaEsc);r(WL+ESP+33,VIDRO_Y,1,4,P.cinzaEsc);
  r(166,36,28,16,P.tapeteS2);r(167,37,26,14,P.tapeteS);r(170,40,20,8,P.tapeteS2);
  // tapetes das salas
  r(44,104,64,22,P.tapeteS2);r(46,106,60,18,P.tapeteS);r(50,110,52,10,P.tapeteS2);r(52,112,48,6,P.tapeteS);
  r(254,104,64,22,P.tapeteM2);r(256,106,60,18,P.tapeteM);r(260,110,52,10,P.tapeteM2);r(262,112,48,6,P.tapeteM);
  // corredor
  r(WL+ESP+10,H-7,26,7,P.madeiraEsc);r(WL+ESP+11,H-6,24,5,P.madeira);                                          // capacho da entrada
  g=ctx;
}
/* móveis que entram na ordem de profundidade (quem está mais embaixo passa na frente) */
const MOVEIS=[
  {y:44,d:()=>planta(8,44)},{y:44,d:()=>planta(214,44)},{y:44,d:()=>planta(354,44)},
  {y:208,d:()=>planta(8,208)},{y:208,d:()=>planta(146,208)},{y:198,d:()=>planta(166,198)},
  {y:52,d:()=>arquivo(140,36)},{y:52,d:()=>arquivo(218,36)},
  {y:206,d:()=>abajur(80,206)},{y:200,d:()=>sofa(320,186)},{y:200,d:()=>{r(300,192,14,8,P.madeiraFrente);r(300,192,14,2,P.madeira)}},
  {y:120,d:()=>bebedouro(194,120)}];
/* ----- quem não está trabalhando anda pela sala, dormindo ----- */
var tagsProntas=false;
const AREAS={seletto:[{x0:14,x1:44,y0:104,y1:118},{x0:110,x1:140,y0:104,y1:118},{x0:22,x1:62,y0:192,y1:206},{x0:94,x1:132,y0:192,y1:206},{x0:112,x1:144,y0:180,y1:190}],
  musko:[{x0:220,x1:250,y0:104,y1:118},{x0:322,x1:350,y0:104,y1:118},{x0:222,x1:268,y0:192,y1:206},{x0:282,x1:298,y0:180,y1:190}],
  diretoria:[{x0:166,x1:194,y0:76,y1:94}]};
const walkers={};
function areaDe(a){const zs=a.id==="gerente"?AREAS.diretoria:AREAS[a.area];
  const mesmos=AGENTS.filter(b=>b.area===a.area&&b.id!=="gerente"&&contratado(b));const i=Math.max(0,mesmos.indexOf(a));return zs[i%zs.length]}
function novoAlvo(w,A){w.tx=A.x0+Math.random()*(A.x1-A.x0);w.ty=A.y0+Math.random()*(A.y1-A.y0)}
function walker(a){let w=walkers[a.id];if(!w){const A=areaDe(a);w=walkers[a.id]={x:0,y:0,pause:1,moving:false};novoAlvo(w,A);w.x=w.tx;w.y=w.ty;novoAlvo(w,A)}return w}
const VEL=9;
function andar(a,dt){const w=walker(a);w.moving=false;if(reduce.matches)return;if(w.pause>0){w.pause-=dt;return}
  const A=areaDe(a),dx=w.tx-w.x,dy=w.ty-w.y,d=Math.hypot(dx,dy);
  if(d<0.3){w.pause=1.5+Math.random()*3;novoAlvo(w,A);return}
  const v=Math.min(VEL*dt,d);w.x+=dx/d*v;w.y+=dy/d*v;w.moving=true}
const ZG=["11111","...1.","..1..",".1...","11111"];
function zz(x,y,a){const t=reduce.matches?0:((performance.now()/1000)+a.id.length*0.37)%3;
  [[0,0],[4,-5],[8,-10]].forEach(([dx,dy],i)=>{if(t>i*0.8){const s=-Math.floor((t-i*0.8)*2);ZG.forEach((row,j)=>[...row].forEach((ch,k)=>{if(ch==="1")r(x+dx+k,y+dy+s+j,1,1,P.zz)}))}})}
function draw(){
  ctx.setTransform(S,0,0,S,0,0);ctx.imageSmoothingEnabled=false;g=ctx;
  ctx.drawImage(bg,0,0,W,H);
  const itens=MOVEIS.slice();
  AGENTS.forEach(a=>{const st=estadoDe(a),sent=st.k==="trab"&&!indo[a.id];itens.push({y:a.y+10,d:()=>{mesa(a,st.k==="trab");sentado(a,sent)}})});
  AGENTS.forEach(a=>{const k=estadoDe(a).k;
    if(k==="mao"){const p=pontoMao(a);itens.push({y:p.y,d:()=>maoLevantada(a,p.x,p.y)});return}
    if(k==="trab"&&indo[a.id]){const w=walker(a);itens.push({y:w.y,d:()=>andando(a,w.x,w.y,Math.floor(performance.now()/140)%2)});return}
    if(k!=="ocioso")return;const w=walker(a);
    itens.push({y:w.y,d:()=>{andando(a,w.x,w.y,w.moving?Math.floor(performance.now()/170)%2:undefined);zz(w.x+8,w.y-13,a)}})});
  itens.sort((p,q)=>p.y-q.y).forEach(i=>i.d());
  if(tagsProntas)posicionarTags();
}
/* transições: quem recebe tarefa caminha até a cadeira; quem termina levanta e volta a andar */
var indo={};const ultimoK={};
function pontoMao(a){return {x:a.x+12,y:a.y+32}}
function cadeiraDe(a){return {x:a.x,y:a.y+20}}
function transicoes(dt){
  AGENTS.forEach(a=>{const k=estadoDe(a).k,prev=ultimoK[a.id];ultimoK[a.id]=k;
    if(prev&&prev!==k){
      const w=walker(a);
      if(k==="trab"&&!reduce.matches){if(prev==="mao"){const p=pontoMao(a);w.x=p.x;w.y=p.y}indo[a.id]=true}
      if(k==="ocioso"&&(prev==="trab"||prev==="mao")){const c=prev==="mao"?pontoMao(a):cadeiraDe(a);w.x=c.x;w.y=c.y;w.pause=0.6}
    }
    if(indo[a.id]){if(k!=="trab"){indo[a.id]=false;return}
      const w=walker(a),c=cadeiraDe(a),dx=c.x-w.x,dy=c.y-w.y,d=Math.hypot(dx,dy);
      if(d<0.6){indo[a.id]=false;return}
      const v=Math.min(VEL*1.8*dt,d);w.x+=dx/d*v;w.y+=dy/d*v}
  });
}
let antes=0,acumulado=0;
function loop(t){const dt=Math.min(0.1,(t-(antes||t))/1000);antes=t;
  transicoes(dt);
  AGENTS.forEach(a=>{if(estadoDe(a).k==="ocioso")andar(a,dt)});
  acumulado+=dt;if(acumulado>0.25){frame++;acumulado=0}
  draw();requestAnimationFrame(loop)}
drawFundo();draw();requestAnimationFrame(loop);

/* ---------- Balões com o nome, seguindo cada agente ---------- */
const room=document.getElementById("room");
var tagsDe={};
function curto(t,n){t=String(t||"");return t.length>n?t.slice(0,n-1).trimEnd()+"…":t}
function abrirFicha(id){const d=document.getElementById("card-"+id);if(d){d.open=true;d.scrollIntoView({behavior:reduce.matches?"auto":"smooth",block:"center"})}}
/* ---------- Conversa: toque no agente, veja o que ele fez e mande um recado ---------- */
const LE_RECADO={conciliador:"na segunda 7h50",gerente:"na segunda 8h12",vigia:"amanhã às 9h28",financeiro:"na segunda 6h56",
  metricas:"no domingo 17h52",pauteiro:"no domingo 17h52",roteirista:"no domingo 17h52"};
const dlg=document.getElementById("conversa");let conversaId=null;
document.getElementById("cv-fechar").addEventListener("click",()=>dlg.close());
dlg.addEventListener("click",ev=>{if(ev.target===dlg)dlg.close()});
dlg.addEventListener("close",()=>{conversaId=null});
function abrirConversa(id){conversaId=id;renderConversa();if(!dlg.open)dlg.showModal()}
function renderConversa(){
  const a=AGENTS.find(x=>x.id===conversaId);if(!a)return;
  const st=estadoDe(a);
  document.getElementById("cv-nome").textContent=a.nome;
  document.getElementById("cv-cargo").textContent=a.cargo;
  const evs=eventos.filter(e=>e.agente===a.id).slice(0,5);
  const recs=ordens.filter(o=>o.agente===a.id).slice(0,6).reverse();
  const quando=LE_RECADO[a.id];
  const rascunho=document.getElementById("cv-texto")?.value||"";
  document.getElementById("cv-body").innerHTML=`
    <div><h4>Agora</h4><div class="cv-agora"><b>${st.k==="trab"?"Trabalhando":st.k==="mao"?"Precisa de você":"Esperando"}</b> · ${esc(st.txt)}</div></div>
    ${st.k==="mao"?`<div class="cv-pede">${esc(st.txt)}${st.ir?`<br><button type="button" class="btn pri" data-ir="${st.ir}">Ver e decidir</button>`:""}</div>`:""}
    <div><h4>O que ele fez por último</h4>${evs.length?`<ul class="cv-list">${evs.map(e=>`<li><time>${esc(hora(e.ts))}</time><span>${esc(e.titulo)}</span>${e.resumo?`<span class="r">${esc(e.resumo)}</span>`:""}</li>`).join("")}</ul>`:`<p class="cv-nota">Ainda sem registro.</p>`}</div>
    <div><h4>Recados</h4>${recs.length?`<ul class="cv-list">${recs.map(o=>`<li class="msg eu"><time>${esc(hora(o.ts))} · ${o.de==="gerente"?"Gerente Geral":"você"}</time><span>${esc(o.texto)}</span></li>${o.resposta?`<li class="msg ele"><time>${esc(hora(o.feito_em))} · ${esc(a.curto||a.nome)}</time><span>${esc(o.resposta)}</span></li>`:`<li class="cv-nota" style="justify-self:end">${o.status==="feito"?"Feito":"Ainda não leu"}</li>`}`).join("")}</ul>`:`<p class="cv-nota">Nenhum recado ainda.</p>`}</div>
    ${quando?`<form class="cv-form" id="cv-form"><label for="cv-texto" class="cv-nota">Mande a próxima tarefa ou um ajuste. Ele lê ${esc(quando)}.</label>
      <textarea id="cv-texto" maxlength="500" placeholder="Ex.: hoje foca em colecionáveis e ignora eletrônico abaixo de R$ 100"></textarea>
      <div class="acts"><button class="btn pri" type="submit">Mandar recado</button><button class="btn" type="button" data-ficha="1">Ver ficha</button><span class="cv-nota" id="cv-msg" role="status"></span></div></form>`
    :`<p class="cv-nota">O Avaliador de Produtos trabalha quando você manda o link de uma promo num chat do projeto Seletto. Não tem agenda: é só mandar.</p><div><button class="btn" type="button" data-ficha="1">Ver ficha</button></div>`}`;
  const t=document.getElementById("cv-texto");if(t&&rascunho)t.value=rascunho;
}
document.getElementById("cv-body").addEventListener("click",ev=>{
  const ir=ev.target.closest("[data-ir]");if(ir){dlg.close();const s=document.getElementById(ir.dataset.ir);if(s&&!s.hidden)s.scrollIntoView({behavior:reduce.matches?"auto":"smooth"});return}
  if(ev.target.closest("[data-ficha]")){const id=conversaId;dlg.close();abrirFicha(id)}
});
document.getElementById("cv-body").addEventListener("submit",async ev=>{
  ev.preventDefault();const t=document.getElementById("cv-texto"),msg=document.getElementById("cv-msg"),b=ev.target.querySelector("button[type=submit]");
  const texto=t.value.trim();if(!texto){t.focus();return}
  if(!dbRef){msg.textContent="Abra o painel no claude.ai, logado, pra mandar recado.";return}
  b.disabled=true;msg.textContent="Mandando…";
  const ts=new Date().toISOString();
  try{await dbRef.collection("ordens").doc(conversaId+"-"+ts.replace(/\D/g,"").slice(0,14)).set({agente:conversaId,texto,ts,status:"pendente",de:"painel"});
    t.value="";msg.textContent="Recado entregue na mesa dele."}
  catch(e){msg.textContent="Não salvou, tente de novo."}
  finally{b.disabled=false}
});
function renderTags(){
  room.querySelectorAll(".tag").forEach(n=>n.remove());
  AGENTS.forEach(a=>{
    const st=estadoDe(a);tagsDe[a.id]=null;
    if(st.k==="vaga")return;
    const tag=document.createElement("button");tag.type="button";tag.className="tag "+({trab:"t-trab",mao:"t-mao"}[st.k]||"t-dorme");
    tag.setAttribute("aria-label",a.nome+": "+st.txt+". Abrir conversa");tag.title=st.txt;
    tag.innerHTML=`<span class="pt"></span><b><span class="nl">${esc(a.nome)}</span><span class="nc">${esc(a.curto||a.nome)}</span></b>`+(st.k!=="ocioso"?`<span class="tarefa">${esc(curto(st.txt,28))}</span>`:"");
    tag.addEventListener("click",()=>abrirConversa(a.id));
    room.appendChild(tag);
    tagsDe[a.id]={tag,k:st.k};
  });
  tagsProntas=true;posicionarTags();
  const trab=AGENTS.filter(a=>estadoDe(a).k==="trab"),dorme=AGENTS.filter(a=>estadoDe(a).k==="ocioso"),mao=AGENTS.filter(a=>estadoDe(a).k==="mao");
  const q=document.getElementById("quem");
  q.innerHTML=(mao.length?`<span><b>Precisa de você</b>${mao.map(a=>`<button type="button" data-id="${a.id}">${esc(a.nome)}</button>: ${esc(curto(estadoDe(a).txt,48))}`).join(" · ")}</span>`:"")
    +(trab.length?`<span><b>Na mesa</b>${trab.map(a=>`<button type="button" data-id="${a.id}">${esc(a.nome)}</button>: ${esc(curto(estadoDe(a).txt,48))}`).join(" · ")}</span>`:"")
    +(dorme.length?`<span><b>Dormindo</b>${dorme.map(a=>`<button type="button" data-id="${a.id}">${esc(a.nome)}</button>`).join(", ")}</span>`:"");
  q.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>abrirConversa(b.dataset.id)));
}
function posicionarTags(){
  const RW=room.clientWidth;
  AGENTS.forEach(a=>{const t=tagsDe[a.id];if(!t)return;
    let x,y;
    if(t.k==="mao"){const p=pontoMao(a);x=p.x;y=p.y-27}
    else if(t.k==="trab"&&!indo[a.id]){x=a.x;y=a.y-23}else{const w=walker(a);x=w.x;y=w.y-19}
    const half=(t.w||(t.w=t.tag.offsetWidth))/2/RW*100;
    t.tag.style.left=Math.min(100-half-0.5,Math.max(half+0.5,x/W*100))+"%";t.tag.style.top=(y/H*100)+"%"});
}
addEventListener("resize",()=>{Object.values(tagsDe).forEach(t=>{if(t)t.w=0})});

/* ---------- Fichas ---------- */
function renderCards(){
  document.getElementById("cards").innerHTML=AGENTS.map(a=>{
    const st=estadoDe(a);
    return `<details class="card s-${a.status}" id="card-${a.id}"><summary><div><h3>${esc(a.nome)}</h3><p class="role">${esc(a.cargo)}</p></div><span class="badge"><span class="dot"></span>${st.k==="trab"?"Trabalhando":STATUS[a.status]}</span></summary>
    <div class="sheet"><section><h4>Ficha</h4><dl class="kv"><dt>Quando</dt><dd>${esc(a.quando)}</dd><dt>Onde</dt><dd>${esc(a.onde)}</dd><dt>Autonomia</dt><dd>${esc(a.autonomia)}</dd></dl></section>
    <section><h4>Como trabalha</h4><ol>${a.como.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></section>
    <section><h4>Regras</h4><ul>${a.regras.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section></div></details>`}).join("");
}

/* ---------- Feed ---------- */
const NOME_OF={garimpeiro:"Garimpeiro de Achados",conciliador:"Conciliador de Vendas",gerente:"Gerente Geral",avaliador:"Avaliador de Produtos",buscador:"Buscador de Produtos",financeiro:"Relatório Financeiro",vigia:"Vigia de Anúncios",metricas:"Analista do Instagram",pauteiro:"Planejador de Conteúdo",roteirista:"Roteirista de Reels"};
const VLABEL={achados:["ok","Achados"],semana:["info","Semana"],conciliacao:["info","Vendas"],decisao:["info","Decisão"],pauta:["info","Pauta"],metricas:["info","Métricas"],preco:["pend","Preço"],recompra:["ok","Recompra"],aprovado:["ok","Aprovado"],reprovado:["no","Reprovado"],bug:["bug","Bug de preço"],pendente:["pend","Pendente"],info:["info","Rodada"]};
function hora(iso){const d=new Date(iso);return isNaN(d)?"":d.toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}).replace(",","")}
function linkSeguro(u){try{const x=new URL(u);return x.protocol==="https:"?x.href:null}catch(e){return null}}
function renderFeed(){
  const feed=document.getElementById("feed");
  if(!eventos.length){feed.innerHTML=`<li><p class="empty">Nenhum registro ainda. Cada proposta do Vigia, relatório do Financeiro e pauta do Time Musko aparece aqui.</p></li>`;return}
  feed.innerHTML=eventos.slice(0,15).map(e=>{const [cls,lab]=VLABEL[e.veredito]||VLABEL.info;const l=e.link&&linkSeguro(e.link);
    return `<li><time>${esc(hora(e.ts))}</time><div style="min-width:0"><span class="who-l">${esc(NOME_OF[e.agente]||e.agente)}</span><span class="v ${cls}">${lab}</span><div class="t">${esc(e.titulo)}</div>${e.resumo?`<div class="r">${esc(e.resumo)}</div>`:""}${l?`<a href="${esc(l)}" target="_blank" rel="noopener">Comprar</a>`:""}</div></li>`}).join("");
}
let pautaDoc=null;
function lista(arr,tag="ul"){return Array.isArray(arr)&&arr.length?`<${tag}>${arr.map(x=>`<li>${esc(x)}</li>`).join("")}</${tag}>`:""}
let relatDoc=null;
function bloco(t,arr,ol){return Array.isArray(arr)&&arr.length?`<div><h4>${t}</h4>${lista(arr,ol?"ol":"ul")}</div>`:""}
function renderRelat(){
  const box=document.getElementById("relat");const r=relatDoc;if(!r){box.hidden=true;return}
  box.hidden=false;
  document.getElementById("relat-sub").textContent=[r.semana?"Semana "+r.semana:"",r.resumo||""].filter(Boolean).join(" · ");
  const proj=(nome,p,cor)=>p?`<details style="border-left-color:${cor}"><summary><span class="meta">${nome}</span><span class="tit">${esc(p.titulo||"")}</span></summary><div class="corpo">
      ${bloco("O que rendeu",p.rendeu)}${bloco("O que está acontecendo",p.observacoes)}${bloco("Melhorias pra próxima semana",p.melhorias)}</div></details>`:"";
  document.getElementById("relat-itens").innerHTML=
    (Array.isArray(r.acoes)&&r.acoes.length?`<details open style="border-left-color:var(--accent)"><summary><span class="meta">Onde pôr tempo e dinheiro</span><span class="tit">As 3 ações da semana</span></summary><div class="corpo">${lista(r.acoes,"ol")}</div></details>`:"")
    +((r.travado&&r.travado.length)||(r.alertas&&r.alertas.length)?`<details open style="border-left-color:#f2b200"><summary><span class="meta">Precisa de você</span><span class="tit">Travado e alertas</span></summary><div class="corpo">${bloco("Esperando você",r.travado)}${bloco("Agentes com problema",r.alertas)}</div></details>`:"")
    +proj("Seletto Company",r.seletto,"var(--accent)")+proj("Musko Importa",r.musko,"var(--spec)")
    +(Array.isArray(r.ordens)&&r.ordens.length?`<details><summary><span class="meta">Orquestração</span><span class="tit">Foco que o Gerente deu a cada agente</span></summary><div class="corpo">${lista(r.ordens)}</div></details>`:"");
}
function renderPauta(){
  const box=document.getElementById("pauta");if(!pautaDoc||!Array.isArray(pautaDoc.itens)){box.hidden=true;return}
  box.hidden=false;const m=pautaDoc.metricas||{};
  const c=pautaDoc.cssbuy||{};
  document.getElementById("pauta-sub").textContent=[pautaDoc.semana?"Semana "+pautaDoc.semana:"",m.resumo||"",c.ativos!=null?`CSSBuy: ${c.ativos} ativos no mês${c.meta?" (meta "+c.meta+")":""}`:""].filter(Boolean).join(" · ");
  document.getElementById("pauta-itens").innerHTML=pautaDoc.itens.map((it,i)=>`<details${i===0?" open":""}><summary>
      <span class="meta">${esc(it.tipo==="carrossel"?"Carrossel":"Vídeo")}${it.dia?" · gravar "+esc(it.dia):""}${it.duracao?" · "+esc(it.duracao):""}</span>
      <span class="tit">${esc(it.titulo)}</span>${it.por_que?`<span class="why">${esc(it.por_que)}</span>`:""}</summary>
    <div class="corpo">
      ${it.gancho?`<div><h4>Gancho</h4><div class="gancho">${esc(it.gancho)}</div>${it.ganchos_alt&&it.ganchos_alt.length?`<div class="why" style="margin-top:4px">Outras opções: ${it.ganchos_alt.map(esc).join(" · ")}</div>`:""}</div>`:""}
      ${it.roteiro&&it.roteiro.length?`<div><h4>${it.tipo==="carrossel"?"Cards":"Roteiro"}</h4>${lista(it.roteiro,"ol")}</div>`:""}
      ${it.texto_tela&&it.texto_tela.length?`<div><h4>Texto na tela</h4>${lista(it.texto_tela)}</div>`:""}
      ${it.cta?`<div><h4>Chamada final</h4>${esc(it.cta)}</div>`:""}
      ${it.legenda?`<div><h4>Legenda</h4><pre>${esc(it.legenda)}${it.hashtags?"\n\n"+esc(it.hashtags):""}</pre></div><button type="button" class="copiar" data-i="${i}">Copiar legenda</button>`:""}
    </div></details>`).join("")
  +(Array.isArray(pautaDoc.stories)&&pautaDoc.stories.length?`<details><summary><span class="meta">Stories · todo dia</span><span class="tit">Ideias de stories da semana</span></summary><div class="corpo">${lista(pautaDoc.stories)}</div></details>`:"")
  +(Array.isArray(pautaDoc.auditoria)&&pautaDoc.auditoria.length?`<details><summary><span class="meta">Perfil · revisão do mês</span><span class="tit">O que ajustar no perfil</span></summary><div class="corpo">${lista(pautaDoc.auditoria)}</div></details>`:"");
}
document.getElementById("pauta-itens").addEventListener("click",async ev=>{const b=ev.target.closest(".copiar");if(!b)return;const it=pautaDoc.itens[+b.dataset.i];
  try{await navigator.clipboard.writeText(it.legenda+(it.hashtags?"\n\n"+it.hashtags:""));b.textContent="Copiada"}catch(e){b.textContent="Não deu pra copiar"}});
var dbRef=null,mcpRef=null;
const HUNTER="Hunter HUB";
const brl=n=>Number(n).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const STATUS_TXT={aplicando:"Aplicando no Mercado Livre…",aplicado:"Aplicado no Mercado Livre.",aprovado:"Aprovado. O Hunter não respondeu: o Vigia aplica pelo site do Mercado Livre na próxima rodada (até 1h).",
  falhou:"Não aplicou.",verificar:"A resposta do Hunter não voltou. O Vigia confere o preço no Mercado Livre e, se não mudou, aplica por lá.",recusado:"Recusado."};
function renderProps(){
  const agora=Date.now(),H12=12*3600e3;
  const vivas=propostas.filter(p=>p.status==="pendente"?(!p.expira_em||new Date(p.expira_em)>agora)
    :["aplicando","aplicado","aprovado","falhou","verificar"].includes(p.status)&&agora-new Date(p.decidido_em||p.ts)<H12);
  const box=document.getElementById("aprov");box.hidden=!vivas.length;
  document.getElementById("props").innerHTML=vivas.map(p=>{const l=p.link&&linkSeguro(p.link);const seta=p.tipo==="subir"?"▲":"▼";
    const acts=p.status==="pendente"
      ?`<button class="yes" data-d="aprovado">Sim, aplicar agora</button><button data-d="recusado">Não</button>`
      :`<span class="r">${esc(STATUS_TXT[p.status]||p.status)}${p.erro?" "+esc(p.erro):""}</span>`;
    return `<li class="prop" data-id="${esc(p.id)}"><span class="who-l">Vigia de Anúncios · ${p.tipo==="subir"?"subir preço":"baixar preço"}${p.status==="pendente"?" · vence "+esc(hora(p.expira_em)):""}</span>
    <div class="t">${esc(p.produto)}</div>
    <div class="nums">${brl(p.preco_atual)} → ${brl(p.preco_novo)} ${seta} | ROI ${esc(String(p.roi_novo))}% | lucro ${brl(p.lucro_novo)}/un</div>
    ${p.motivo?`<div class="r">${esc(p.motivo)}</div>`:""}
    ${l?`<a href="${esc(l)}" target="_blank" rel="noopener">Ver anúncio</a>`:""}
    <div class="acts">${acts}</div></li>`}).join("");
}
const marcar=(id,dados)=>dbRef.collection("propostas").doc(id).update(dados);
const msgErro=e=>String(e&&e.message||"erro desconhecido").slice(0,240);
async function aplicarAgora(p){
  const agora=new Date().toISOString();
  await marcar(p.id,{status:"aplicando",decidido_em:agora});
  if(!mcpRef){await marcar(p.id,{status:"aprovado"});return}   // sem conector aqui: o Vigia aplica na rodada
  if(new Date(p.expira_em)<new Date()){await marcar(p.id,{status:"falhou",erro:"A proposta venceu. Espere a próxima varredura."});return}
  const input={listingId:p.listingId,targetPrice:Number(p.preco_novo)};if(p.variationId)input.variationId=p.variationId;
  try{await mcpRef.callTool(HUNTER,"update_listing_price",input,{cache:false})}            // teste, não muda nada
  catch(e){
    if(["needs_reauth","server_not_connected","not_in_manifest","approval_required","not_granted","capability_disabled","selection_required","upstream_error","server_unavailable"].includes(e.code)){
      await marcar(p.id,{status:"aprovado",erro:""});return}                               // o teste não aplicou nada: o Vigia tenta na rodada
    if(/permiss/i.test(msgErro(e))){await marcar(p.id,{status:"aprovado",via:"mercadolivre",erro:"Hunter sem permissão: o Vigia aplica pelo site do ML"});return}
    await marcar(p.id,{status:"falhou",erro:msgErro(e)});return}
  try{const r=await mcpRef.callTool(HUNTER,"update_listing_price",{...input,confirm:true},{cache:false});
    await marcar(p.id,{status:"aplicado",aplicado_em:new Date().toISOString(),por:"painel",erro:""});
    try{await dbRef.collection("eventos").doc("vigia-painel-"+p.id).set({agente:"vigia",ts:new Date().toISOString(),veredito:"preco",
      titulo:p.produto+": "+brl(p.preco_atual)+" → "+brl(p.preco_novo),resumo:"Aplicado pelo painel, com o seu sim. ROI "+p.roi_novo+"%",link:p.link||""})}catch(_){}}
  catch(e){
    if(e.code==="tool_error"&&/permiss/i.test(msgErro(e))){await marcar(p.id,{status:"aprovado",via:"mercadolivre",erro:"Hunter sem permissão: o Vigia aplica pelo site do ML"})}
    else if(e.code==="tool_error"){await marcar(p.id,{status:"falhou",erro:msgErro(e)})}
    else{await marcar(p.id,{status:"verificar",erro:msgErro(e)})}                           // resultado incerto: nunca repetir sozinho
  }
}
document.getElementById("props").addEventListener("click",async ev=>{
  const b=ev.target.closest("button[data-d]");if(!b||!dbRef)return;
  const li=b.closest(".prop");const p=propostas.find(x=>x.id===li.dataset.id);if(!p||p.status!=="pendente")return;
  li.querySelectorAll("button").forEach(x=>x.disabled=true);
  try{
    if(b.dataset.d==="recusado")await marcar(p.id,{status:"recusado",decidido_em:new Date().toISOString()});
    else await aplicarAgora(p);
  }catch(e){li.querySelectorAll("button").forEach(x=>x.disabled=false);li.querySelector(".acts").insertAdjacentHTML("beforeend",`<span class="r">Não salvou, tente de novo.</span>`)}
});
function renderStats(){
  const trab=AGENTS.filter(a=>estadoDe(a).k==="trab").length, contr=AGENTS.filter(contratado).length;
  const hoje=new Date().toDateString();
  const n=eventos.filter(e=>e.agente==="avaliador"&&new Date(e.ts).toDateString()===hoje).length+eventos.filter(e=>e.agente==="buscador"&&new Date(e.ts).toDateString()===hoje).reduce((s,e)=>s+(Number(e.avaliados)||0),0);
  document.getElementById("stats").innerHTML=`<span class="chip st-trab"><span class="dot"></span>${trab} trabalhando</span><span class="chip st-ocioso"><span class="dot"></span>${contr} contratados</span><span class="chip">${n} avaliados hoje</span>`;
}
function renderAll(){renderTags();renderCards();renderFeed();renderStats()}
document.getElementById("timeline").innerHTML=TIMELINE.map(([t,x])=>`<li><time>${t}</time><span>${esc(x)}</span></li>`).join("");
renderAll();
setInterval(()=>{renderTags();renderStats()},60000);

/* ---------- Fonte de dados ----------
   No claude.ai: banco real do Artifact (window.claude.use("db")) + conector MCP do Hunter HUB.
   Fora dele (GitHub Pages / arquivo local): DemoStore, banco em memória com dados fictícios. */
(async()=>{
  let real=null;try{real=await window.claude?.use?.("db")}catch(e){real=null}
  const modoDemo=!real;
  const db=real||(window.DemoStore&&window.DemoStore.create());
  if(!db){document.getElementById("feed").innerHTML=`<li><p class="empty">Os registros ao vivo só abrem com o painel aberto no claude.ai, logado.</p></li>`;return}
  if(modoDemo){const b=document.getElementById("demo");if(b)b.hidden=false}
  db.collection("estado").onSnapshot(s=>{estados={};s.docs.forEach(d=>estados[d.id]=d.data());renderTags();renderStats();if(conversaId)renderConversa();
      document.querySelectorAll("details.card").forEach(d=>{const a=AGENTS.find(x=>"card-"+x.id===d.id);const b=d.querySelector(".badge");if(a&&b)b.lastChild.textContent=estadoDe(a).k==="trab"?"Trabalhando":STATUS[a.status]})},()=>{});
  dbRef=db;
  db.collection("relatorios").orderBy("ts","desc").limit(1).onSnapshot(s=>{relatDoc=s.docs.length?s.docs[0].data():null;renderRelat()},()=>{});
  db.collection("pautas").orderBy("ts","desc").limit(1).onSnapshot(s=>{pautaDoc=s.docs.length?s.docs[0].data():null;renderPauta()},()=>{});
  db.collection("propostas").orderBy("ts","desc").limit(40).onSnapshot(s=>{propostas=s.docs.map(d=>({id:d.id,...d.data()}));renderProps();renderTags();if(conversaId)renderConversa()},()=>{});
  db.collection("ordens").orderBy("ts","desc").limit(60).onSnapshot(s=>{ordens=s.docs.map(d=>({id:d.id,...d.data()}));if(conversaId)renderConversa()},()=>{});
  if(modoDemo)mcpRef=window.DemoStore.mcp;else window.claude.use("mcp").then(m=>{mcpRef=m}).catch(()=>{});
  db.collection("eventos").orderBy("ts","desc").limit(100).onSnapshot(s=>{eventos=s.docs.map(d=>d.data());renderFeed();renderStats();if(conversaId)renderConversa()},
    ()=>{document.getElementById("feed").innerHTML=`<li><p class="empty">A conexão com os registros caiu. Recarregue a página.</p></li>`});
})();
