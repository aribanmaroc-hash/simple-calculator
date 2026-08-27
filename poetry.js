const verses = Array.from(document.querySelectorAll(".verse"));
const reciteBtn = document.getElementById("recite-btn");
const stopBtn = document.getElementById("stop-btn");
const statusEl = document.getElementById("status");

let speaking = false;
let currentUtterance = null;

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

function highlightVerse(index) {
  verses.forEach((v, i) => v.classList.toggle("active", i === index));
}

function clearHighlight() {
  verses.forEach((v) => v.classList.remove("active"));
}

function getArabicVoice() {
  const voices = speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.startsWith("ar")) ||
    voices.find((v) => v.lang.includes("AR")) ||
    null
  );
}

function recite() {
  if (speaking) return;
  speechSynthesis.cancel();

  const texts = verses.map((v) => v.dataset.text);
  let index = 0;
  speaking = true;
  reciteBtn.disabled = true;
  stopBtn.disabled = false;
  setStatus("جاري الإلقاء…");

  function speakNext() {
    if (index >= texts.length) {
      speaking = false;
      reciteBtn.disabled = false;
      stopBtn.disabled = true;
      clearHighlight();
      setStatus("");
      return;
    }

    highlightVerse(index);
    const utterance = new SpeechSynthesisUtterance(texts[index]);
    utterance.lang = "ar-SA";
    utterance.rate = 0.7;
    utterance.pitch = 1;

    const voice = getArabicVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      index++;
      speakNext();
    };
    utterance.onerror = () => {
      index++;
      speakNext();
    };

    currentUtterance = utterance;
    speechSynthesis.speak(utterance);
  }

  speakNext();
}

function stopRecitation() {
  speechSynthesis.cancel();
  speaking = false;
  reciteBtn.disabled = false;
  stopBtn.disabled = true;
  clearHighlight();
  setStatus("");
}

reciteBtn.addEventListener("click", recite);
stopBtn.addEventListener("click", stopRecitation);

// Load voices (some browsers load asynchronously)
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => {};
}

// Check support
if (!("speechSynthesis" in window)) {
  reciteBtn.disabled = true;
  setStatus("المتصفح لا يدعم الإلقاء الصوتي");
}
