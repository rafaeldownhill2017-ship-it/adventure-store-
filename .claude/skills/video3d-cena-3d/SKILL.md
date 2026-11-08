---
name: video3d-cena-3d
description: Monta e ajusta a cena 3D de um vídeo (câmera por keyframes, estações num mundo contínuo, personagens e modelos Kenney, rótulos presos aos objetos, peças feitas em código). Use ao criar ou editar um arquivo em projeto/src/films/ ou quando um quadro estiver cortado, vazio ou confuso.
---

# Cena 3D (Remotion + React Three Fiber)

Ponto de partida: **`projeto/src/films/Exemplo.tsx`** (leia inteiro antes de criar o seu).

## Estrutura de um filme
- **Mundo contínuo:** um único palco (`StageMundo`: céu, sol, sombras, oclusão, leve efeito miniatura). As **estações** são grupos em X = 0, 40, 80, ... (dentro do gramado, de −100 a 100; para mais de 5 estações use Z negativo). A câmera viaja entre elas.
- **Tudo derivado do tempo:** `const t = useT()` e as marcações `const {cues:c} = useTimeline()`. Nada de `useFrame` nem de animação por delta: o render precisa ser determinístico.
- **Câmera por keyframes** (`camPorKeys`): `[tempo, posição, olhar, fov]`. Mesma posição em dois keyframes = segurar; posições diferentes = voo suave. Corte seco: repita o tempo com duas posições. Ancore cada corte numa palavra: `T1 = c.caminho - 0.4`.
- **Rótulos:** `TelaSegura` recebe uma lista de `{p:[x,y,z], s: mola(...), txt, tipo?, cor}`. O ponto vem do 3D, o desenho é na tela, preso à margem segura de 56 px, fora da faixa da legenda (y 1215–1420), sem se sobrepor; se o ponto sai do quadro, o rótulo some.
- **Legenda grande:** `PalavraGrande` (uma palavra por vez) é a única camada de texto falado.
- **Mola:** `const mola = useMola(); mola(c.palavra - 0.3, 220, 13)` dá entrada com leve sobra.
- **Flash** nos cortes, **Grain** sutil, **Fecho** no final.

## Modelos
- Kenney CC0 em `public/models/<kit>/<arquivo>.glb`: `personagens` (animações: `idle`, `walk`, `sit`, `jump`, `emote-yes`, `emote-no`, `interact-right`, `attack-melee-right`), `moveis`, `comercial`, `suburbio`, `carros`, `natureza`.
- `<Modelo url="moveis/desk" alvo={{ altura | comp | largura }} />` **normaliza o tamanho** pela caixa envolvente (os kits têm escalas diferentes). `<Boneco ... anim tAnim />` anima por tempo (`mixer.setTime`), nunca por delta.
- Kits com textura externa (`Textures/colormap.png`) precisam da pasta `Textures` ao lado dos `.glb` (já incluída).
- Falta uma peça? Monte com caixas e cilindros (`<B s p cor/>`). Peças simples bem proporcionadas ficam melhores que modelos baixados sem licença clara.
- Escala sugerida: personagem ≈ 0,56 de altura; casa/prédio 1,5–1,8.

## Regras de enquadramento (vertical 9:16, fov ≈ 32–34)
- A meia-largura visível ≈ 0,16 × distância da câmera. Para mostrar 3 m de largura, câmera a ~9 m.
- **Nada com texto pode aparecer cortado.** Letreiros 3D: inteiros ou fora do quadro; panorâmica que varre letreiro vira corte seco. Balões atrás de letreiros somem: ponha à frente.
- **O primeiro segundo de cada estação nunca é vazio:** os objetos entram **antes** da palavra que os nomeia.
- Personagem e objeto principais cabem com folga; posicione pela separação lateral **vista da câmera**, não pelo mapa.
- Câmera alta (~25–40° de inclinação) tira letreiros do fundo e deixa ver mesa e chão.
- `torusGeometry` nasce em pé; anel deitado = `rotation x = π/2`.
- Emoji e bandeira em texto não renderizam; use texto ou chip.
- Objeto que sai de uma estação para outra: esconda na janela de tempo em que a câmera não o vê.
- Não crie um material novo por quadro (quantize cores contínuas).

## Fluxo de trabalho
1. Esboce as estações e a câmera com `timeline:estimada`.
2. `npm run stills -- <id> t1,t2,...` nos instantes de cada corte e no meio de cada estação. Olhe cada imagem.
3. Corrija **todos** os problemas numa rodada e só então renderize o vídeo inteiro.
4. Rode `npm run check` (tipos) antes do render.
