// Speech helpers shared by all lessons: listen (text-to-speech) and speak (speech recognition).
// Change LANG to match the destination country's accent: en-US, en-GB, en-CA, en-AU, en-IE.
const Speech = (() => {
  const LANG = "en-US";
  const synth = window.speechSynthesis;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function pickVoice() {
    const voices = synth ? synth.getVoices() : [];
    return voices.find(v => v.lang === LANG && /natural|google|samantha/i.test(v.name))
        || voices.find(v => v.lang === LANG)
        || voices.find(v => v.lang && v.lang.startsWith("en"));
  }

  function say(text, rate = 0.9) {
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG; u.rate = rate;
    const v = pickVoice(); if (v) u.voice = v;
    synth.speak(u);
  }

  // Resolves with the best transcript, or rejects if recognition is unavailable/fails.
  function listen() {
    return new Promise((resolve, reject) => {
      if (!Recognition) return reject(new Error("unsupported"));
      const r = new Recognition();
      r.lang = LANG; r.interimResults = false; r.maxAlternatives = 3;
      r.onresult = e => resolve(Array.from(e.results[0]).map(a => a.transcript));
      r.onerror = e => reject(e.error || e);
      r.start();
    });
  }

  // Turn every [data-say] element into a pair of listen buttons (normal + slow).
  function wire(root = document) {
    root.querySelectorAll("[data-say]").forEach(el => {
      if (el.dataset.wired) return;
      el.dataset.wired = "1";
      const text = el.dataset.say;
      const normal = Object.assign(document.createElement("button"), { className: "icon", textContent: "▶", title: "Ouvir / Listen" });
      const slow = Object.assign(document.createElement("button"), { className: "icon", textContent: "🐢", title: "Devagar / Slowly" });
      normal.onclick = () => say(text);
      slow.onclick = () => say(text, 0.55);
      el.append(normal, slow);
    });
  }

  if (synth) synth.onvoiceschanged = () => {};
  document.addEventListener("DOMContentLoaded", () => wire());
  return { say, listen, wire, canListen: !!Recognition, LANG };
})();
