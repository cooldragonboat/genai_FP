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
    // 進入 iframe（如 Spotify 播放器）或離開視窗時隱藏，避免游標看起來卡住
    const hide = () => { glow.style.opacity = '0'; };
    const show = () => { glow.style.opacity = '1'; };
    window.addEventListener('blur', hide);
    document.addEventListener('mouseleave', hide);
    // hover 進 iframe 不會觸發上面事件，改用外層容器偵測
    document.querySelectorAll('iframe').forEach((f) => {
      const wrap = f.closest('.music-card') || f.parentElement || f;
      wrap.addEventListener('mouseenter', hide);
      wrap.addEventListener('mouseleave', show);
      f.addEventListener('mouseenter', hide);
    });
  }
});
