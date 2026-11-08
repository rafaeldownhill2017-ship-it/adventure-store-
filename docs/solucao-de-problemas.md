# Solução de problemas

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Stills/render só mostram o céu azul e os rótulos, sem cena 3D | Versões diferentes das bibliotecas (React Three Fiber / React / Remotion) das testadas | Use o `package-lock.json` incluído: `npm ci` (não `npm update`). As versões estão fixadas em `package.json` |
| `ffmpeg` não encontrado | Não está no PATH | Instale (ffmpeg.org/download.html; no Windows, `winget install ffmpeg`) e abra um terminal novo |
| `npm run narrar` pede a chave | `.env.local` ausente ou vazio | Copie `.env.example` para `.env.local` e cole a chave. Sem chave, use `npm run timeline:estimada -- <id>` |
| ElevenLabs 401/402/403 | Chave inválida, plano sem acesso à voz, voz da biblioteca bloqueada no plano | Confira o plano; use `npm run vozes` e escolha uma voz disponível na sua conta |
| `timeline` falha: "palavra X não encontrada" | O cue não existe no texto gerado (acento, hífen, outra grafia) | Ajuste o texto ou o cue em `scripts/filmes.config.mjs`. Palavras repetidas: `["palavra", 2]` |
| Cena muda de lugar depois de trocar a voz | Esperado: a voz real tem outro ritmo | Rode `timeline` e **revise de novo** (stills + folha de 0,5 s) |
| Texto cortado na borda | Rótulo fora da margem segura ou objeto 3D de texto | Use `TelaSegura` para rótulos; para letreiros 3D, mude o ângulo da câmera (ver `video3d-cena-3d`) |
| Render muito lento ou trava | Pouca memória/CPU | Reduza `concurrency` em `scripts/render.mjs` e `remotion.config.ts` (1 ou 2); feche outros programas |
| Primeira execução baixa o "Chrome Headless Shell" (~130 MB) | Comportamento normal do Remotion | Espere; só acontece uma vez |
| Studio sem som | O mix só existe depois de `npm run trilha -- <id>` | Rode a trilha; o Studio toca `public/mix/<id>.wav` |
| Emoji/bandeira virou "BR" ou quadrado | Chromium do render não tem a fonte | Use texto ou um chip colorido |
| `Cannot find module ... src/data/<id>.json` | Falta gerar as marcações | `npm run timeline` ou `npm run timeline:estimada -- <id>` |
| Erro de tipos em `npm run check` | Registro do filme em `Root.tsx` incompleto | Confira import do JSON e do componente |
| Modelo 3D aparece sem cor | Falta a pasta `Textures/` ao lado do `.glb` | Copie a pasta do kit para o mesmo diretório |
| Áudio do MP4 sumiu | Render rodou sem `public/mix/<id>.wav` | Rode a trilha e renderize de novo |

Ainda travado? Cole o erro completo no Claude Code dentro da pasta `projeto/` e peça para diagnosticar com a skill `video3d-producao`.
