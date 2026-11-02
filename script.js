/**
 * Undangan Digital Metatah (Mepandes) Khas Bali - Aesthetic Mobile Edition
 * Client Data: Banjar Pidpid Kaler Dauh Margi
 * 6 Peserta: Wahyu Sawitri, Triwikrama Wahyu Pusar Buana, Maha Yagi,
 * Ni Kadek Vina Ganaki Uma Prasada Nalini, I Kadek Dharma Negara, I Kadek Agus Budi Darma Tatar
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. CONFIGURATION & STATE
  // ==========================================
  const CONFIG = {
    // WhatsApp penerima konfirmasi RSVP (ganti dengan nomor asli berawalan 62)
    whatsappNumber: '6281234567890',
    // Tanggal Acara Metatah: Minggu, 15 November 2026 pukul 15.00 WITA
    eventDate: '2026-11-15T15:00:00+08:00',
    eventDetails: {
      title: 'Upacara Metatah (Mepandes) - Banjar Pidpid Kaler Dauh Margi',
      location: 'Banjar Pidpid Kaler Dauh Margi, Bali',
      description: 'Upacara Manusa Yadnya Metatah (Mepandes / Potong Gigi) putra-putri kami.',
    }
  };

  // State
  let isMusicPlaying = false;
  let audioContext = null;
  let rindikTimer = null;

  // DOM Elements
  const invitationCover = document.getElementById('invitation-cover');
  const btnOpen = document.getElementById('btn-open-invitation');
  const guestNameElement = document.getElementById('guest-name');
  const bgAudio = document.getElementById('bg-audio');
  const btnMusicToggle = document.getElementById('btn-music-toggle');
  const musicBars = document.getElementById('music-bars');
  const musicIcon = document.getElementById('music-icon');
  const bottomNavbar = document.getElementById('bottom-navbar');
  const rsvpForm = document.getElementById('rsvp-form');
  const guestbookList = document.getElementById('guestbook-list');
  const toast = document.getElementById('copy-toast');
  const toastMessage = document.getElementById('toast-message');

  // ==========================================
  // 2. QUERY PARAMETER (NAMA TAMU OTOMATIS)
  // ==========================================
  function setupGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const guest = urlParams.get('to') || urlParams.get('u') || urlParams.get('nama');
    if (guest && guestNameElement) {
      guestNameElement.textContent = guest.trim();
    }
  }
  setupGuestName();

  // ==========================================
  // 3. BUKA UNDANGAN & UNLOCK SCROLL
  // ==========================================
  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      document.body.classList.remove('overflow-hidden');
      document.body.classList.add('overflow-y-auto');

      if (invitationCover) {
        invitationCover.classList.add('opacity-0', '-translate-y-full', 'pointer-events-none');
        setTimeout(() => {
          invitationCover.style.display = 'none';
        }, 900);
      }

      if (btnMusicToggle) {
        btnMusicToggle.classList.remove('-translate-y-24', 'opacity-0');
      }
      if (bottomNavbar) {
        bottomNavbar.classList.remove('translate-y-24', 'opacity-0');
      }

      playAudio();
      initScrollReveal();

      const openingSection = document.getElementById('opening-section');
      if (openingSection) {
        setTimeout(() => {
          openingSection.scrollIntoView({ behavior: 'smooth' });
        }, 400);
      }
    });
  }

  // ==========================================
  // 4. BALINESE RINDIK AUDIO & SYNTHESIZER
  // ==========================================
  const SELISIR_FREQS = [277.18, 293.66, 369.99, 415.30, 440.00, 554.37, 587.33];

  function playRindikBambooTone(freq, time, duration = 1.2) {
    if (!audioContext) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 3.84, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(0.22, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      gain2.gain.setValueAtTime(0.001, time);
      gain2.gain.exponentialRampToValueAtTime(0.06, time + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.0001, time + (duration * 0.4));

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(audioContext.destination);
      gain2.connect(audioContext.destination);

      osc.start(time);
      osc2.start(time);
      osc.stop(time + duration);
      osc2.stop(time + duration);
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  }

  function startRindikSynthesizer() {
    if (rindikTimer) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioContext) {
        audioContext = new AudioCtx();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      let step = 0;
      const melodyPattern = [0, 2, 4, 3, 1, 3, 2, 4, 1, 2, 3, 0, 4, 3, 2, 1];
      
      rindikTimer = setInterval(() => {
        if (!isMusicPlaying) return;
        const now = audioContext.currentTime;
        const noteIdx = melodyPattern[step % melodyPattern.length];
        const freq = SELISIR_FREQS[noteIdx % SELISIR_FREQS.length];
        
        playRindikBambooTone(freq, now, 1.4);
        
        if (step % 2 === 0) {
          const harmIdx = (noteIdx + 2) % SELISIR_FREQS.length;
          playRindikBambooTone(SELISIR_FREQS[harmIdx], now + 0.12, 1.0);
        }
        
        step++;
      }, 380);
    } catch (err) {
      console.warn('Could not initialize Web Audio Rindik:', err);
    }
  }

  function stopRindikSynthesizer() {
    if (rindikTimer) {
      clearInterval(rindikTimer);
      rindikTimer = null;
    }
  }

  function playAudio() {
    isMusicPlaying = true;
    updateMusicUI(true);

    if (bgAudio) {
      bgAudio.volume = 0.55;
      const playPromise = bgAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {}).catch(() => {
          startRindikSynthesizer();
        });
      }
    } else {
      startRindikSynthesizer();
    }
  }

  function pauseAudio() {
    isMusicPlaying = false;
    updateMusicUI(false);
    if (bgAudio) {
      bgAudio.pause();
    }
    stopRindikSynthesizer();
  }

  function updateMusicUI(playing) {
    if (musicBars) {
      if (playing) {
        musicBars.classList.add('playing');
        musicBars.classList.remove('opacity-40');
      } else {
        musicBars.classList.remove('playing');
        musicBars.classList.add('opacity-40');
      }
    }
    if (musicIcon) {
      if (playing) {
        musicIcon.classList.remove('fa-play');
        musicIcon.classList.add('fa-pause');
      } else {
        musicIcon.classList.remove('fa-pause');
        musicIcon.classList.add('fa-play');
      }
    }
  }

  if (btnMusicToggle) {
    btnMusicToggle.addEventListener('click', () => {
      if (isMusicPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
    });
  }

  // ==========================================
  // 5. COUNTDOWN TIMER (MINGGU, 15 NOVEMBER 2026)
  // ==========================================
  function initCountdown() {
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    const targetTime = new Date(CONFIG.eventDate).getTime();

    function update() {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance < 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minutesEl.textContent = String(minutes).padStart(2, '0');
      secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }
  initCountdown();

  // ==========================================
  // 6. FORM RSVP & WHATSAPP GENERATOR
  // ==========================================
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nama = document.getElementById('rsvp-name')?.value.trim();
      const jumlah = document.getElementById('rsvp-guests')?.value;
      const status = document.querySelector('input[name="attendance"]:checked')?.value || 'Hadir';
      const pesan = document.getElementById('rsvp-message')?.value.trim() || '-';

      if (!nama) {
        showToast('Mohon masukkan nama lengkap Anda.', 'warning');
        return;
      }

      const waMessage = 
`*KONFIRMASI KEHADIRAN METATAH (MEPANDES)*
Om Swastiastu,

Saya bermaksud mengonfirmasi kehadiran untuk Upacara Metatah di Banjar Pidpid Kaler Dauh Margi:
• *Nama*: ${nama}
• *Status Kehadiran*: ${status}
• *Jumlah Tamu*: ${jumlah} Orang
• *Doa & Ucapan*: "${pesan}"

Matur Suksma 🙏
Keluarga Besar Sang Mepandes`;

      saveGuestbookEntry({
        name: nama,
        status: status,
        guests: jumlah,
        message: pesan,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      });

      rsvpForm.reset();
      showToast('Membuka WhatsApp untuk mengirim konfirmasi...', 'success');

      const waUrl = `https://api.whatsapp.com/send?phone=${CONFIG.whatsappNumber}&text=${encodeURIComponent(waMessage)}`;
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 700);
    });
  }

  // ==========================================
  // 7. BUKU TAMU & UCAPAN RESTU
  // ==========================================
  const DEFAULT_GUESTBOOK = [
    {
      name: 'I Wayan Sudarsana & Keluarga',
      status: 'Hadir',
      guests: '2',
      message: 'Om Swastiastu. Rahajeng ngemargiang Upacara Metatah anggen Wahyu Sawitri, Triwikrama, Maha Yagi, Vina Ganaki, Dharma Negara, & Budi Darma. Dumogi labda karya tur rahayu.',
      date: 'Hari ini'
    },
    {
      name: 'Ni Luh Made Suartini',
      status: 'Hadir',
      guests: '2',
      message: 'Selamat memasuki kedewasaan. Dumogi Ida Sang Hyang Widhi senantiasa mapaica karahayuan ring Banjar Pidpid Kaler.',
      date: 'Kemarin'
    },
    {
      name: 'I Ketut Putra & Keluarga',
      status: 'Hadir',
      guests: '3',
      message: 'Dumogi upacara presida memargi antar tur labda karya. Rahayu sareng sami sekeluarga agung.',
      date: '2 hari lalu'
    }
  ];

  function getGuestbookEntries() {
    try {
      const stored = localStorage.getItem('metatah_pidpid_guestbook');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading localStorage:', e);
    }
    return DEFAULT_GUESTBOOK;
  }

  function saveGuestbookEntry(entry) {
    try {
      const current = getGuestbookEntries();
      current.unshift(entry);
      localStorage.setItem('metatah_pidpid_guestbook', JSON.stringify(current));
      renderGuestbook();
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }

  function renderGuestbook() {
    if (!guestbookList) return;
    const entries = getGuestbookEntries();
    guestbookList.innerHTML = entries.map(item => `
      <div class="p-3.5 rounded-2xl border border-champagne-300/60 bg-white/80 backdrop-blur-sm shadow-xs transition-all hover:border-champagne-500/50">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-champagne-100 border border-champagne-300 text-stone-700 flex items-center justify-center font-editorial font-bold text-xs shadow-2xs">
              ${item.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h5 class="text-xs font-semibold text-stone-800 font-sans leading-tight">${escapeHTML(item.name)}</h5>
              <span class="text-[9px] text-stone-400 font-sans">${item.date}</span>
            </div>
          </div>
          <span class="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
            item.status.includes('Hadir') && !item.status.includes('Tidak')
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-stone-100 text-stone-600 border border-stone-200'
          }">
            ${escapeHTML(item.status)}
          </span>
        </div>
        <p class="text-[11px] text-stone-600 leading-relaxed font-sans italic pl-9">
          "${escapeHTML(item.message)}"
        </p>
      </div>
    `).join('');
  }
  renderGuestbook();

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // ==========================================
  // 8. CLIPBOARD COPY UTILITY
  // ==========================================
  window.copyToClipboard = function(text, label = 'Nomor rekening') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`${label} berhasil disalin!`, 'success');
      }).catch(() => {
        fallbackCopy(text, label);
      });
    } else {
      fallbackCopy(text, label);
    }
  };

  function fallbackCopy(text, label) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(`${label} berhasil disalin!`, 'success');
    } catch (err) {
      showToast('Gagal menyalin teks.', 'error');
    }
    document.body.removeChild(textArea);
  }

  let toastTimer = null;
  function showToast(message, type = 'info') {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;

    toast.classList.remove('opacity-0', 'translate-y-8', 'pointer-events-none');
    toast.classList.add('opacity-100', 'translate-y-0');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'translate-y-8', 'pointer-events-none');
    }, 3200);
  }

  // ==========================================
  // 9. GOOGLE CALENDAR
  // ==========================================
  window.addToGoogleCalendar = function() {
    const startTime = '20261115T070000Z'; // 15.00 WITA = 07.00 UTC
    const endTime = '20261115T140000Z';
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CONFIG.eventDetails.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(CONFIG.eventDetails.description)}&location=${encodeURIComponent(CONFIG.eventDetails.location)}`;
    window.open(url, '_blank');
  };

  // ==========================================
  // 10. CONTINUOUS SCROLL REVEAL
  // ==========================================
  function initScrollReveal() {
    // Kumpulkan semua elemen dalam section yang belum punya kelas reveal
    // dan tandai dengan data-reveal supaya bisa dilacak
    document.querySelectorAll('section *').forEach(el => {
      if (!Array.from(el.classList).some(cls => cls.startsWith('reveal'))) {
        el.setAttribute('data-reveal', 'up');
        // Set state awal tersembunyi via inline style (bypass Tailwind override)
        el.style.opacity = '0';
        el.style.transform = 'translateY(35px)';
        el.style.filter = 'blur(3px)';
        el.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out, filter 0.7s ease-out';
      }
    });
    // Elemen yang sudah punya kelas reveal (manual di HTML) juga set inline style
    document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-zoom, .reveal-flip').forEach(el => {
      if (!el.getAttribute('data-reveal')) {
        el.setAttribute('data-reveal', 'yes');
        el.style.opacity = '0';
        el.style.transform = 'translateY(35px)';
        el.style.filter = 'blur(3px)';
        el.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out, filter 0.7s ease-out';
      }
    });

    // Cek visibilitas semua elemen [data-reveal] pakai getBoundingClientRect
    function checkReveals() {
      const allReveals = document.querySelectorAll('[data-reveal]');
      const vh = window.innerHeight;
      allReveals.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.92 && rect.bottom > 0) {
          // Tampak – animasikan masuk
          el.style.opacity = '1';
          el.style.transform = 'translateY(0) scale(1)';
          el.style.filter = 'blur(0px)';
        } else {
          // Keluar viewport – reset supaya animasi muncul lagi saat scroll balik
          el.style.opacity = '0';
          el.style.transform = 'translateY(35px)';
          el.style.filter = 'blur(3px)';
        }
      });
    }

    checkReveals(); // Jalankan pertama kali
    window._checkReveals = checkReveals;
  }

  const sections = document.querySelectorAll('section[id], header[id], footer[id]');
  const navItems = document.querySelectorAll('.nav-item');
  const scrollFill = document.getElementById('scroll-progress-fill');

  window.addEventListener('scroll', () => {
    // 1. Scroll Progress Indicator Bar
    if (scrollFill) {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollTotal > 0) {
        const progress = (window.scrollY / scrollTotal) * 100;
        scrollFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }
    }

    // 2. Scroll Reveal – cek semua elemen setiap kali scroll
    if (window._checkReveals) window._checkReveals();

    // 3. Bottom Navbar Active Tab Sync
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      const href = item.getAttribute('href')?.replace('#', '');
      if (href === current) {
        item.classList.add('active');
      }
    });
  });

  if (!invitationCover || invitationCover.style.display === 'none') {
    initScrollReveal();
  }
});
