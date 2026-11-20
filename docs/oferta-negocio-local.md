# Oferta · Vídeo de vendas 3D para negócio local
Versão de 20/11/2026. Preços e prazos são **sugestões**: quem decide é o dono do Peso no Bolso / Estúdio Miniatura.

## O mercado (o que já existe)
- O ludificando.com vende "vídeo de vendas em alguns minutos": 9 estilos (desenho 2D), **a partir de R$ 69**, entregue no WhatsApp (print de 20/11/2026).
- **A nossa diferença:** 3D miniatura (produto girando no pedestal, montagem em camadas, mundo de cor por bloco). É o mesmo visual dos Reels que estão viralizando, e quase ninguém entrega isso para comércio de bairro.

## O produto
Vídeo vertical de 18 s (1080×1920), feito para funcionar **no mudo**: status do WhatsApp, Reels, Stories e anúncio.
1. **Gancho** com o produto se montando em 3D ("Bateu a fome?").
2. **Produto em close**, com nome e descrição.
3. **3 diferenciais** em placas ("Feito na hora", "Entrega no bairro", "Pix ou cartão").
4. **Oferta** com preço grande.
5. **Pedido:** celular com a conversa, a van de entrega chegando, "PEÇA NO WHATSAPP", o número e o horário.

Modelo no código: `projeto/src/films/Negocio.tsx` + um JSON por cliente em `projeto/src/data/negocios/`.
Amostra: `projeto/entrega/negocio-exemplo.mp4` (hamburgueria **fictícia**, com o selo "EXEMPLO FICTÍCIO").
Produtos 3D prontos: hambúrguer, pizza e café. Outros (pão, bolo, açaí, corte de cabelo…) são feitos em código sob demanda.

## Pacotes (sugestão)
| Pacote | O que leva | Preço sugerido |
|---|---|---|
| **Essencial** | 1 vídeo de 18 s, sem narração, 1 produto, 1 ajuste | R$ 97 |
| **Com voz** | o Essencial + narração (voz de IA) + versão de 9 s para status | R$ 167 |
| **Mensal** | 4 vídeos por mês (produto ou oferta da semana) | R$ 397/mês |

- **Raciocínio:** o concorrente começa em R$ 69 com desenho 2D; o 3D justifica um preço acima.
- **Conta de referência:** o Essencial a R$ 97 empata com o preço do kit Estúdio Miniatura, ou seja, um cliente paga o kit.
- **Custo de produção:**
  - o seu tempo (briefing + revisão);
  - ~15 min de render;
  - voz: ~200 a 400 créditos do ElevenLabs por vídeo com narração.

## Formulário de pedido (mandar no WhatsApp)
1. Nome do negócio (como quer que apareça) e bairro/cidade
2. Produto principal do vídeo e uma descrição curta (ex.: "pão brioche · 2 carnes · cheddar")
3. Preço e condição da oferta (ex.: "combo + fritas + refri por R$ 34,90 até 30/11")
4. 3 diferenciais **verdadeiros** (ex.: entrega própria, feito na hora, aceita Pix)
5. WhatsApp e horário de atendimento
6. Cores da marca (ou foto da fachada/cardápio para eu tirar as cores)
7. Autorização: "Autorizo o uso do nome e das informações do meu negócio neste vídeo."

## Mensagem de abordagem (comércio do bairro)
> Oi, [nome]! Faço vídeos 3D curtos pra negócio local mostrar o produto e receber pedido no WhatsApp. Fiz um exemplo de hamburgueria pra você ver como fica: [vídeo]. Faço um igual com o seu [produto], seu preço e seu número em até 48 h. Quer que eu te mande como funciona?

- Mande o vídeo de amostra na primeira mensagem: ele vende sozinho.
- 10 abordagens por semana (plano do Peso no Bolso, seção 8). Comece por quem já posta no Instagram e tem post fraco.

## Regras (sem isso, não entrega)
- **Só informação confirmada pelo cliente.** Preço, prazo, "entrega grátis", "o melhor da cidade": se o cliente não comprova, não entra. Preço errado no vídeo é problema do cliente com o Procon (CDC, art. 30: a oferta vincula).
- **Autorização por escrito** do nome, da marca e da foto.
- **Amostras fictícias sempre marcadas** como "EXEMPLO FICTÍCIO" (nunca simular cliente real que não contratou).
- **Se o vídeo for postado no seu perfil** como case, marque o cliente (collab) e, se ele pagou pela divulgação, use "#publi".
- **Nada de logotipo de terceiros** (Coca-Cola, iFood etc.) sem autorização. Usamos copo e caixa genéricos.

## Como fazer o vídeo de um cliente novo
1. Copie `projeto/src/data/negocios/exemplo-burguer.json` para `projeto/src/data/negocios/<cliente>.json`, troque os textos e ponha `"exemplo": false`.
2. Copie `projeto/src/data/negocio-exemplo.json` para `projeto/src/data/<id>.json`, com o mesmo `id` do JSON do cliente.
3. Registre no `projeto/src/Root.tsx`, numa linha igual à do `negocio-exemplo`.
4. Rode `node scripts/trilha-negocio.mjs <id>`, depois `npm run stills -- <id> 1,4.5,9,11.5,15.5` para conferir, e por fim `npm run render -- <id>`.
