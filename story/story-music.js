// ==========================================
// 동화책 전용 힐링 & 판타지 사운드 엔진
// (오르골 멜로디 BGM, 책장 넘김 효과음, 마법 차임벨)
// ==========================================
class StoryBGM {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.noteIndex = 0;

    // 따뜻하고 몽환적인 동화풍 오르골 멜로디 (C장조 펜타토닉 & 아르페지오)
    this.melody = [
      { f: 523.25, d: 450 }, // 도 (C5)
      { f: 659.25, d: 450 }, // 미 (E5)
      { f: 783.99, d: 450 }, // 솔 (G5)
      { f: 1046.50, d: 650 },// 높은 도 (C6)
      { f: 880.00, d: 450 }, // 라 (A5)
      { f: 783.99, d: 450 }, // 솔 (G5)
      { f: 659.25, d: 650 }, // 미 (E5)
      { f: 587.33, d: 450 }, // 레 (D5)
      { f: 659.25, d: 450 }, // 미 (E5)
      { f: 783.99, d: 750 }, // 솔 (G5)
      { f: 523.25, d: 900 }  // 도 (C5)
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 맑고 영롱한 오르골 건반음 연주
  playCelestaTone(freq, duration = 0.8, gainVal = 0.08) {
    if (!this.isPlaying) return;
    this.init();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // 영롱한 벨(Bell)/오르골 느낌을 주는 정현파 + 하모닉스
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  // 동화책 진입 축하 멜로디 시작
  start() {
    this.init();
    this.isPlaying = true;
    this.noteIndex = 0;
    this.playNextNote();
  }

  playNextNote() {
    if (!this.isPlaying) return;

    const note = this.melody[this.noteIndex];
    this.playCelestaTone(note.f, (note.d / 1000) * 1.5, 0.07);

    this.noteIndex = (this.noteIndex + 1) % this.melody.length;
    // 멜로디 끝나면 잠시 숨돌린 뒤 다시 은은하게 반복
    const wait = this.noteIndex === 0 ? 1800 : note.d;
    this.timer = setTimeout(() => this.playNextNote(), wait);
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  // 책장 넘길 때 나는 살랑바람 차임벨 소리
  playPageSound() {
    this.init();
    try {
      [880, 1046.5, 1318.5].forEach((freq, idx) => {
        setTimeout(() => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.3);
        }, idx * 70);
      });
    } catch (e) {}
  }
}

const storyBGM = new StoryBGM();

// 화면 우측 상단 플로팅 음악 On/Off 컨트롤러 생성
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.createElement('button');
  btn.id = 'story-bgm-btn';
  btn.innerHTML = '🎵 오르골 음악 켜기';
  btn.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 100;
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid rgba(139, 92, 246, 0.4);
    box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);
    backdrop-filter: blur(8px);
    color: #6d28d9;
    font-size: 13px;
    font-weight: 800;
    padding: 7px 14px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const active = storyBGM.toggle();
    if (active) {
      btn.innerHTML = '🎶 음악 연주 중 ⏸️';
      btn.style.background = '#ede9fe';
      btn.style.color = '#5b21b6';
    } else {
      btn.innerHTML = '🎵 오르골 음악 켜기';
      btn.style.background = 'rgba(255, 255, 255, 0.85)';
      btn.style.color = '#6d28d9';
    }
  });

  document.body.appendChild(btn);

  // 브라우저 첫 터치/클릭 시 자동 시작
  const firstPlayHandler = () => {
    if (!storyBGM.isPlaying) {
      storyBGM.start();
      btn.innerHTML = '🎶 음악 연주 중 ⏸️';
      btn.style.background = '#ede9fe';
      btn.style.color = '#5b21b6';
    }
    window.removeEventListener('click', firstPlayHandler);
    window.removeEventListener('scroll', firstPlayHandler);
  };

  window.addEventListener('click', firstPlayHandler, { once: true });
  window.addEventListener('scroll', firstPlayHandler, { once: true });
});
