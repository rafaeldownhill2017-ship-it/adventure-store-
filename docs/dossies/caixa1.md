# Dossiê · caixa1 · Caixa do Bolso 1/3 · "Cada seguidor vale R$ 10 (de mentirinha)"
Levantado em 20/11/2026; versão 2 (28 seguidores, pirâmide, Mega e escada de aquisições). É SIMULAÇÃO: nenhum dinheiro real é investido, prometido ou entregue a seguidores.

## Formato (estudo de modelos)
- O Instagram não abre nesta sessão, e a busca não achou nenhum caso documentado de "R$ X por seguidor". O formato foi montado a partir de padrões já registrados em docs/referencias.md:
  - @maxagroapp: dinheiro de fantasia + decisão pessoal + contador de saldo + Parte 2 com gancho.
  - Séries "Dia X" e "1 real por dia" (ex.: Short do YouTube "guardar 1 real por dia").
- Mecânica própria:
  - Cada seguidor = R$ 10 fictícios.
  - O público vota nos comentários (POUPANÇA / TESOURO / TORRAR).
  - Ep. 2 (um mês depois) mostra quanto rendeu a opção vencedora. Ep. 3 fecha a série (no máximo 3 partes, regra 9).
  - Cada seguidor novo soma R$ 10 → motivo para seguir e acompanhar.

## Números
| # | Dado | Fonte | Data |
|---|---|---|---|
| 1 | Selic 13,75% a.a. (mantida por unanimidade); Selic efetiva 13,65% em 9/11 | Copom (via Suno, IstoÉ, meusdividendos) | 04/11/2026 |
| 2 | Regra da poupança: Selic > 8,5% → 0,5% ao mês + TR | regra do BC (via Nubank/Rankia) | vigente |
| 3 | Poupança: ~8,29% em 12 meses; nov/2026 = 0,6624% (aniversário dia 1º) | Rankia | nov/2026 |
| 4 | Tesouro Selic, 12 meses, líquido ≈ 13,65% × (1 − 17,5% de IR) ≈ **11,3%** | conta própria; IR regressivo de 17,5% para 361–720 dias | 20/11/2026 |
| 6 | Seguidores: **28** → caixa de **R$ 280** | print do perfil enviado pelo dono | 20/11/2026 |
| 7 | Mega-Sena: aposta simples R$ 6; chance de 1 em 50.063.860 por aposta. R$ 280 = 46 jogos (R$ 276) → chance ≈ 1 em 1,09 milhão | Loterias Caixa (via Olhar Digital e Seu Dinheiro, 2026) | nov/2026 |
| 8 | Pirâmide "10% ao mês": 280 × 1,1¹² ≈ R$ 879 **no papel**; pirâmide financeira é crime contra a economia popular (Lei 1.521/1951, art. 2º, IX) | conta própria + lei | — |
| 9 | Poupança: 280 × 1,08 ≈ R$ 302 · Tesouro Selic: 280 × 1,1126 ≈ R$ 311 (se as taxas ficarem) | conta própria | 20/11/2026 |
| 10 | Escada: 100 seguidores = R$ 1.000 · 1.000 = R$ 10 mil · 10 mil = R$ 100 mil (o carro de R$ 100 mil do carro1) | regra da série | — |
| 5 | Exemplo com R$ 1.000: poupança ≈ R$ 1.080 (8%); Tesouro ≈ R$ 1.112 (11,26%) | conta própria, **se as taxas ficarem iguais** | 20/11/2026 |

## Não afirmar (v2)
- Nome de nenhuma pirâmide ou empresa real. A "pirâmide" é genérica.
- Que a Mega "não vale a pena" para quem joga por diversão: o vídeo só mostra a chance. Na tela: "jogo é para maiores de 18".
- Se a pirâmide vencer a votação, o ep. 2 mostra o "R$ 0" e explica como o golpe funciona. Nunca simular ganho com golpe.

## Não afirmar
- Que alguém vai ganhar dinheiro de verdade. **Não é sorteio nem prêmio:** promoção com prêmio exige autorização (Lei 5.768/1971). Nada sai para seguidores.
- "Tesouro é melhor que poupança para você" ou qualquer recomendação. O vídeo compara classes, com conta mostrada, e o público decide (educação financeira).
- Rendimento garantido: as taxas mudam (Copom em 09/12/2026); o card diz "se as taxas ficarem".
- Taxa de custódia: o Tesouro Selic é isento até R$ 10 mil (conferir a regra atual da B3 se a caixa passar disso).
- Número de seguidores: só o real do dia, trocado em `SEGUIDORES` (src/films/Caixa1.tsx) antes do render.

## Fontes
- Suno, Copom mantém Selic em 13,75%: https://www.suno.com.br/noticias/copom-mantem-selic-1375-novembro-2026-go/
- meusdividendos, Selic: https://www.meusdividendos.com/indicadores/selic
- Rankia, poupança em novembro/2026: https://rankia.com.br/poupanca-novembro-2026-quanto-rende/
- Acionista, Tesouro Selic ou poupança em 12 meses: https://acionista.com.br/poupanca-ou-tesouro-selic-12-meses/
- YouTube Short "guardar 1 real por dia": https://www.youtube.com/shorts/Y7hzwNCXfLE
- Mega-Sena, preço e chance: https://olhardigital.com.br/2026/04/09/curiosidades/quanto-custa-apostar-na-mega-sena-e-como-aumentar-suas-chances/
- Seu Dinheiro, Mega-Sena 2026: https://www.seudinheiro.com/2026/economia/mega-sena-acumula-e-premio-vai-a-r-115-milhoes-veja-quanto-custa-apostar-e-suas-chances-de-ganhar-lvgb/

## Auditoria viral (v4, 20/11/2026)
Critérios tirados dos modelos virais registrados em docs/referencias.md (@agrimporta_com: 500 mil–3 mi views com ~28 mil seguidores; @maxagroapp: dinheiro de fantasia com contador). O Instagram não abre nesta sessão: a comparação é com a anatomia documentada, não com vídeos assistidos hoje.

| Critério | v3 | v4 |
|---|---|---|
| Objeto + ação + número em 0–3 s | cofre parado até 3,5 s | cofre abre aos 0,25 s, notas voam, contador rola R$ 0 → R$ 280 |
| Contador de saldo vivo | barra estática | saldo reage a cada opção: 879 (pirâmide no papel, verde) → 0 (vermelho) · 302 · 311 · meta 500 → 1.000 → 100.000 |
| Quadro 0 forte (prévia no feed) | quase vazio | card "28 seguidores" já inteiro |
| Loop | fecho branco de 3,7 s | termina no cofre com "segue" e volta ao gancho |
| Gancho para a Parte 2 | não estava na voz | chip "ep. 2 em 30 dias: o resultado" |
| Capa padronizada | — | entrega/caixa1-capa.jpg |
| Pedido para seguir cedo | — | aos 5 s: "se você seguir agora, vira R$ 290" |
| Pedido para marcar alguém | ✓ | ✓ "marca quem ia escolher a pirâmide" |
| Meta perto | ✓ | ✓ 28/50, faltam 22 |
| Uma palavra por vez; números presos a objetos | ✓ | ✓ |
| Falta (para o ep. 2) | print de comentário real no gancho | — |
