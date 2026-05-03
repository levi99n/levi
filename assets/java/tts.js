// ================================================================
// TTS.JS — Text-to-Speech Podcast Player
// Dùng Web Speech API (built-in trình duyệt, không cần API key)
// ================================================================

const synth = window.speechSynthesis;

// ─── State ───────────────────────────────────────────────────────
let currentUtterance = null;
let isPaused = false;
let activeBtn = null;

// ─── Lấy giọng tiếng Việt (nếu có) ─────────────────────────────
function getVietnameseVoice() {
  const voices = synth.getVoices();
  return (
    voices.find(v => v.lang === "vi-VN") ||
    voices.find(v => v.lang.startsWith("vi")) ||
    voices[0] || null
  );
}

// ─── Tạo nội dung cần đọc từ bài báo ───────────────────────────
function extractArticleText(articleEl) {
  // Lấy title + description từ element bài báo
  const title = articleEl.querySelector("h3")?.textContent?.trim() || "";
  const desc  = articleEl.querySelector("p")?.textContent?.trim()  || "";
  return [title, desc].filter(Boolean).join(". ");
}

// ─── Tạo mini player UI ─────────────────────────────────────────
function createPlayer(text, title) {
  // Xóa player cũ nếu có
  document.getElementById("tts-player")?.remove();

  const player = document.createElement("div");
  player.id = "tts-player";
  player.innerHTML = `
    <div class="tts-inner">
      <div class="tts-info">
        <div class="tts-wave">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <span class="tts-title">${title}</span>
      </div>
      <div class="tts-controls">
        <button class="tts-btn" id="tts-rewind" title="Đọc lại">
          <svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
        </button>
        <button class="tts-btn tts-play-pause" id="tts-play-pause" title="Tạm dừng">
          <svg id="tts-play-icon" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        </button>
        <button class="tts-btn" id="tts-stop" title="Dừng">
          <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
        </button>
        <div class="tts-speed-wrap">
          <select id="tts-speed" title="Tốc độ">
            <option value="0.8">0.8x</option>
            <option value="1"   selected>1x</option>
            <option value="1.2">1.2x</option>
            <option value="1.5">1.5x</option>
          </select>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(player);

  // Hiện player với animation
  requestAnimationFrame(() => player.classList.add("tts-visible"));

  // ─── Controls logic ─────────────────────────────────────────
  const playPauseBtn = document.getElementById("tts-play-pause");
  const playIcon     = document.getElementById("tts-play-icon");
  const stopBtn      = document.getElementById("tts-stop");
  const rewindBtn    = document.getElementById("tts-rewind");
  const speedSelect  = document.getElementById("tts-speed");
  const wave         = player.querySelector(".tts-wave");

  // Cập nhật icon play/pause
  function updatePlayIcon(playing) {
    playIcon.innerHTML = playing
      ? `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`
      : `<polygon points="5 3 19 12 5 21 5 3"/>`;
    wave.classList.toggle("tts-playing", playing);
  }

  // Play/Pause
  playPauseBtn.addEventListener("click", () => {
    if (synth.speaking && !isPaused) {
      synth.pause();
      isPaused = true;
      updatePlayIcon(false);
    } else if (isPaused) {
      synth.resume();
      isPaused = false;
      updatePlayIcon(true);
    }
  });

  // Stop
  stopBtn.addEventListener("click", () => {
    stopTTS();
  });

  // Đọc lại từ đầu
  rewindBtn.addEventListener("click", () => {
    synth.cancel();
    isPaused = false;
    speak(text, parseFloat(speedSelect.value));
    updatePlayIcon(true);
  });

  // Đổi tốc độ
  speedSelect.addEventListener("change", () => {
    if (synth.speaking || isPaused) {
      synth.cancel();
      isPaused = false;
      speak(text, parseFloat(speedSelect.value));
      updatePlayIcon(true);
    }
  });

  updatePlayIcon(true);
  return player;
}

// ─── Dừng và dọn dẹp ────────────────────────────────────────────
function stopTTS() {
  synth.cancel();
  isPaused = false;
  currentUtterance = null;

  // Reset nút đang active
  if (activeBtn) {
    activeBtn.classList.remove("tts-active");
    activeBtn.innerHTML = ttsButtonHTML();
    activeBtn = null;
  }

  // Ẩn player
  const player = document.getElementById("tts-player");
  if (player) {
    player.classList.remove("tts-visible");
    setTimeout(() => player.remove(), 350);
  }
}

// ─── Tạo utterance và đọc ────────────────────────────────────────
function speak(text, rate = 1) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = getVietnameseVoice();
  utter.lang  = "vi-VN";
  utter.rate  = rate;
  utter.pitch = 1;
  utter.volume = 1;

  utter.onend = () => {
    // Đọc xong → reset
    stopTTS();
  };

  utter.onerror = (e) => {
    if (e.error !== "interrupted") {
      console.error("TTS error:", e.error);
    }
  };

  currentUtterance = utter;
  synth.speak(utter);
}

// ─── HTML nút đọc ────────────────────────────────────────────────
function ttsButtonHTML() {
  return `
    <svg viewBox="0 0 24 24" width="16" height="16">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
    <span>Nghe</span>
  `;
}

// ─── Gắn nút TTS vào mỗi bài báo ─────────────────────────────────
export function initTTS() {
  // Chờ voices load xong
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = () => {};
  }

  // Gắn vào các bài báo trong con4-left-item
  const items = document.querySelectorAll(".con4-left-item");
  items.forEach(item => {
    const link = item.querySelector("a");
    if (!link) return;

    const btn = document.createElement("button");
    btn.className = "tts-listen-btn";
    btn.innerHTML = ttsButtonHTML();

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const text  = extractArticleText(item);
      const title = item.querySelector("h3")?.textContent?.trim() || "Bài viết";

      if (!text) {
        alert("Không có nội dung để đọc.");
        return;
      }

      // Nếu đang đọc bài này → dừng
      if (btn === activeBtn) {
        stopTTS();
        return;
      }

      // Dừng bài đang đọc (nếu có)
      if (activeBtn) {
        synth.cancel();
        activeBtn.classList.remove("tts-active");
        activeBtn.innerHTML = ttsButtonHTML();
      }

      // Bắt đầu đọc bài mới
      activeBtn = btn;
      btn.classList.add("tts-active");
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16">
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </svg>
        <span>Đang đọc</span>
      `;

      isPaused = false;
      speak(text);
      createPlayer(text, title);
    });

    // Chèn nút sau thẻ a
    item.appendChild(btn);
  });
}
