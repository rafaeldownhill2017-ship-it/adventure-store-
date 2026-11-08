---
name: video3d-marca
description: Aplica a identidade visual do usuário (nome, cores, fonte, frase do fecho) ao projeto de vídeo 3D. Use na primeira vez, quando brand.ts ainda estiver com os valores de exemplo, ou quando o usuário trocar de marca ou cliente.
---

# Identidade da marca nos vídeos

Tudo que muda de uma marca para outra está em **`projeto/src/brand.ts`** e no componente `Fecho` (`projeto/src/lib/ui.tsx`).

## O que pedir ao usuário
1. Nome da marca (como aparece no fecho) e a frase de uma linha.
2. Cor principal, cor de destaque (palavras-chave na legenda), cor de fundo claro e cor de texto escuro (hex). Se ele só tiver o logo, tire as cores do arquivo e proponha.
3. Chamada do fecho (ex.: "Siga para ver o próximo", "Agende pelo link da bio").
4. Fonte da marca, se houver. Padrão: Manrope (já incluída). Fonte nova: coloque o `.woff2` em `projeto/public/fonts/`, registre em `src/lib/fonts.tsx` e use `FONT` em `brand.ts`. Confira a licença da fonte.
5. Logo (opcional): para entrar no fecho, ponha o arquivo em `public/` e use `<Img src={staticFile("logo.png")}/>` dentro de `Fecho`.

## Regras
- Mantenha o **mundo 3D claro e colorido** (céu, grama, madeira). A identidade da marca aparece na legenda de destaque, nos rótulos e no fecho. Não escureça o mundo para "parecer premium": o formato viral depende de leitura rápida.
- A cor de destaque precisa ter contraste com o contorno escuro da legenda grande.
- Depois de mudar, renderize 3 stills (gancho, meio, fecho) e mostre ao usuário.
