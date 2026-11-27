document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // 故障游標：跟隨滑鼠；移到 iframe（如 Spotify 播放器）區域或離開視窗時自動隱藏
  const glow = document.getElementById('cursorGlow');
  if (glow && window.matchMedia('(pointer: fine)').matches) {
    let overEmbed = false; // 滑鼠是否在播放器/iframe 區域內
    window.addEventListener('mousemove', (e) => {
      if (overEmbed) { glow.style.opacity = '0'; return; }
      glow.style.opacity = '1';
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
    window.addEventListener('blur', () => { glow.style.opacity = '0'; });
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
    // 進入 iframe 外層容器就標記，區域內一律隱藏；離開才恢復
    document.querySelectorAll('iframe').forEach((f) => {
      const wrap = f.closest('.music-card') || f.parentElement || f;
      wrap.addEventListener('mouseenter', () => { overEmbed = true; glow.style.opacity = '0'; });
      wrap.addEventListener('mouseleave', () => { overEmbed = false; });
    });
  }
});
