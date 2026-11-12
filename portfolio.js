tailwind.config = {
      theme: {
        extend: {
          colors: {
            ink: "#35285F",
            plum: { 50: "#F5F2F9", 100: "#E9E1F1", 200: "#D5C7E2", 300: "#B49ACB", 500: "#7A5197", 600: "#684486", 700: "#5344A9", 800: "#453889", 900: "#35285F" },
            coral: { 50: "#FFF7F5", 100: "#FFF0ED", 200: "#FBD8D1", 300: "#F8B5A7", 500: "#F47F6B", 600: "#E66D5E" },
            berry: { 50: "#F9EFF6", 100: "#F2DDEA", 500: "#BB5098", 600: "#A33F82", 700: "#87336C" },
            sun: { 50: "#FFFCED", 100: "#FFF7CF", 300: "#F8EB86", 500: "#F5E63C" },
            mist: { 50: "#FBF9FD", 100: "#F5F0F9" }
          },
          fontFamily: {
            sans: ["Montserrat", "sans-serif"],
            display: ["Montserrat", "sans-serif"]
          },
          boxShadow: {
            soft: "0 20px 60px rgba(83, 68, 169, .12)",
            card: "0 12px 35px rgba(83, 68, 169, .09)"
          }
        }
      }
    };

document.addEventListener("DOMContentLoaded", () => {
lucide.createIcons();
    document.getElementById("current-year").textContent = new Date().getFullYear();

    const menuButton = document.getElementById("menu-button");
    const mobileMenu = document.getElementById("mobile-menu");
    menuButton.addEventListener("click", () => {
      const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isExpanded));
      menuButton.setAttribute("aria-label", isExpanded ? "Mở menu" : "Đóng menu");
      mobileMenu.classList.toggle("hidden", isExpanded);
      menuButton.innerHTML = isExpanded
        ? '<i data-lucide="menu" class="h-6 w-6"></i>'
        : '<i data-lucide="x" class="h-6 w-6"></i>';
      lucide.createIcons();
    });

    document.querySelectorAll(".mobile-link").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Mở menu");
        menuButton.innerHTML = '<i data-lucide="menu" class="h-6 w-6"></i>';
        lucide.createIcons();
      });
    });

    document.getElementById("contact-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;

      const formData = new FormData(form);
      const name = formData.get("name").toString().trim();
      const email = formData.get("email").toString().trim();
      const message = formData.get("message").toString().trim();
      const subject = encodeURIComponent("Liên hệ từ " + name);
      const body = encodeURIComponent("Họ tên: " + name + "\nEmail: " + email + "\n\nLời nhắn:\n" + message);
      document.getElementById("form-status").textContent = "Đang mở ứng dụng email để gửi lời nhắn...";
      window.location.href = "mailto:ngocviphan.23@gmail.com?subject=" + subject + "&body=" + body;
    });

    const roseOverlay = document.getElementById("rose-overlay");
    const greetingModal = document.getElementById("greeting-modal");
    const greetingCard = greetingModal.querySelector(".greeting-card");
    const musicToggle = document.getElementById("greeting-music-toggle");
    const musicLabel = document.getElementById("greeting-music-label");
    const roseColors = ["#9F1239", "#E879A9", "#F5C842", "#F47F6B", "#BB5098"];
    const leafColors = ["#3E8060", "#568B64", "#759A64"];
    const bouquetTypes = ["round", "cone", "ribbon", "leafy", "classic"];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeBouquets = 0;
    let previousBodyOverflow = "";
    let lastFocusedElement = null;
    let audioContext = null;
    let musicPlaying = false;
    let musicMuted = false;
    let musicMaster = null;
    let musicScheduler = null;
    let nextMusicNoteTime = 0;
    let musicNoteIndex = 0;
    let musicRunId = 0;
    const musicBoxMelody = [
      72, 76, 79, 76, 74, 77, 81, 77,
      72, 76, 79, 84, 81, 79, 76, 74,
      72, 74, 76, 79, 76, 74, 71, 72
    ];
    const musicBoxStep = .53;
    const musicBoxFrequencies = musicBoxMelody.map((note) => 440 * Math.pow(2, (note - 69) / 12));

    function roseMarkup(x, y, scale, color) {
      const petals = Array.from({ length: 8 }, (_, index) =>
        `<ellipse cx="0" cy="-5.5" rx="3.1" ry="5" transform="rotate(${index * 45})" fill="${color}" opacity="${index % 2 ? ".86" : "1"}"/>`
      ).join("");
      return `<g transform="translate(${x} ${y}) scale(${scale})">
        <circle r="8.3" fill="${color}" opacity=".18"/>
        ${petals}
        <circle r="2.8" fill="#F8D77A"/>
        <circle r="1.25" fill="#9A5A36"/>
      </g>`;
    }

    function bouquetSvg(type, color, index) {
      const roseSpots = index % 2 === 0
        ? [[23, 31, .75], [45, 22, .9], [66, 31, .75], [34, 45, .68], [56, 45, .68]]
        : [[26, 29, .78], [46, 21, .92], [65, 30, .78], [37, 43, .76], [56, 43, .76], [47, 49, .6]];
      const flowers = roseSpots.map(([x, y, scale], position) =>
        roseMarkup(x, y, scale, roseColors[(index + position) % roseColors.length])
      ).join("");
      const leafMarkup = `
        <path d="M37 58 Q20 50 18 39 Q33 42 39 55Z" fill="${leafColors[index % leafColors.length]}"/>
        <path d="M53 59 Q69 49 72 39 Q58 42 51 56Z" fill="${leafColors[(index + 1) % leafColors.length]}"/>
        <path d="M42 63 Q31 53 32 44 Q43 49 45 61Z" fill="${leafColors[(index + 2) % leafColors.length]}"/>`;
      let wrap;
      if (type === "round") {
        wrap = `<path d="M13 49 Q45 58 77 49 L64 91 Q45 99 26 91Z" fill="#E9E1F1" stroke="#7A5197" stroke-width="1.5"/>
          <path d="M25 55 Q45 61 65 55 L58 89 Q45 94 32 89Z" fill="#FFF8F3" opacity=".8"/>`;
      } else if (type === "cone") {
        wrap = `<path d="M16 48 Q45 57 74 48 L56 94 Q45 99 34 94Z" fill="#F8B5A7" stroke="#E66D5E" stroke-width="1.5"/>
          <path d="M24 53 Q45 60 66 53 L55 90 Q45 94 35 90Z" fill="#FFF4E8" opacity=".84"/>`;
      } else if (type === "ribbon") {
        wrap = `<path d="M15 49 Q45 57 75 49 L61 91 Q45 98 29 91Z" fill="#BB5098" stroke="#87336C" stroke-width="1.5"/>
          <path d="M21 53 Q45 60 69 53 L59 87 Q45 93 31 87Z" fill="#F9EFF6" opacity=".75"/>
          <path d="M40 77 Q33 68 29 76 Q28 83 42 82 Q54 83 53 76 Q50 69 43 77Z" fill="#F5C842" stroke="#D09C38" stroke-width="1.2"/>
          <path d="M40 80 L36 94 L43 91 L46 95 L46 80Z" fill="#F5C842" stroke="#D09C38" stroke-width="1"/>`;
      } else if (type === "leafy") {
        wrap = `<path d="M14 48 Q45 58 76 48 L61 91 Q45 98 29 91Z" fill="#F5E63C" stroke="#D4BD37" stroke-width="1.5"/>
          <path d="M23 54 Q45 61 67 54 L58 88 Q45 94 32 88Z" fill="#FFF9DF" opacity=".8"/>`;
      } else {
        wrap = `<path d="M18 49 Q45 58 72 49 L59 92 Q45 98 31 92Z" fill="#F47F6B" stroke="#E66D5E" stroke-width="1.5"/>
          <path d="M25 54 Q45 61 65 54 L56 88 Q45 93 34 88Z" fill="#FFF4F0" opacity=".84"/>`;
      }
      const leaves = type === "leafy" ? leafMarkup + `
        <path d="M55 61 Q72 55 77 45 Q62 47 53 59Z" fill="${leafColors[(index + 1) % leafColors.length]}"/>` : "";
      return `<svg viewBox="0 0 90 100" role="presentation" aria-hidden="true">
        <g fill="none" stroke="#547957" stroke-width="1.8" stroke-linecap="round">
          <path d="M45 51 L45 79"/><path d="M34 47 L42 78"/><path d="M56 48 L48 78"/><path d="M24 40 L40 77"/><path d="M66 40 L50 77"/>
        </g>
        ${leafMarkup}${leaves}${flowers}${wrap}
        <path d="M37 89 Q45 84 53 89" fill="none" stroke="#7A5197" stroke-width="1.4" opacity=".75"/>
      </svg>`;
    }

    function spawnBouquet() {
      if (activeBouquets >= 10) return;
      const index = Math.floor(Math.random() * 1000);
      const type = bouquetTypes[index % bouquetTypes.length];
      const bouquet = document.createElement("button");
      bouquet.type = "button";
      bouquet.className = "falling-bouquet";
      bouquet.style.setProperty("--flower-left", `${Math.random() * 91 + 3}%`);
      bouquet.style.setProperty("--flower-top", `${Math.random() * 72 + 5}vh`);
      bouquet.style.setProperty("--fall-duration", `${reducedMotion ? 28 : 18 + Math.random() * 10}s`);
      bouquet.setAttribute("aria-label", "Bấm vào bó hoa để mở thiệp chúc mừng 20/11");
      bouquet.innerHTML = bouquetSvg(type, roseColors[index % roseColors.length], index);
      activeBouquets += 1;
      bouquet.addEventListener("click", (event) => {
        const bounds = bouquet.getBoundingClientRect();
        const x = event.clientX || bounds.left + bounds.width / 2;
        const y = event.clientY || bounds.top + bounds.height / 2;
        burstPetals(x, y);
        playCelebrationSound();
        bouquet.remove();
        activeBouquets -= 1;
        openGreeting(bouquet);
      });
      bouquet.addEventListener("animationend", (event) => {
        if (event.animationName !== "bouquet-fall") return;
        bouquet.remove();
        activeBouquets -= 1;
      }, { once: false });
      roseOverlay.appendChild(bouquet);
    }

    function burstPetals(x, y) {
      const colors = ["#9F1239", "#E879A9", "#F5C842", "#F47F6B", "#BB5098"];
      const count = 24 + Math.floor(Math.random() * 7);
      for (let index = 0; index < count; index += 1) {
        const petal = document.createElement("span");
        const angle = (Math.PI * 2 * index) / count + (Math.random() - .5) * .35;
        const distance = 55 + Math.random() * 125;
        petal.className = "rose-petal";
        petal.style.left = `${x}px`;
        petal.style.top = `${y}px`;
        petal.style.setProperty("--petal-color", colors[index % colors.length]);
        petal.style.setProperty("--petal-x", `${Math.cos(angle) * distance}px`);
        petal.style.setProperty("--petal-y", `${Math.sin(angle) * distance + 65}px`);
        petal.style.setProperty("--petal-rotate", `${Math.random() * 680 - 340}deg`);
        roseOverlay.appendChild(petal);
        petal.addEventListener("animationend", () => petal.remove(), { once: true });
        window.setTimeout(() => petal.remove(), 1800);
      }
    }

    function openGreeting(source) {
      lastFocusedElement = source;
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      greetingModal.classList.add("is-open");
      greetingModal.setAttribute("aria-hidden", "false");
      musicMuted = false;
      startMusicBox();
      window.setTimeout(() => document.getElementById("greeting-close").focus(), 30);
    }

    function closeGreeting() {
      if (!greetingModal.classList.contains("is-open")) return;
      stopMusicBox();
      greetingModal.classList.remove("is-open");
      greetingModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = previousBodyOverflow;
      if (lastFocusedElement && lastFocusedElement.isConnected) lastFocusedElement.focus();
    }

    function playCelebrationSound() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn("Web Audio API không được trình duyệt này hỗ trợ.");
        return;
      }
      try {
        audioContext = audioContext || new AudioContextClass();
        if (audioContext.state === "suspended") audioContext.resume();
        const now = audioContext.currentTime;
        const pop = audioContext.createOscillator();
        const popGain = audioContext.createGain();
        pop.type = "sine";
        pop.frequency.setValueAtTime(190, now);
        pop.frequency.exponentialRampToValueAtTime(58, now + .16);
        popGain.gain.setValueAtTime(.42, now);
        popGain.gain.exponentialRampToValueAtTime(.001, now + .19);
        pop.connect(popGain);
        popGain.connect(audioContext.destination);
        pop.start(now);
        pop.stop(now + .2);
        [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
          const start = now + .08 + index * .12;
          const bell = audioContext.createOscillator();
          const gain = audioContext.createGain();
          bell.type = "sine";
          bell.frequency.setValueAtTime(frequency, start);
          gain.gain.setValueAtTime(.0001, start);
          gain.gain.exponentialRampToValueAtTime(.13, start + .025);
          gain.gain.exponentialRampToValueAtTime(.001, start + .48);
          bell.connect(gain);
          gain.connect(audioContext.destination);
          bell.start(start);
          bell.stop(start + .5);
        });
      } catch (error) {
        console.error("Không thể phát hiệu ứng âm thanh chúc mừng.", error);
      }
    }

    function updateMusicControl() {
      musicToggle.classList.toggle("is-playing", musicPlaying);
      musicToggle.setAttribute("aria-pressed", String(musicPlaying));
      musicToggle.setAttribute("aria-label", musicPlaying ? "Tắt nhạc chúc mừng" : "Bật nhạc chúc mừng");
      musicLabel.textContent = musicPlaying ? "Đang phát nhạc" : "Bật nhạc";
    }

    function scheduleMusicNote(runId) {
      if (runId !== musicRunId || !musicPlaying || !musicMaster) return;
      const now = audioContext.currentTime;
      while (nextMusicNoteTime < now + .12) {
        const frequency = musicBoxFrequencies[musicNoteIndex];
        const noteStart = Math.max(nextMusicNoteTime, now + .015);
        const noteDuration = .42;
        const tone = audioContext.createOscillator();
        const overtone = audioContext.createOscillator();
        const noteGain = audioContext.createGain();
        const overtoneGain = audioContext.createGain();
        tone.type = "sine";
        overtone.type = "sine";
        tone.frequency.setValueAtTime(frequency, noteStart);
        overtone.frequency.setValueAtTime(frequency * 2.01, noteStart);
        noteGain.gain.setValueAtTime(.0001, noteStart);
        noteGain.gain.exponentialRampToValueAtTime(.32, noteStart + .012);
        noteGain.gain.exponentialRampToValueAtTime(.0001, noteStart + noteDuration);
        overtoneGain.gain.setValueAtTime(.0001, noteStart);
        overtoneGain.gain.exponentialRampToValueAtTime(.055, noteStart + .01);
        overtoneGain.gain.exponentialRampToValueAtTime(.0001, noteStart + .24);
        tone.connect(noteGain);
        noteGain.connect(musicMaster);
        overtone.connect(overtoneGain);
        overtoneGain.connect(musicMaster);
        tone.start(noteStart);
        overtone.start(noteStart);
        tone.stop(noteStart + noteDuration + .02);
        overtone.stop(noteStart + .26);
        nextMusicNoteTime += musicBoxStep;
        musicNoteIndex = (musicNoteIndex + 1) % musicBoxFrequencies.length;
      }
    }

    function startMusicBox() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn("Web Audio API không được trình duyệt này hỗ trợ.");
        musicPlaying = false;
        updateMusicControl();
        return;
      }
      try {
        audioContext = audioContext || new AudioContextClass();
        const runId = ++musicRunId;
        if (musicScheduler) window.clearInterval(musicScheduler);
        musicScheduler = null;
        if (audioContext.state === "suspended") audioContext.resume();
        if (musicMaster) musicMaster.disconnect();
        musicMaster = audioContext.createGain();
        musicMaster.gain.setValueAtTime(.0001, audioContext.currentTime);
        musicMaster.gain.linearRampToValueAtTime(.16, audioContext.currentTime + .12);
        musicMaster.connect(audioContext.destination);
        musicPlaying = true;
        musicNoteIndex = 0;
        nextMusicNoteTime = audioContext.currentTime + .04;
        updateMusicControl();
        scheduleMusicNote(runId);
        musicScheduler = window.setInterval(() => scheduleMusicNote(runId), 70);
      } catch (error) {
        musicPlaying = false;
        updateMusicControl();
        console.error("Không thể phát giai điệu chúc mừng bằng Web Audio API.", error);
      }
    }

    function stopMusicBox() {
      musicPlaying = false;
      musicRunId += 1;
      if (musicScheduler) window.clearInterval(musicScheduler);
      musicScheduler = null;
      updateMusicControl();
      if (!audioContext || !musicMaster) {
        musicNoteIndex = 0;
        return;
      }
      const masterToFade = musicMaster;
      const fadeStart = audioContext.currentTime;
      masterToFade.gain.cancelScheduledValues(fadeStart);
      masterToFade.gain.setValueAtTime(Math.max(masterToFade.gain.value, .0001), fadeStart);
      masterToFade.gain.linearRampToValueAtTime(.0001, fadeStart + .3);
      musicMaster = null;
      musicNoteIndex = 0;
      window.setTimeout(() => masterToFade.disconnect(), 350);
    }

    document.getElementById("greeting-close").addEventListener("click", closeGreeting);
    document.getElementById("greeting-close-action").addEventListener("click", closeGreeting);
    greetingModal.addEventListener("click", (event) => {
      if (event.target === greetingModal) closeGreeting();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeGreeting();
    });
    musicToggle.addEventListener("click", () => {
      if (musicPlaying) {
        musicMuted = true;
        stopMusicBox();
      } else {
        musicMuted = false;
        if (greetingModal.classList.contains("is-open")) startMusicBox();
      }
    });
    spawnBouquet();
    window.setInterval(spawnBouquet, reducedMotion ? 3600 : 2100);
});
