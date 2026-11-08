# Kit de Vídeos 3D Virais

Faça Reels 3D no formato "como funciona" (aquele mundo em miniatura, uma palavra por vez, câmera voando entre cenas) **para o seu nicho**, com o Claude Code conduzindo da ideia ao MP4. Odontologia, advocacia, imobiliária, estética, contabilidade, comércio local: o método é o mesmo, muda o tema.

O kit traz:
- **8 skills** do Claude Code (ideia, pesquisa, roteiro, produção, cena 3D, revisão, marca, orquestrador);
- **um projeto pronto** (Remotion + React Three Fiber) com **um vídeo de exemplo funcionando**;
- **playbook** com as lições de 20+ vídeos, **referências** de criação e **ideias por nicho**;
- **trilha e efeitos sintetizados por código** (sem direito autoral) e modelos 3D CC0 (Kenney).

> Resultado: um vídeo vertical 1080×1920 de ~60 s, com voz, legenda grande, trilha e fecho da sua marca. Alcance depende do seu perfil e do tema; nada aqui é promessa de views.

## O que você precisa
| Item | Para quê |
|---|---|
| [Claude Code](https://claude.com/claude-code) (assinatura Claude ou API) | Conduz o processo com as skills deste repositório |
| [Node.js 18+](https://nodejs.org) | Roda o projeto |
| [ffmpeg](https://ffmpeg.org/download.html) | Junta áudio e vídeo, faz as folhas de revisão |
| Chave do [ElevenLabs](https://elevenlabs.io) (plano pago) | Voz em português. **Opcional para testar:** sem chave você faz o vídeo com tempos estimados e sem voz |
| ~2 GB livres e 8 GB de RAM | Dependências e render |

Veja `docs/custos-e-limites.md` antes de decidir.

## Instalação (5 passos)
1. **Baixe** este repositório (botão *Code → Download ZIP*, ou `git clone`) e descompacte.
2. **Instale** Node e ffmpeg (links acima). Abra um terminal novo para o PATH atualizar.
3. **Dependências:** no terminal, dentro da pasta `projeto/`:
   ```bash
   npm ci
   npm run checar
   ```
   O `checar` diz o que ainda falta (✔/✘). Use `npm ci` (e não `npm install`): ele respeita as versões testadas.
4. **Chave de voz (opcional agora):** copie `projeto/.env.example` para `projeto/.env.local` e cole a chave do ElevenLabs. Esse arquivo nunca sobe para o GitHub.
5. **Abra a pasta raiz deste repositório no Claude Code** (a pasta que contém `CLAUDE.md` e `.claude/`). As skills carregam sozinhas.

## Seu primeiro vídeo
Antes de instalar, veja o resultado do exemplo em `docs/exemplo-preview.mp4` (versão leve, sem voz).

Veja o exemplo rodando (sem chave, sem custo):
```bash
cd projeto
npm run dev        # abre o Remotion Studio; escolha "exemplo"
```
Para renderizar o exemplo em MP4:
```bash
npm run trilha -- exemplo
npm run render -- exemplo      # sai em projeto/entrega/exemplo.mp4
```

Depois, no Claude Code, digite:
> Quero fazer um vídeo 3D para o meu nicho. Use a skill video3d-novo.

O Claude pergunta nicho e público, propõe 5 ideias, monta o dossiê com fontes, escreve o roteiro (você aprova **antes** de gastar voz), gera voz, monta a cena, revisa quadro a quadro e entrega o MP4 com legenda do post.

## Como o kit funciona (resumo)
```
ideia → pesquisa com fonte → roteiro aprovado → voz (tempo de cada palavra)
      → cena 3D ancorada nas palavras → trilha por código → render → revisão a cada 0,5 s → post
```
Tudo na cena (câmera, objetos, legenda, efeitos) é ancorado em **palavras da narração**. Trocou a voz? Roda `timeline` de novo e o vídeo inteiro se reposiciona.

## Estrutura
```
CLAUDE.md               regras e mapa de skills (o Claude lê ao abrir a pasta)
.claude/skills/         as 8 skills (video3d-*)
docs/                   playbook, referências, ideias por nicho, custos, problemas, dossiê-modelo
projeto/                Remotion + React Three Fiber
  src/brand.ts          SUA marca (cores, nome, fecho)
  src/films/Exemplo.tsx o vídeo de exemplo (copie para criar o seu)
  src/lib/              palco 3D, câmera, rótulos seguros, legenda, modelos
  scripts/              voz, marcações, trilha, render, revisão
  narracao/roteiros.json  seu texto
  public/models/        modelos Kenney (CC0)
```

## Cuidados importantes
- **Nichos regulados** (saúde, direito, finanças): sem promessa de resultado, sem antes/depois, sem expor paciente ou cliente. Confira as regras de publicidade do seu conselho (CFO, CRM, OAB, CRC...) e a LGPD **antes** de publicar. O kit ajuda a evitar erros, mas não substitui essa checagem.
- **Fatos:** todo número com fonte e data, ou marcado como ilustrativo. O dossiê tem sempre a lista "não afirmar".
- **Conteúdo de terceiros:** as referências em `docs/referencias.md` são para estudo. Não copie vídeos, textos ou trilhas de ninguém.
- **Voz e licenças:** uso comercial exige plano pago do ElevenLabs; confira também a licença do Remotion para o porte da sua empresa (`LICENSES-TERCEIROS.md`).
- **Chave:** nunca cole a chave em arquivos versionados nem em mensagens.

## Quer melhorar o kit?
Depois de cada vídeo, peça ao Claude: "acrescente as lições deste vídeo em `docs/playbook.md`". Compartilhe na comunidade o que funcionou (e o que quebrou).

## Licença
Código e documentação: MIT. Modelos 3D: Kenney, CC0. Fonte Manrope: OFL. Detalhes em `LICENSE` e `LICENSES-TERCEIROS.md`.
