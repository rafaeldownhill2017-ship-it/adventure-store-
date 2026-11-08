---
name: video3d-novo
description: Conduz a criação de um Reel 3D "como funciona" do zero até o MP4 (nicho, ideia, pesquisa, roteiro, voz, cena, trilha, render, revisão). Use quando o usuário disser que quer fazer um vídeo, começar, criar o primeiro vídeo ou pedir "um vídeo como o do exemplo".
---

# Novo vídeo 3D, do zero ao MP4

Você conduz o usuário por 8 etapas. Pare em cada **PORTÃO** e espere o "pode seguir". Não gaste voz nem renderize o vídeo completo antes dos portões 3 e 5.

## 0. Preparação (uma vez)
1. Leia `docs/playbook.md`.
2. Rode `cd projeto && npm run checar`. Se faltar algo, ajude a instalar (Node 18+, ffmpeg, `npm install`). Sem chave do ElevenLabs dá para fazer tudo com voz **estimada** (vídeo mudo de teste); a voz real é o último passo.
3. Se `projeto/src/brand.ts` ainda tem "Sua Marca", use a skill `video3d-marca`.

## 1. Briefing (pergunte em UMA mensagem curta)
- Nicho e cidade/região do público (ex.: dentista em Curitiba).
- Quem assiste (paciente, cliente, outros profissionais?) e o que essa pessoa quer.
- Objetivo do perfil: alcance, autoridade ou captação? (alcance vem primeiro; captação depende de oferta e canal.)
- Idioma (padrão: português do Brasil) e se há voz preferida.
- Tem alguma regra do conselho profissional ou da empresa sobre o que pode ser dito?

## 2. Ideia (skill `video3d-ideia`)
Entregue 5 temas com gancho de 1 frase, o "número de choque" e a estação física de cada um. Recomende 1. **PORTÃO 1:** o usuário escolhe.

## 3. Pesquisa e dossiê (skill `video3d-pesquisa`)
Dados com fonte e data, e a lista "não afirmar". **PORTÃO 2:** o usuário confirma os fatos.

## 4. Roteiro (skill `video3d-roteiro`)
Roteiro de 60–75 s (~900 caracteres), cenas por estação, legenda do post. **PORTÃO 3:** o usuário aprova o texto. Só depois disso a voz pode ser gerada.

## 5. Voz e marcações (skill `video3d-producao`)
`npm run narrar:simular` mostra o custo. Com "pode seguir", `npm run narrar -- --filme=<id>` e `npm run timeline`. Sem chave: `npm run timeline:estimada -- <id>`.

## 6. Cena 3D (skill `video3d-cena-3d`)
Copie `films/Exemplo.tsx`, monte as estações e a câmera por keyframes ancorados nas marcações. Gere stills nos cortes (`npm run stills`) e corrija antes de renderizar.

## 7. Trilha, render e revisão (skills `video3d-producao` e `video3d-revisao`)
`npm run trilha -- <id>`, `npm run render -- <id>`, `npm run folha -- <id>`. Revise a cada 0,5 s. **PORTÃO 4:** mostre o MP4 e a folha; o usuário aprova ou pede ajustes (junte todas as correções numa rodada só).

## 8. Entrega
MP4 em `projeto/entrega/`, capa (o quadro mais interessante, nunca o fecho), legenda com fontes, e 3 linhas de lições para `docs/playbook.md`.

## Princípios
- O gancho é uma coisa acontecendo com um número, não um título.
- Texto na tela: uma palavra grande por vez; números viram etiquetas presas aos objetos.
- Nada cortado na borda. Nenhum fato sem fonte.
