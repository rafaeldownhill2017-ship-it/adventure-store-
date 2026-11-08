// Mapa de cada vídeo: onde ele começa, quanto dura depois da voz e QUAIS PALAVRAS da narração disparam cada cena.
// Tudo no filme (câmera, objetos, legenda, efeito sonoro) é ancorado nessas palavras. Trocar a voz e rodar
// `npm run timeline` reposiciona o filme inteiro.
//
// cues: { nome: "palavra" }  ou  { nome: ["palavra", 2] }  (2ª ocorrência). A comparação ignora acento e pontuação.
// Se a palavra não existir na narração, o script FALHA de propósito (melhor que um corte no lugar errado).
export const filmes = [
  {
    id: "exemplo",
    vozes: ["COLE_AQUI_O_ID_DA_VOZ"], // ordem de preferência; use o mesmo id de narracao/roteiros.json
    preRoll: 0.7, // silêncio antes da primeira palavra (s)
    cauda: 4.2, // tempo depois da última palavra, para o fecho (s)
    cues: {
      anuncio: "anúncio",
      telefone: "telefone",
      ninguem: "ninguém",
      caminho: "caminho",
      recepcao: "recepção",
      linhas: "linhas",
      caixa: "caixa",
      espera: "espera",
      proximo: "próximo",
      esquina: "esquina",
      parabens: "Parabéns",
      processo: "processo",
      defina: "Defina",
      atende: ["atende", 3],
      tempo: "tempo",
      retorna: "retorna",
      mande: "Mande",
      comenta: "comenta",
      fim: "explicada",
    },
  },
];
