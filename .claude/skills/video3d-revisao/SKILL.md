---
name: video3d-revisao
description: Revisa o vídeo 3D antes de entregar (bordas cortadas, ritmo, áudio, fatos, nichos regulados, legenda). Use depois do render e sempre antes de dizer que o vídeo está pronto.
---

# Revisão final (nunca entregue sem passar por aqui)

## 1. Imagem
- `npm run folha -- <id>` gera folhas com 1 quadro a cada 0,5 s (8×4 = 16 s por folha). **Abra todas** procurando: texto cortado na borda, personagem ou máquina cortados, rótulo sobre a legenda, objeto aparecendo "do nada" na borda, cena vazia no começo de uma estação, texto minúsculo.
- Quadro 0: tem objeto + ação + número? A capa (quadro mais curioso) não pode ser o fecho.
- Se achar problema, liste todos, corrija juntos e rerrenderize uma vez.

## 2. Som
- `ffmpeg -i entrega/<id>.mp4 -af loudnorm=print_format=summary -f null -` → alvo ≈ −14 LUFS, pico ≤ −1 dBTP.
- A voz fica ~12 dB acima da música durante a fala? Efeitos não cobrem palavra importante?
- Sem clique no início/fim; sem corte seco de música no meio da voz.

## 3. Texto e fatos
- Cada número da tela está no dossiê com fonte e data? Número "ilustrativo" está marcado como tal?
- Conferiu a lista **"não afirmar"**? Nenhuma frase do vídeo a contradiz?
- Reconferiu o que muda rápido (preço, lei, notícia) no dia?
- Ortografia e acentos nos rótulos. Nome de marca/pessoa correto.

## 4. Nicho regulado
- Há promessa de resultado, antes/depois, preço como oferta, diagnóstico, exposição de caso real ou captação indevida? Se sim, remova ou peça ao usuário a validação do seu conselho/jurídico.
- Usa imagem ou música de terceiros? Tem licença? (O padrão deste kit não usa.)

## 5. Engajamento
- CTA de envio com destinatário específico + pergunta de comentário (de preferência uma também no meio).
- Duração: 60–75 s para conta fria. Série: selo fixo e cliffhanger.
- Legenda do post com fontes e hashtags; capa com a manchete padrão da série.

## Resultado
Responda com: ✔ aprovado / ✘ pendências numeradas (tempo do vídeo, o que está errado, como corrigir). Só diga "pronto" depois de abrir as folhas e conferir o áudio.
