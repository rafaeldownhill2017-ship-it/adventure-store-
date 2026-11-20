# Dossiê · caixa1 · Caixa do Bolso 1/3 · "Cada seguidor vale R$ 10 (de mentirinha)"
Levantado em 20/11/2026. É SIMULAÇÃO: nenhum dinheiro real é investido, prometido ou entregue a seguidores.

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
| 5 | Exemplo com R$ 1.000: poupança ≈ R$ 1.080 (8%); Tesouro ≈ R$ 1.112 (11,26%) | conta própria, **se as taxas ficarem iguais** | 20/11/2026 |

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
