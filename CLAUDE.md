# Kit de Vídeos 3D Virais · instruções para o Claude

Este repositório produz Reels/Shorts 3D verticais (1080×1920) no formato "como funciona", com Remotion + React Three Fiber, voz do ElevenLabs e trilha sintetizada por código. O usuário é um profissional/empresário de um nicho (odontologia, advocacia, imobiliária, estética, contabilidade, etc.) que quer vídeos de alcance orgânico para o seu perfil.

## Como começar uma conversa
Se o usuário disser "quero fazer um vídeo", "começar" ou algo parecido, use a skill **`video3d-novo`**. Ela conduz da ideia ao MP4. Nunca pule a etapa de roteiro aprovado antes de gastar voz (a voz custa créditos).

## Skills deste repositório (em `.claude/skills/`)
| Skill | Use quando |
|---|---|
| `video3d-novo` | Início de qualquer vídeo; orquestra as demais |
| `video3d-marca` | Aplicar logo, cores e fecho do usuário (`projeto/src/brand.ts`) |
| `video3d-ideia` | Escolher tema, gancho e série para o nicho |
| `video3d-pesquisa` | Levantar dados com fonte e data, e a lista "não afirmar" |
| `video3d-roteiro` | Escrever dossiê + roteiro (60–75 s) e a legenda |
| `video3d-producao` | Rodar o pipeline: voz → marcações → cena → trilha → render |
| `video3d-cena-3d` | Montar/ajustar a cena 3D (câmera, personagens, rótulos) |
| `video3d-revisao` | Revisar o MP4 antes de entregar (enquadramento, áudio, fatos) |

Leia `docs/playbook.md` antes do primeiro vídeo e acrescente lições depois de cada entrega.

## Regras que valem sempre
1. **Separe fato de hipótese.** Todo número tem fonte e data, ou aparece marcado como ilustrativo. Cada dossiê termina com "não afirmar". Não invente cliente, depoimento, resultado, preço ou estatística.
2. **Nichos regulados** (saúde, direito, finanças): não prometa resultado, não faça antes/depois, não use diagnóstico nem captação indevida de clientela. Peça ao usuário para conferir as regras de publicidade do seu conselho profissional (por exemplo CFO, CRM, OAB, CRC) e a LGPD antes de publicar. Você não substitui essa checagem.
3. **Roteiro aprovado antes da voz.** Conte os caracteres (`npm run narrar:simular`), mostre o texto ao usuário e só gere a voz com o "pode seguir".
4. **Nada cortado na borda.** Texto, rótulo, personagem e máquina principais ficam inteiros em todos os quadros. Revise com stills nos cortes e folha de contato a cada 0,5 s antes de entregar.
5. **Uma camada de texto falado** (a legenda grande, uma palavra por vez). Números viram rótulos presos a objetos 3D (`TelaSegura`).
6. **Chaves nunca no código.** A chave do ElevenLabs fica só em `projeto/.env.local` (ignorado pelo git). Nunca imprima, comite nem cole a chave em mensagens.
7. **Conteúdo de terceiros é referência, não material.** Não copie vídeo, trilha, modelo ou texto alheio. Os modelos 3D incluídos são Kenney (CC0).
8. **Idioma e tom:** português do Brasil, natural, sem cara de IA (sem "em um mundo onde", sem listas de três adjetivos). Frases curtas, voz de quem conta uma história.
9. **Séries:** no máximo 3 partes; cada vídeo precisa superar o anterior em algo concreto.

## Comandos do projeto (rode dentro de `projeto/`)
`npm install` · `npm run checar` · `npm run dev` (Studio) · `npm run vozes` · `npm run narrar:simular` · `npm run narrar -- --filme=<id>` · `npm run timeline` · `npm run timeline:estimada -- <id>` · `npm run trilha -- <id>` · `npm run stills -- <id> 5,10,15` · `npm run render -- <id>` · `npm run folha -- <id>` · `npm run check` (tipos).
