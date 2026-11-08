---
name: video3d-producao
description: Executa o pipeline técnico do vídeo 3D: narração ElevenLabs com tempos, marcações (timeline), trilha sintetizada, render com Remotion e junção de áudio com ffmpeg. Use quando o roteiro estiver aprovado e for gerar voz, trilha ou o MP4, ou quando algum comando falhar.
---

# Produção (rode tudo dentro de `projeto/`)

## Ordem
| # | Comando | O que faz | Custo |
|---|---|---|---|
| 0 | `npm run checar` | confere Node, ffmpeg, dependências e chave | grátis |
| 1 | edite `narracao/roteiros.json` e `scripts/filmes.config.mjs` | texto e marcações (cues) | grátis |
| 2 | `npm run narrar:simular` | conta caracteres | grátis |
| 3 | `npm run vozes` | lista vozes da conta; escolha uma que fale pt-BR com naturalidade | grátis |
| 4 | `npm run narrar -- --filme=<id>` | gera voz + tempo de cada letra em `narracao/out/` | gasta créditos |
| 5 | `npm run timeline` | cria `src/data/<id>.json` e copia a voz para `public/voz/` | grátis |
| 5b | `npm run timeline:estimada -- <id>` | idem, **sem voz** (tempos estimados), para montar/revisar a cena antes de gastar créditos | grátis |
| 6 | `npm run dev` | abre o Studio para ver a cena | grátis |
| 7 | `npm run stills -- <id> 3,8.5,21` | quadros nos instantes dos cortes | grátis |
| 8 | `npm run trilha -- <id>` | trilha + efeitos sintetizados + voz com ducking → `public/mix/<id>.wav` (−14 LUFS) | grátis |
| 9 | `npm run render -- <id>` | renderiza o vídeo e junta o áudio → `entrega/<id>.mp4` | tempo de CPU |
| 10 | `npm run folha -- <id>` | folha de contato a cada 0,5 s para a revisão | grátis |

## Regras
- **Voz só depois do "pode seguir" no roteiro.** Cada geração gasta créditos; mexer em uma palavra exige regravar. Se só o final muda, regrave só o final.
- **Fluxo barato:** monte e revise a cena com `timeline:estimada`; a voz real é mais rápida ou mais lenta que a estimativa, então os cortes mudam. Depois da voz real, **revise de novo a cada 0,5 s**.
- Trocar a voz = `narrar` + `timeline` + `trilha` + `render`; nada na cena muda, porque tudo é ancorado em palavras.
- Os cues precisam existir no texto. Se `timeline` falhar com "palavra não encontrada", ajuste o texto ou o cue (palavras repetidas: use `["palavra", 2]`).
- Registre o `id` novo em `src/Root.tsx` (importe `src/data/<id>.json` e o componente do filme).
- Para cada vídeo novo, copie `scripts/trilha-exemplo.mjs` para `trilha-<id>.mjs`, ajuste os efeitos aos seus cues e rode `node scripts/trilha-<id>.mjs <id>`.
- ElevenLabs: use plano pago (uso comercial). Não crie várias contas gratuitas (bloqueio por atividade incomum). A chave fica só em `.env.local`.
- Render lento? Ajuste `concurrency` em `scripts/render.mjs` e em `remotion.config.ts`. No Windows o render usa `gl: "angle"`.

## Se algo falhar
Veja `docs/solucao-de-problemas.md`.
