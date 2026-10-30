// Active recall: the learner produces English from memory, by typing or speaking.
// Two widgets share one answer checker:
//   <div class="recall" data-items='[{"prompt":"...","accept":["regex"],"model":"..."}]'></div>
//   <div class="dialogue-sim" data-partner="Emma" data-turns='[{"them":"Hi!","hint":"...","accept":["regex"],"model":"..."}]'></div>
// "accept" entries are regexes tested against the normalized answer (lowercase, no punctuation,
// contractions expanded). "{name}" in model/them text is replaced by the learner's name.
const Recall = (() => {
  const CONTRACTIONS = [
    [/\bi'?m\b/g, "i am"], [/\byou'?re\b/g, "you are"], [/\bit'?s\b/g, "it is"],
    [/\bname'?s\b/g, "name is"], [/\bwhat'?s\b/g, "what is"], [/\bwhere'?s\b/g, "where is"],
    [/\bhow'?s\b/g, "how is"], [/\bthat'?s\b/g, "that is"],
  ];
  function normalize(s) {
    s = s.toLowerCase().replace(/[’`]/g, "'");
    CONTRACTIONS.forEach(([re, full]) => s = s.replace(re, full));
    return s.replace(/[^a-zà-ú' ]/g, " ").replace(/\s+/g, " ").trim();
  }
  function matches(answer, accept) {
    const n = normalize(answer);
    return accept.some(re => new RegExp("^(?:" + re + ")$").test(n));
  }
  const learnerName = () => localStorage.getItem("ingles.name") || "Ana";
  const fill = s => (s || "").replace(/\{name\}/g, learnerName());

  // One answer row: text input + check + speak + reveal. Calls onDone(correctFirstTry).
  function answerRow(item, onDone) {
    const wrap = document.createElement("div");
    const input = Object.assign(document.createElement("input"), { className: "answer", placeholder: "Digite ou fale em inglês… / Type or say it…", autocomplete: "off", spellcheck: false });
    const fb = Object.assign(document.createElement("p"), { className: "feedback" });
    const check = Object.assign(document.createElement("button"), { textContent: "Conferir / Check" });
    const mic = Object.assign(document.createElement("button"), { textContent: "🎤 Falar / Speak" });
    const reveal = Object.assign(document.createElement("button"), { textContent: "Mostrar / Show" });
    let tries = 0, done = false;

    const finish = ok => {
      if (done) return; done = true;
      input.disabled = check.disabled = mic.disabled = reveal.disabled = true;
      onDone && onDone(ok);
    };
    const grade = text => {
      tries++;
      if (matches(text, item.accept)) {
        fb.className = "feedback ok";
        fb.innerHTML = `✓ Boa! Modelo: <span class="en">${fill(item.model)}</span>`;
        Speech.say(fill(item.model));
        finish(tries === 1);
      } else {
        fb.className = "feedback no";
        fb.textContent = tries < 2 ? "✗ Quase. Tente de novo (dica: frase curta e completa)." : "✗ Tente mais uma vez ou clique em Mostrar.";
      }
    };
    check.onclick = () => input.value.trim() && grade(input.value);
    input.onkeydown = e => { if (e.key === "Enter") check.onclick(); };
    mic.onclick = async () => {
      mic.textContent = "🎤 Ouvindo… / Listening…";
      try {
        const alts = await Speech.listen();
        input.value = alts.find(a => matches(a, item.accept)) || alts[0];
        grade(input.value);
      } catch (err) {
        fb.className = "feedback no";
        fb.textContent = err.message === "unsupported"
          ? "Seu navegador não reconhece fala (use Chrome ou Edge). Fale em voz alta e depois digite."
          : "Não ouvi nada. Permita o microfone e tente de novo.";
      }
      mic.textContent = "🎤 Falar / Speak";
    };
    reveal.onclick = () => {
      fb.className = "feedback";
      fb.innerHTML = `Resposta modelo: <span class="en">${fill(item.model)}</span> — repita em voz alta 2×.`;
      Speech.say(fill(item.model));
      finish(false);
    };
    if (!Speech.canListen) mic.title = "Funciona no Chrome/Edge";
    wrap.append(input, check, mic, reveal, fb);
    return wrap;
  }

  function score(root, total) {
    const p = Object.assign(document.createElement("p"), { className: "score" });
    let ok = 0, n = 0;
    p.textContent = `0 / ${total}`;
    root.append(p);
    return good => { n++; if (good) ok++; p.textContent = `${ok} / ${total} de memória na primeira tentativa` + (n === total ? " — terminado!" : ""); };
  }

  function mountRecall(root) {
    const items = JSON.parse(root.dataset.items);
    const boxes = items.map((item, i) => {
      const box = Object.assign(document.createElement("div"), { className: "exercise" });
      box.innerHTML = `<p class="prompt"><strong>${i + 1}.</strong> ${item.prompt}</p>`;
      return box;
    });
    boxes.forEach(b => root.append(b));
    const tick = score(root, items.length);
    items.forEach((item, i) => boxes[i].append(answerRow(item, tick)));
  }

  function mountDialogue(root) {
    const turns = JSON.parse(root.dataset.turns);
    const partner = root.dataset.partner || "Them";
    const box = Object.assign(document.createElement("div"), { className: "exercise dialogue" });
    const start = Object.assign(document.createElement("button"), { textContent: "▶ Começar a conversa / Start" });
    box.append(start);
    root.append(box);
    let tick;

    const line = (who, text, cls) => {
      const p = Object.assign(document.createElement("p"), { className: "line" });
      p.innerHTML = `<span class="who">${who}</span><span class="${cls}">${text}</span>`;
      box.append(p);
      return p;
    };
    const play = i => {
      if (i >= turns.length) {
        line("", "🎉 Conversa completa! Faça de novo amanhã, sem olhar a tabela.", "you");
        return;
      }
      const t = turns[i];
      const them = fill(t.them);
      const p = line(partner, them, "them");
      const again = Object.assign(document.createElement("button"), { className: "icon", textContent: "▶" });
      again.onclick = () => Speech.say(them);
      p.append(" ", again);
      Speech.say(them);
      if (!t.accept) return play(i + 1);
      if (t.hint) line("", `<small>${t.hint}</small>`, "pt");
      box.append(answerRow(t, good => { tick(good); setTimeout(() => play(i + 1), 900); }));
    };
    start.onclick = () => {
      start.remove();
      tick = score(root, turns.filter(t => t.accept).length);
      play(0);
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".recall[data-items]").forEach(mountRecall);
    document.querySelectorAll(".dialogue-sim[data-turns]").forEach(mountDialogue);
    document.querySelectorAll("input.learner-name").forEach(inp => {
      inp.value = localStorage.getItem("ingles.name") || "";
      inp.oninput = () => localStorage.setItem("ingles.name", inp.value.trim());
    });
  });
  return { normalize, matches };
})();
