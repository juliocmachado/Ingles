// Multiple-choice quiz. Usage:
// <div class="quiz" data-quiz='[{"q":"...","options":["a","b"],"answer":0,"why":"..."}]'></div>
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".quiz[data-quiz]").forEach(root => {
    const items = JSON.parse(root.dataset.quiz);
    let correct = 0, answered = 0;
    const score = Object.assign(document.createElement("p"), { className: "score" });
    const update = () => score.textContent = `${correct} / ${items.length} certas na primeira tentativa`;

    items.forEach((item, i) => {
      const box = Object.assign(document.createElement("div"), { className: "exercise" });
      box.innerHTML = `<p class="prompt"><strong>${i + 1}.</strong> ${item.q}</p>`;
      const choices = Object.assign(document.createElement("div"), { className: "choices" });
      const fb = Object.assign(document.createElement("p"), { className: "feedback" });
      let first = true;
      item.options.forEach((opt, j) => {
        const b = Object.assign(document.createElement("button"), { textContent: opt });
        b.onclick = () => {
          if (j === item.answer) {
            b.classList.add("right");
            fb.className = "feedback ok";
            fb.innerHTML = "✓ " + (item.why || "Isso!");
            if (first) correct++;
            answered++;
            choices.querySelectorAll("button").forEach(x => x.disabled = x !== b);
            update();
          } else {
            b.classList.add("wrong"); b.disabled = true;
            fb.className = "feedback no";
            fb.textContent = "✗ Tente de novo / Try again.";
            first = false;
          }
        };
        choices.append(b);
      });
      box.append(choices, fb);
      root.append(box);
    });
    update();
    root.append(score);
  });
});
