/**
 * Sandhya Interactive Engine
 * Handles canvas ambient particles, scroll reveals, interactive mockup,
 * typewriter effects, and the Web Audio API soundscape synthesizer.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Update mock phone time to current local time in hh:mm format
  updateMockPhoneTime();
  setInterval(updateMockPhoneTime, 60000);

  // Initialize all subsystems
  initScrollReveal();
  initParticleSystem();
  initMockupController();
  initAudioSanctuary();
  initWordReveal();
  initScrollLock();
});

/**
 * Updates the simulated status bar time in the phone mockup
 */
function updateMockPhoneTime() {
  const timeEl = document.getElementById('mockup-time');
  if (!timeEl) return;
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  timeEl.textContent = `${hours}:${minutes}`;
}

/**
 * Scroll Reveal System for Block Elements
 */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  // Intersection Observer for scroll triggers
  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Trigger only once
      }
    });
  }, observerOptions);

  reveals.forEach(el => revealObserver.observe(el));
}

/**
 * HTML5 Canvas Floating Ambient Dust Particle System
 */
function initParticleSystem() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 50;

  // Set canvas size
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Particle Blueprint
  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = -(Math.random() * 0.25 + 0.05); // Slow upward float
      this.speedX = Math.random() * 0.15 - 0.075;   // Micro drifting
      this.opacity = Math.random() * 0.4 + 0.1;
      this.fadeSpeed = Math.random() * 0.002 + 0.001;
      this.wobbleSpeed = Math.random() * 0.01 + 0.005;
      this.wobbleDistance = Math.random() * 1.5;
      this.wobbleAngle = Math.random() * Math.PI * 2;
    }

    update() {
      this.y += this.speedY;
      this.wobbleAngle += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.wobbleAngle) * (this.wobbleDistance * 0.05);

      // Fade out as it rises near the top
      if (this.y < canvas.height * 0.2) {
        this.opacity -= this.fadeSpeed * 3;
      }

      // Reset when off screen or fully faded
      if (this.y < -10 || this.opacity <= 0) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      // Soft glowing warm gold color (#C2A370 / #D4A373)
      ctx.fillStyle = `rgba(212, 163, 112, ${this.opacity})`;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Populate particles array
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/**
 * Dynamic Mockup swap & interactive animations
 */
