# Custos, limites e o que esperar

Valores de planos mudam; **confira a página oficial** de cada serviço antes de decidir.

## O que você precisa pagar ou ter
| Item | Necessidade | Observação |
|---|---|---|
| **Claude Code** (assinatura Claude com Claude Code ou chave de API) | Obrigatório para o fluxo guiado | Cada vídeo consome parte do limite do plano; a produção completa de um vídeo costuma custar alguns pontos percentuais da cota semanal em planos de entrada (observação de uso, varia muito). Sessões longas com muito histórico custam mais: **comece um chat novo por vídeo** |
| **ElevenLabs** (plano pago) | Para ter voz real | Uso comercial exige plano pago. Um vídeo de ~900 caracteres gasta cerca de 900–1.100 créditos por geração. Use `npm run narrar:simular` antes. Sem chave, você ainda faz o vídeo mudo/estimado para testar |
| **Node 18+** e **ffmpeg** | Obrigatório | Gratuitos |
| **Remotion** | Obrigatório | Licença gratuita para uso individual e empresas pequenas; empresas maiores precisam de licença paga (confira remotion.dev/license) |
| Computador | ≥ 8 GB de RAM; GPU não é necessária | Render de ~1 min de vídeo leva alguns minutos |

## Tempo
- Um vídeo novo, com o Claude conduzindo: de 1 a 3 horas de ida e volta (ideia → aprovação do roteiro → cena → revisão), mais o render.
- O primeiro vídeo é o mais lento (instalação, marca, aprendizado). O quinto sai muito mais rápido, porque as lições entram no `docs/playbook.md`.

## Limites honestos
- O resultado depende do **roteiro e da revisão**. A ferramenta gera cenas com modelos prontos (Kenney); cenas muito específicas (equipamento detalhado, ambiente fiel) pedem peças feitas em código ou modelos licenciados.
- Não há garantia de alcance. Os números do playbook são observações de uma série de vídeos, não promessa.
- O kit **não** substitui revisão jurídica/ética em nichos regulados.
- Voz sintética: avise o público se a regra da plataforma ou do seu conselho exigir; confira as políticas atuais de conteúdo sintético do Instagram, TikTok e YouTube.

## Dicas para gastar menos
1. Aprove roteiro e plano de cenas **antes** de gerar voz.
2. Monte e revise a cena com `timeline:estimada`; gere a voz uma vez.
3. Faça stills nos cortes antes de renderizar o vídeo inteiro; junte todas as correções em uma rodada.
4. Chat novo por vídeo (o Claude relê o contexto a cada mensagem).
5. Reaproveite cenários e peças de vídeos anteriores (copie o filme anterior e troque os rótulos).
