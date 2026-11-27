document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // 故障游標：跟隨滑鼠；移到 iframe（如 Spotify 播放器）或離開視窗時自動隱藏
  const glow = document.getElementById('cursorGlow');
  if (glow && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      glow.style.opacity = '1';
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
    // 進入 iframe 會讓視窗失焦；離開頁面也一樣 → 先隱藏，避免看起來卡住
    const hide = () => { glow.style.opacity = '0'; };
    window.addEventListener('blur', hide);
    document.addEventListener('mouseleave', hide);
  }
});
