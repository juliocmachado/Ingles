# Notes

- Língua das lições: **misto** — explicação em PT, frases/prática em EN. Aumentar a proporção de inglês a cada lição (ex.: instruções em EN a partir da ~lição 4).
- Tempo: 30 min/dia → cada lição ~15 min + revisão espaçada da lição anterior.
- Dor principal: **trava ao falar**. Priorizar produção oral (falar em voz alta, simular diálogo) sobre leitura.
- Ensinar frases em **blocos prontos** (chunks), não palavra por palavra.
- Destino: **Atlanta, Geórgia (EUA)**. Sotaque das lições: en-US (constante `LANG` em `assets/speech.js`). Situações e exemplos devem usar contexto americano/Atlanta (dólares, MARTA, Publix/Kroger, "Have a good one").
- A rede da sessão bloqueia learnenglish.britishcouncil.org (não dá para buscar conteúdo); links ainda funcionam para o aluno.
- Depois de criar/editar uma lição: rodar `python3 tools/bundle.py` para gerar `standalone/` (arquivo único que abre em qualquer lugar) e enviar ao aluno a versão de `standalone/`.
- Componentes: `assets/style.css`, `assets/speech.js` (ouvir/falar), `assets/quiz.js` (múltipla escolha), `assets/recall.js` (lembrar e digitar/falar + diálogo simulado).

## Entrega das lições (aluno usa iPad)

- O aluno estuda no **iPad**: HTML baixado abre no visualizador de arquivos, que não roda JavaScript. **Entregar cada lição como página (artifact) do Claude**, publicada a partir de `standalone/` (rodar `python3 tools/bundle.py` antes).
- Dentro do artifact o microfone é bloqueado → o 🎤 mostra aviso e o aluno fala em voz alta e digita. Os botões ▶/🐢 (ouvir) funcionam.
- Links entre páginas devem usar as URLs dos artifacts (não caminhos relativos).
- Páginas publicadas:
  - Lição 1 — slug `7c1c93f8-c456-4661-aca2-431ee5a14969` — https://claude.ai/artifact/GKu72zDT2D6b3xQ8RCLyjW
  - Referência "Frases do dia a dia" — slug `a1077b75-67ee-44e8-be3f-4d3bb54c3515` — https://claude.ai/artifact/LtJiJQEWr4aysahC3RG9hE (republicar a cada lição nova)
