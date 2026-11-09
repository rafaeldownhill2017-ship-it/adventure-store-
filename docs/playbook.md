# Playbook: Reels 3D "como funciona"

Destilado de uma série de 20+ vídeos produzidos com este método (formato 9:16, 50–80 s). Tudo aqui é **observação de prática**, não garantia de resultado: alcance depende de perfil, tema, horário e sorte. Acrescente suas lições ao final de cada entrega.

## 1. O que sustenta o formato
| Princípio | Na prática |
|---|---|
| **Gancho visual em 0–3 s** | Um objeto, uma ação e um número na tela, sem título. Ex.: balança, algo caindo no prato, etiqueta "17 KG/DIA". |
| **Mundo contínuo** | Um cenário só; a câmera voa entre "estações". Corta a sensação de "slideshow". |
| **Uma camada de texto falado** | Legenda grande, uma palavra por vez, centro da tela. Nada de placar + frase + cartões + karaokê ao mesmo tempo. |
| **Número vira coisa** | Valores são etiquetas presas a objetos 3D, não parágrafos. Preço vira altura de pilha; tempo vira ampulheta. |
| **Personagem com emoção** | Alguém com dinheiro ou reputação em jogo; animações simples (idle, walk, emote-yes/no) já bastam. |
| **Virada** | Ironia ("Parabéns:") ou transformação que reorganiza o que o espectador achava. |
| **CTA que vira DM** | "Mande este vídeo para [pessoa específica]". Envios por mensagem são sinal forte de distribuição para quem não segue (comentário público de dirigente do Instagram; trate como pista, não regra). |
| **Capa padrão** | Manchete grande e igual em todos os vídeos da série ("Como funciona ___."). A grade do perfil vira uma coleção. |
| **Frequência** | Séries com vários vídeos na semana ensinam o algoritmo e o público. Qualidade baixa em volume alto não funciona. |

## 2. Fórmula do roteiro (60–75 s)
1. **0–3 s:** algo visceral ou absurdo, com objeto e número.
2. **3–15 s:** problema com personagem.
3. **15–55 s:** jornada física em 3–4 estações; etiquetas pequenas nos objetos.
4. **55–70 s:** virada ou transformação.
5. **Final:** CTA de envio + pergunta de comentário. Uma pergunta também no meio quando couber.

Estruturas que funcionaram para temas diferentes:
- **Comparação com fonte dos dois lados** → surpresa → virada que dá um round para cada lado.
- **Mito → dado → mecanismo → virada** (derrubar uma crença com fonte e mostrar o mecanismo real).
- **Resposta antecipada ao hater**: mostre um card de comentário genérico ("mas e a ___?") e responda dentro do vídeo.
- **Suspense** ("será que empata?") com pausa sonora antes da resposta.
- **Série de até 3 partes** com cliffhanger de pergunta e selo fixo "PARTE n/3".
- **Vídeo ligado a um campeão:** um vídeo que viraliza puxa os episódios amarrados a ele; ligue o novo ao melhor que você já tem.

## 3. Medidas e dados
- Voz ≈ 14 caracteres por segundo. 900 caracteres ≈ 64 s.
- Retenção costuma cair em blocos de explicação seca; encurte o bloco mais técnico.
- Tema de massa + número grande no primeiro segundo supera tema de nicho sem mito nem personagem (observação de comparação entre vídeos, não experimento controlado).
- Contraste pequeno (2–3 pontos percentuais) não rende vídeo. Teste: a diferença é de vezes ou de valores que impressionam?
- Notícia quente: compare com um caso equivalente e meça o tempo (horas × dias). Reconfira todos os fatos no dia da voz.

## 4. Técnica (Remotion + React Three Fiber)
- `ThreeCanvas` (@remotion/three) envolve a cena em Suspense com `delayRender`; `useGLTF(staticFile(...))` é seguro no render.
- **Personagens animados:** clone com `SkeletonUtils.clone`; animação por `mixer.setTime(t)` a cada quadro (nunca por delta). Isso torna o render determinístico.
- **Kits de modelos** com textura externa precisam da pasta `Textures/` ao lado dos `.glb`.
- **Escala inconsistente entre kits:** normalize pela caixa envolvente (`alvo: {altura | comp | largura}`).
- **Quadro vertical:** meia-largura visível ≈ 0,16 × distância (fov ≈ 32). Para 3 m de largura, câmera a ~9 m.
- **Gramado do `StageMundo`** vai de −100 a 100 em X; estação fora disso fica sem chão. Use Z negativo para mais estações.
- **Pós-processamento:** oclusão ambiente (N8AO), tilt-shift leve ("miniatura"), bloom sutil, vinheta. Cena de fogo/noite pede luz baixa e bloom contido; luz forte demais estoura em laranja.
- **Efeitos 2D sobre 3D:** `mixBlendMode` no `AbsoluteFill` só sobre o mundo, antes dos rótulos, para não tingir texto.
- **Texto largo em carimbo/animação de escala:** limite a escala inicial pela largura (`960 / largura`), senão sai do quadro no primeiro quadro.
- **Emoji e bandeira** em texto não renderizam no Chromium do render.

