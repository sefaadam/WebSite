/* ==========================================================================
   Sema & Mehmet - Nişan Davetiyesi Etkileşim Kodu (Kart Üstünden Akan Kalpler)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const foldedCard = document.getElementById('foldedCard');
  const unfoldBtn = document.getElementById('unfoldBtn');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const calendarBtn = document.getElementById('calendarBtn');

  let isUnfolded = false;
  let isAnimating = false;

  // 1. Katlanmış Kartı Açma / Kapatma (Butona Basınca Kart Üstünden Kalpler Akar)
  function toggleCardUnfold() {
    if (isAnimating) return;

    if (!isUnfolded) {
      isUnfolded = true;
      isAnimating = true;
      foldedCard.classList.remove('closing');
      foldedCard.classList.add('unfolded');
      
      const btnText = unfoldBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'Davetiyeyi Kapat';

      // Butona bastıktan sonra kart üstünden akan kalpleri başlat
      startHeartShower();

      playChimeSound();
      startAmbientMelody();

      setTimeout(() => {
        isAnimating = false;
      }, 400);
    } else {
      isUnfolded = false;
      isAnimating = true;
      
      const btnText = unfoldBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'Davetiyeyi Aç';

      // Kapanış Animasyonu Tetikle
      foldedCard.classList.add('closing');

      setTimeout(() => {
        foldedCard.classList.remove('unfolded');
        foldedCard.classList.remove('closing');
        isAnimating = false;
        stopHeartShower();
      }, 330);
    }
  }

  if (unfoldBtn) {
    unfoldBtn.addEventListener('click', toggleCardUnfold);
  }

  // 2. Yumuşak Çan Sesi (Web Audio)
  function playChimeSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + (idx * 0.08);
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.1, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.9);
      });
    } catch (e) {}
  }

  // 3. Arka Plan Dinlendirici Melodi (Hafif Synth - 15 Saniye Sınırlı)
  let audioContext = null;
  let isPlayingMelody = false;
  let melodyInterval = null;
  let melodyTimeout = null;

  function stopMelody() {
    isPlayingMelody = false;
    if (melodyInterval) clearInterval(melodyInterval);
    if (melodyTimeout) clearTimeout(melodyTimeout);
    if (audioContext) {
      try { audioContext.close(); } catch (e) {}
    }
    if (musicToggleBtn) {
      const btnText = musicToggleBtn.querySelector('.text');
      if (btnText) btnText.textContent = 'Müzik Çal 🎵';
    }
  }

  function startAmbientMelody() {
    if (isPlayingMelody) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext = new AudioCtx();
      isPlayingMelody = true;
      if (musicToggleBtn) {
        const btnText = musicToggleBtn.querySelector('.text');
        if (btnText) btnText.textContent = 'Müzik Durdur';
      }

      const sequence = [329.63, 392.00, 493.88, 523.25, 659.25, 523.25, 493.88, 392.00];
      let step = 0;

      melodyInterval = setInterval(() => {
        if (!isPlayingMelody || !audioContext) return;
        const freq = sequence[step % sequence.length];
        step++;

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.03, audioContext.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 1.6);
      }, 800);

      // 15 saniye sonra otomatik durdur
      if (melodyTimeout) clearTimeout(melodyTimeout);
      melodyTimeout = setTimeout(() => {
        stopMelody();
      }, 15000);

    } catch (e) {}
  }

  function toggleMelody() {
    if (isPlayingMelody) {
      stopMelody();
    } else {
      startAmbientMelody();
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', toggleMelody);
  }

  // 4. ANİMASYONLU GERİ SAYIM SAYACI (15 Ağustos 2026 19:00)
  const targetDate = new Date('2026-08-15T19:00:00').getTime();

  function updateAnimatedValue(elementId, newValue) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (el.textContent !== newValue) {
      el.textContent = newValue;
      el.classList.remove('tick-anim');
      void el.offsetWidth;
      el.classList.add('tick-anim');
    }
  }

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      updateAnimatedValue('days', '00');
      updateAnimatedValue('hours', '00');
      updateAnimatedValue('minutes', '00');
      updateAnimatedValue('seconds', '00');
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    updateAnimatedValue('days', String(days).padStart(2, '0'));
    updateAnimatedValue('hours', String(hours).padStart(2, '0'));
    updateAnimatedValue('minutes', String(minutes).padStart(2, '0'));
    updateAnimatedValue('seconds', String(seconds).padStart(2, '0'));
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 5. Takvime Ekle
  if (calendarBtn) {
    calendarBtn.addEventListener('click', () => {
      const title = encodeURIComponent('Sema & Mehmet Nişan Töreni');
      const details = encodeURIComponent('Birlikteliğe ilk adımı atacağımız bu mutlu günümüzde sizleri de aramızda görmekten onur duyacağız.');
      const location = encodeURIComponent('https://maps.app.goo.gl/9F5UjUFMxJ1BBvKx8?g_st=aw');
      const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20260815T160000Z/20260815T200000Z&details=${details}&location=${location}`;
      window.open(gCalUrl, '_blank');
    });
  }

  // 6. MOBİLDE KARTIN DOĞRUDAN ÜSTÜNDEN SÜZÜLEN ANİMASYONLU KALPLER DÖKÜMÜ
  initHeartEngine();
});

let isHeartShowerActive = false;
let heartAnimationFrame = null;

function startHeartShower() {
  if (isHeartShowerActive) return;
  isHeartShowerActive = true;
  requestAnimationFrame(animateHearts);
}

function stopHeartShower() {
  isHeartShowerActive = false;
  if (heartAnimationFrame) {
    cancelAnimationFrame(heartAnimationFrame);
  }
  const canvas = document.getElementById('petalCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

let animateHearts = () => {};

function initHeartEngine() {
  const canvas = document.getElementById('petalCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Kartın üstünden süzülen 10 adet zarif ve seyrek yaprak/kalp
  const particleCount = 10;
  const particles = [];

  class HeartParticle {
    constructor(index) {
      this.index = index;
      this.reset(true);
    }

    reset(firstTime = false) {
      // Tüm ekran genişliğine yayılarak kartın doğrudan üstünden akar
      this.x = Math.random() * width;
      this.y = firstTime ? Math.random() * height : -20 - Math.random() * 60;
      this.size = Math.random() * 9 + 6; // Zarif boyut
      this.speedY = Math.random() * 0.6 + 0.3; // Yavaş ve zarif düşüş
      this.speedX = Math.random() * 0.4 - 0.2;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 1.8 - 0.9;
      this.opacity = Math.random() * 0.55 + 0.35; // Mobilde cam gibi net görünürlük
      this.isHeart = Math.random() > 0.3; // %70 Kalp şekli

      const colors = [
        'rgba(235, 130, 148, ', // Canlı Pembe Kalp
        'rgba(215, 105, 125, ', // Romantik Gül Kırmızı
        'rgba(224, 165, 130, ', // Şampanya Altın Kalp
        'rgba(240, 182, 190, '  // Soft Pudra Pembe
      ];
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.012) * 0.8 + this.speedX;
      this.rotation += this.rotationSpeed;

      if (this.y > height + 20) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.colorBase + this.opacity + ')';

      if (this.isHeart) {
        // NET KALP ÇİZİMİ
        const s = this.size * 0.85;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-s / 2, -s / 2, -s, s / 3, 0, s);
        ctx.bezierCurveTo(s, s / 3, s / 2, -s / 2, 0, 0);
        ctx.fill();
      } else {
        // YUMUŞAK YAPRAK ÇİZİMİ
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size, -this.size, -this.size * 1.3, this.size / 2, 0, this.size * 1.4);
        ctx.bezierCurveTo(this.size * 1.3, this.size / 2, this.size, -this.size, 0, 0);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new HeartParticle(i));
  }

  let lastTime = 0;
  animateHearts = function(currentTime) {
    if (!isHeartShowerActive) return;

    // 30 FPS kare limitleme (Sıfır kasma, yüksek akıcılık)
    if (currentTime - lastTime > 30) {
      lastTime = currentTime;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
    }
    heartAnimationFrame = requestAnimationFrame(animateHearts);
  };
}