function initMockupController() {
  const wrapper = document.querySelector('.experience-sticky-wrapper');
  const items = document.querySelectorAll('.experience-item');
  const screens = document.querySelectorAll('.app-content');
  const mobileTexts = document.querySelectorAll('.mobile-text-item');
  const grid = document.querySelector('.experience-grid');

  if (!wrapper || items.length === 0) return;

  let reflectionTimer = null;
  let timerInterval = null;
  let activeIndex = 0;
  let rotationInterval = null;
  let resumeTimer = null;

  function setActiveStep(index) {
    activeIndex = index;

    // 0. Update grid active step class for CSS transitions
    if (grid) {
      items.forEach((_, idx) => {
        grid.classList.remove(`active-step-${idx}`);
      });
      grid.classList.add(`active-step-${index}`);
    }

    // 1. Highlight desktop list items
    items.forEach((item, idx) => {
      if (idx === index) {
        item.classList.add('active');
        item.setAttribute('aria-expanded', 'true');
      } else {
        item.classList.remove('active');
        item.setAttribute('aria-expanded', 'false');
      }
    });

    // 2. Transition phone mockup screens
    screens.forEach((screen, idx) => {
      if (idx === index) {
        screen.classList.add('active');
        triggerSpecialScreenAnimation(screen.getAttribute('id').replace('screen-', ''), screen);
      } else {
        screen.classList.remove('active');
      }
    });

    // 3. Transition mobile text blocks
    mobileTexts.forEach((text, idx) => {
      if (idx === index) {
        text.classList.add('active');
      } else {
        text.classList.remove('active');
      }
    });
  }

  function startAutoRotation() {
    if (rotationInterval) clearInterval(rotationInterval);
    rotationInterval = setInterval(() => {
      let nextIndex = (activeIndex + 1) % items.length;
      setActiveStep(nextIndex);
    }, 4000);
  }

  function stopAutoRotation() {
    if (rotationInterval) {
      clearInterval(rotationInterval);
      rotationInterval = null;
    }
    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }
  }

  function startAutoRotationWithDelay() {
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      startAutoRotation();
    }, 6000);
  }

  // Bind hover (mouseenter) and click listeners
  items.forEach((item, idx) => {
    item.addEventListener('mouseenter', () => {
      stopAutoRotation();
      setActiveStep(idx);
    });

    item.addEventListener('mouseleave', () => {
      startAutoRotation();
    });

    item.addEventListener('click', (e) => {
      e.preventDefault();
      stopAutoRotation();
      setActiveStep(idx);
      startAutoRotationWithDelay();
    });
  });

  // Bind click/tap on the mockup itself (great for mobile)
  const mockupEl = document.querySelector('.phone-mockup');
  if (mockupEl) {
    mockupEl.addEventListener('click', () => {
      stopAutoRotation();
      let nextIndex = (activeIndex + 1) % items.length;
      setActiveStep(nextIndex);
      startAutoRotationWithDelay();
    });
  }

  // Initial setup: activate the first item and start auto rotation
  setActiveStep(0);
  startAutoRotation();

  // Unique trigger setups for each preview screen
  function triggerSpecialScreenAnimation(screenName, element) {
    // Stop ongoing reflection typewriter animations
    if (reflectionTimer) {
      clearInterval(reflectionTimer);
      reflectionTimer = null;
    }
    // Stop ongoing meditation timers
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    if (screenName === 'sadhana') {
      // Start meditation countdown timer and animate circle
      const countdownEl = element.querySelector('.timer-countdown');
      const progressCircle = element.querySelector('#timer-progress');
      if (!countdownEl) return;

      let secondsLeft = 24 * 60; // 24 minutes
      countdownEl.textContent = "24:00";

      if (progressCircle) {
        progressCircle.style.transition = 'none';
        progressCircle.style.strokeDashoffset = '283';
        progressCircle.getBoundingClientRect(); // force reflow
        progressCircle.style.transition = 'stroke-dashoffset 1440s linear';
        progressCircle.style.strokeDashoffset = '0';
      }

      timerInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
          clearInterval(timerInterval);
          secondsLeft = 0;
        }
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        countdownEl.textContent = `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
      }, 1000);

    } else if (screenName === 'reflection') {
      // Trigger typewriter effect on reflection box
      const textContainer = document.getElementById('typewriter-text');
      if (textContainer) {
        const fullText = "Today I felt a profound sense of clarity during Brahma Muhurta. The morning air was cool, and the stillness was absolutely sacred...";
        textContainer.innerHTML = `<span class="reflection-cursor"></span>`;
        let charIndex = 0;

        reflectionTimer = setInterval(() => {
          if (charIndex < fullText.length) {
            textContainer.innerHTML = fullText.slice(0, charIndex + 1) + `<span class="reflection-cursor"></span>`;
            charIndex++;
          } else {
            clearInterval(reflectionTimer);
          }
        }, 40);
      }
    }
  }

}

/**
 * Web Audio API Soundscape Synthesizer
 * Generates an immersive, warm binaural meditation drone and organic wind sweep.
 * No external assets required! Pure code-based digital sanctuary.
 */
function initAudioSanctuary() {
  const toggleBtn = document.getElementById('audio-toggle');
  const statusText = document.getElementById('audio-status-text');
  if (!toggleBtn) return;

  let audioCtx = null;
  let masterGain = null;
  let windFilter = null;
  let osc1 = null, osc2 = null;
  let noiseNode = null;
  let windLFO = null;
  let bowlInterval = null;
  let isPlaying = false;

  toggleBtn.addEventListener('click', () => {
    if (!isPlaying) {
      startSoundscape();
    } else {
      stopSoundscape();
    }
  });

  function startSoundscape() {
    try {
      // 1. Initialize AudioContext
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();

      // 2. Setup Master volume with smooth ramp
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Fade in master volume over 2.5 seconds
      masterGain.gain.linearRampToValueAtTime(0.35, audioCtx.currentTime + 2.5);

      // 3. SYNTHESIZE BINAURAL DRONE (Deep meditation base - 110Hz + 111.5Hz for a 1.5Hz Theta Beat)
      // Left ear channel oscillator
      const pannerLeft = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
      if (pannerLeft) pannerLeft.pan.setValueAtTime(-0.8, audioCtx.currentTime);

      osc1 = audioCtx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, audioCtx.currentTime); // A2 fundamental

      const osc1Gain = audioCtx.createGain();
      osc1Gain.gain.setValueAtTime(0.4, audioCtx.currentTime);

      osc1.connect(osc1Gain);
      if (pannerLeft) {
        osc1Gain.connect(pannerLeft);
        pannerLeft.connect(masterGain);
      } else {
        osc1Gain.connect(masterGain);
      }

      // Right ear channel oscillator
      const pannerRight = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
      if (pannerRight) pannerRight.pan.setValueAtTime(0.8, audioCtx.currentTime);

      osc2 = audioCtx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(111.5, audioCtx.currentTime); // Binaural beat delta

      const osc2Gain = audioCtx.createGain();
      osc2Gain.gain.setValueAtTime(0.4, audioCtx.currentTime);

      osc2.connect(osc2Gain);
      if (pannerRight) {
        osc2Gain.connect(pannerRight);
        pannerRight.connect(masterGain);
      } else {
        osc2Gain.connect(masterGain);
      }

      // Start drone oscillators
      osc1.start(0);
      osc2.start(0);

      // 4. SYNTHESIZE ORGANIC WIND/ATMOSPHERE (White noise bandpassed by a slow LFO)
      const bufferSize = 2 * audioCtx.sampleRate;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      noiseNode = audioCtx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      // Filter to simulate soft morning air movement
      windFilter = audioCtx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.Q.setValueAtTime(4, audioCtx.currentTime);
      windFilter.frequency.setValueAtTime(500, audioCtx.currentTime);

      const windGain = audioCtx.createGain();
      windGain.gain.setValueAtTime(0.12, audioCtx.currentTime);

      noiseNode.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);

      // LFO to sweep the filter frequency slowly (breathing effect)
      windLFO = audioCtx.createOscillator();
      windLFO.frequency.setValueAtTime(0.08, audioCtx.currentTime); // Very slow sweep (12s cycle)

      const lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(250, audioCtx.currentTime); // Sweep radius (500Hz +/- 250Hz)

      windLFO.connect(lfoGain);
      lfoGain.connect(windFilter.frequency);

      noiseNode.start(0);
      windLFO.start(0);

      // 5. TRIGGER TIBETAN CHIME / SINGING BOWL (Triggered every 16 seconds)
      triggerTibetanBowl(); // First strike instantly
      bowlInterval = setInterval(triggerTibetanBowl, 16000);

      // UI state transition
      isPlaying = true;
      toggleBtn.classList.add('active');
      statusText.textContent = "Sanctuary Active";
    } catch (e) {
      console.warn("Web Audio API failed or blocked: ", e);
    }
  }

  function triggerTibetanBowl() {
    if (!audioCtx || audioCtx.state === 'suspended') return;

    const frequencies = [220, 330, 440, 660]; // Harmonies for a perfect Vedic fifth
    const now = audioCtx.currentTime;

    frequencies.forEach((freq, idx) => {
      const chimeOsc = audioCtx.createOscillator();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, now);

      const chimeGain = audioCtx.createGain();
      // Drop volume for higher harmonics
      const volume = idx === 0 ? 0.08 : idx === 1 ? 0.05 : 0.02;
      chimeGain.gain.setValueAtTime(0, now);

      // Fast strike attack, ultra slow decay (luxury chime fade-out)
      chimeGain.gain.linearRampToValueAtTime(volume, now + 0.1);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 9 - (idx * 0.5));

      chimeOsc.connect(chimeGain);
      chimeGain.connect(masterGain);

      chimeOsc.start(now);
      chimeOsc.stop(now + 9.5);
    });
  }

  function stopSoundscape() {
    if (!audioCtx) return;

    // Smoothly ramp out volume before closing contexts to avoid popping sounds
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.8);

    setTimeout(() => {
      if (osc1) { osc1.stop(); osc1.disconnect(); }
      if (osc2) { osc2.stop(); osc2.disconnect(); }
      if (noiseNode) { noiseNode.stop(); noiseNode.disconnect(); }
      if (windLFO) { windLFO.stop(); windLFO.disconnect(); }
      if (bowlInterval) clearInterval(bowlInterval);

      if (audioCtx) audioCtx.close();

      audioCtx = null;
      isPlaying = false;
      toggleBtn.classList.remove('active');
      statusText.textContent = "Audio Sanctuary";
    }, 1900);
  }
}

/**
 * Word Splitter and Delayed Cascade Reveal System
 * Splits text into individual spans and applies sequential transitions.
 */
function initWordReveal() {
  const revealElements = document.querySelectorAll('.reveal-words');

  revealElements.forEach(el => {
    const text = el.textContent.trim();
    // Split by whitespace
    const words = text.split(/\s+/);

    el.innerHTML = words.map((word, idx) => {
      // Calculate delay (40ms cascade increment per word)
      const delay = idx * 40;
      return `<span class="word" style="transition-delay: ${delay}ms;">${word}</span>`;
    }).join(' ');
  });

  // Re-observe these elements now that they contain words
  const observerOptions = {
    root: null,
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px'
  };

  const wordObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    // If the element is part of the hero section, reveal it immediately on page load
    if (el.closest('.hero')) {
      setTimeout(() => {
        el.classList.add('active');
      }, 150);
    } else {
      // Otherwise, let the scroll observer reveal it
      wordObserver.observe(el);
    }
  });
}

/**
 * Scroll Lock / Snap Controller
 * Implements full page scroll hijacking where user scrolling locks into
 * individual sections sequentially and centers them on the viewport.
 */
function initScrollLock() {
  // Disable native snap alignments to prevent conflicts
  document.querySelectorAll('section, footer').forEach(el => {
    el.style.scrollSnapAlign = 'none';
  });

  const sections = Array.from(document.querySelectorAll('section'));
  let currentSectionIndex = 0;
  let isAnimating = false;

  // Find initial active section based on current scroll position
  function updateIndexFromScroll() {
    const currentScroll = window.pageYOffset;
    const viewportCenter = currentScroll + (window.innerHeight / 2);
    
    let closestIndex = 0;
    let minDistance = Infinity;
    
    sections.forEach((section, idx) => {
      const sectionCenter = section.offsetTop + (section.offsetHeight / 2);
      const distance = Math.abs(viewportCenter - sectionCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });
    
    currentSectionIndex = closestIndex;
  }
  
  updateIndexFromScroll();

  function easeInOutCubic(t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t*t + b;
    t -= 2;
    return c/2*(t*t*t + 2) + b;
  }

  function scrollToPosition(targetY, duration = 1200, callback) {
    const startY = window.pageYOffset;
    const difference = targetY - startY;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutCubic(timeElapsed, startY, difference, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.scrollTo(0, targetY);
        if (callback) callback();
      }
    }

    requestAnimationFrame(animation);
  }

  function goToSection(index) {
    if (isAnimating) return;
    if (index < 0 || index >= sections.length) return;

    isAnimating = true;
    currentSectionIndex = index;

    const targetSection = sections[index];
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    let targetScroll;
    // If it's the last section (closing-cta / footer), scroll all the way to bottom
    if (index === sections.length - 1) {
      targetScroll = maxScroll;
    } else {
      targetScroll = targetSection.offsetTop + (targetSection.offsetHeight / 2) - (window.innerHeight / 2);
      targetScroll = Math.max(0, Math.min(maxScroll, targetScroll));
    }

    scrollToPosition(targetScroll, 1200, () => {
      isAnimating = false;
    });
  }

  // 1. Mouse Wheel Handler (block scroll hijacking delta threshold)
  window.addEventListener('wheel', (e) => {
    e.preventDefault();

    if (isAnimating) return;

    if (Math.abs(e.deltaY) < 15) return;

    if (e.deltaY > 0) {
      if (currentSectionIndex < sections.length - 1) {
        goToSection(currentSectionIndex + 1);
      }
    } else {
      if (currentSectionIndex > 0) {
        goToSection(currentSectionIndex - 1);
      }
    }
  }, { passive: false });

  // 2. Mobile Touch Swipe Handler
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    if (isAnimating) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffY) > 50) {
      if (diffY > 0) {
        if (currentSectionIndex < sections.length - 1) {
          goToSection(currentSectionIndex + 1);
        }
      } else {
        if (currentSectionIndex > 0) {
          goToSection(currentSectionIndex - 1);
        }
      }
    }
  }, { passive: true });

  // 3. Keyboard Handler (Arrow keys, space, page up/down)
  window.addEventListener('keydown', (e) => {
    // Exclude typing inside form fields
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }

    const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' '];
    if (keys.includes(e.key)) {
      e.preventDefault();
      if (isAnimating) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        if (currentSectionIndex < sections.length - 1) {
          goToSection(currentSectionIndex + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentSectionIndex > 0) {
          goToSection(currentSectionIndex - 1);
        }
      }
    }
  }, { passive: false });

  // 4. Intercept clicks on links to keep current index synced
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        let targetIndex = -1;
        sections.forEach((sec, idx) => {
          if (sec === targetElement || sec.contains(targetElement)) {
            targetIndex = idx;
          }
        });

        if (targetIndex !== -1) {
          goToSection(targetIndex);
        }
      }
    });
  });

  // 5. Update index after viewport resizing
  window.addEventListener('resize', () => {
    if (!isAnimating) {
      updateIndexFromScroll();
    }
  });
}