## 5. Regras de enquadramento (revisão obrigatória)
Nada com texto pode aparecer cortado na borda: balões, letreiros, rótulos, CTA. Personagens e máquinas principais também não.
- Rótulos vivem no 3D e são desenhados na tela (`TelaSegura`): margem segura de 56 px, fora da faixa da legenda (y 1215–1420), sem sobreposição, escondidos se o ponto 3D sai do quadro.
- Letreiros 3D: inteiros ou fora do quadro. Panorâmica que varre letreiro vira corte seco.
- O primeiro segundo de cada estação nunca é vazio: objetos entram antes da palavra que os nomeia.
- Objeto que existe em outra estação só aparece depois do corte (antes ele vira "meio visível" na borda).
- **Problemas recorrentes e a correção:**
  - Plano fechado com letreiro ao fundo cortado → câmera alta (~30–40°) ou ângulo de lado; calcule para onde o raio superior bate na profundidade do letreiro.
  - Personagem ao lado do objeto principal meio fora → abra o plano e posicione pela separação lateral vista da câmera.
  - Fila de figurantes saindo pela borda → compacte a fila em vez de afastar a câmera.
  - Cartão de texto entrando de lado → entre com escala, no lugar; empilhe na vertical (aproveita o 9:16).
  - Objeto que gira (ampulheta a 90°) fica mais largo → calcule a largura girada.
- **Revisão:** stills nos instantes dos cortes **antes** do render; folha de contato a cada 0,5 s **depois**. As duas pegam problemas diferentes.

## 6. Voz e som
- Voz do ElevenLabs com **tempo por caractere**: cada palavra vira marca de tempo (cue) que move a cena. Trocar a voz reposiciona o filme.
- **Roteiro aprovado antes da voz** (cada geração gasta créditos). Conte caracteres antes.
- Fluxo barato: monte com tempos estimados; depois da voz real, **revise de novo** (os cortes mudam).
- Trilha e efeitos **sintetizados por código** (`scripts/lib/sintese.mjs`): sem direitos autorais, mesma saída a cada execução. Voz ~12 dB acima da música durante a fala (ducking), master em −14 LUFS e pico ≤ −1 dBTP.
- Para o suspense sem regravar: abra uma pausa no MP3 e desloque o alinhamento depois do corte.
- Se só o final do vídeo muda (ex.: versão orgânica × anúncio), regrave só o final e emende áudio e timeline.

## 7. Pesquisa e honestidade
- Número com fonte, unidade e data; senão, "estimativa" ou "ilustrativo" na tela.
- Cada dossiê termina com **não afirmar** (o que parece verdade mas não está provado).
- Fatos que mudam rápido: reconfira no dia. Já aconteceu de uma frase ("ninguém foi preso") ficar falsa antes da publicação.
- Honestidade sobre o seu lado ("o ex-sócio do dono era ___") aumenta a credibilidade.
- Moeda: cada lado na sua moeda, sem misturar câmbios, ou câmbio oficial com data.
- Ferramentas bloqueadas (403 / anti-bot): use outra fonte; não burle verificação.

## 8. Séries
- Máximo 3 partes. Cada parte supera a anterior em algo concreto ("meta de superação" escrita no dossiê).
- Parte 2 mais curta e abre já na ação, com chip de resumo.
- Fecho de série amarra com o posicionamento do negócio sem virar anúncio.
- Final que pergunta "qual história você quer na próxima?" gera a pauta da temporada seguinte.

## 9. Perfis novos (0 seguidores)
- Envios funcionam melhor que comentários no começo; faltam motivos para seguir e comentar → pergunta falada no meio e promessa de continuação ("Parte 2 amanhã").
- Vídeos de 50–60 s; série numerada; bloco técnico mais curto.

## 10. Como registrar lições
Ao fim de cada vídeo, acrescente aqui 3 linhas: o que quebrou, como corrigiu, o que mediria no desempenho. É isso que faz o próximo sair melhor.

## Lições · Caso Master, Partes 1 e 2 (nov/2026)
- **Servidor sem placa de vídeo:** `REMOTION_GL=swangle` + Chromium local funciona, mas leva ~5 s/quadro. Use `QUALIDADE=leve` (1,7× mais rápido, visual igual) e `scripts/render-blocos.mjs`, que retoma de onde parou se a máquina reiniciar. Antes de reiniciar um render, confira com `ps` que não sobrou processo antigo disputando a CPU.
- **Cues de palavras repetidas** ("até", "quarenta", "mil", "conta") pegaram a ocorrência errada. Rode `timeline:estimada` e confira os tempos antes de montar a cena.
- **Retenção:** pergunta em aberto no gancho ("no final você vai descobrir quem pagou"), pergunta direta no meio ("você conhece alguém?"), sussurro na revelação e cliffhanger para a próxima parte. Medir: retenção aos 3 s e aos 30 s, envios por alcance.
- **Primeiro segundo de cada estação:** a pilha do FGC abria vazia. Comece com parte do objeto visível e deixe crescer.
