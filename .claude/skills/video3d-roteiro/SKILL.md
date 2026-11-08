---
name: video3d-roteiro
description: Escreve o roteiro falado (60–75 s, ~900 caracteres, português do Brasil) no formato "como funciona", com o plano de cenas, o CTA e a legenda do post. Use depois do dossiê, antes de gerar a voz.
---

# Roteiro

## Fórmula "como funciona" (adapte, não decore)
1. **0–3 s · Gancho:** coisa acontecendo + número. Nada de "Você sabia que...". Ex.: "Uma clínica paga cinco mil reais de anúncio. O telefone toca. E ninguém atende."
2. **3–15 s · Problema com personagem:** alguém com dinheiro, tempo ou reputação em jogo.
3. **15–55 s · Jornada física em 3 a 4 estações:** cada estação é um lugar onde o problema acontece; cada frase aponta para um objeto que aparece. Número entra como etiqueta no objeto.
4. **Virada (55–70 s):** ironia ("Parabéns: você pagou a propaganda do concorrente") ou transformação surpreendente.
5. **Solução curta** (1 a 3 passos) sem virar propaganda do seu serviço.
6. **CTA de envio com destinatário** ("Mande este vídeo para quem ___") + **pergunta de comentário** ("qual história você quer ver?"). Se couber, uma pergunta de comentário também no MEIO.

## Como escrever para a voz
- ~14 caracteres por segundo. 60 s ≈ 840 caracteres; 75 s ≈ 1.050. Conte com `npm run narrar:simular`.
- Frases curtas, uma ideia por frase, ponto final onde a voz respira. Números por extenso quando a voz precisa dizê-los ("cinco mil reais").
- Português do Brasil falado: "tá", "olha", "só que"; sem "outrossim", sem "em um mundo onde". Sem cara de IA: nada de listas de três adjetivos, nada de "revolucionário", "inovador", "solução completa".
- Cada palavra de marcação (cue) deve aparecer **uma vez** (ou use a 2ª/3ª ocorrência na config). Repetição acidental desloca cenas.
- Sem emoji nem bandeira em texto de tela (não renderizam no Chromium do render).

## Entregável (peça aprovação)
1. **Texto da voz** (para colar em `projeto/narracao/roteiros.json`), com contagem de caracteres.
2. **Plano de cenas:** tabela tempo-alvo · estação · o que aparece · rótulos (texto exato) · palavra-gatilho (cue).
3. **Marcações** para `projeto/scripts/filmes.config.mjs`.
4. **Legenda do post:** fato + fontes + "Mande para ___" + pergunta + 3–5 hashtags.
5. **Capa:** manchete padrão da série (grande, igual em todos os vídeos) + o quadro mais estranho/curioso.
6. **Não afirmar** (do dossiê), repetido no fim para a revisão.

## Séries
Máximo 3 partes. Cada parte abre já na ação, resume em um chip ("Você já tem: ___") e termina com cliffhanger de uma pergunta. Selo fixo "PARTE n/3" no topo (`Selo`).
