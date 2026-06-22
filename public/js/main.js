document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // ---- 每次換頁，整頁隨機套用同一種霓光顏色 ----
  const palette = [
    '#2dfcdc', // 青綠（Deku）
    '#ff7a30', // 橘紅（Bakugo）
    '#ff5c8a', // 粉紅
    '#9b6cff', // 紫
    '#ffd23f', // 金黃
    '#5c9bff', // 天藍
    '#7dff6c', // 螢光綠
    '#ff4d4d', // 火紅（Todoroki）
  ];
  const color = palette[Math.floor(Math.random() * palette.length)];
  const root = document.documentElement;
  root.style.setProperty('--dynamic', color);

  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  root.style.setProperty('--dynamic-glow', `rgba(${r}, ${g}, ${b}, 0.55)`);
});
