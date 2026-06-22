document.addEventListener('DOMContentLoaded', () => {
  // ---- 手機選單開關 ----
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // ---- 每切換一個頁面，字體就換一種霓光顏色 ----
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
  let idx = parseInt(localStorage.getItem('themeColorIndex') || '-1', 10);
  idx = (idx + 1) % palette.length;
  localStorage.setItem('themeColorIndex', String(idx));

  const color = palette[idx];
  const root = document.documentElement;
  root.style.setProperty('--dynamic', color);
  // 轉成 rgba 給陰影用
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  root.style.setProperty('--dynamic-glow', `rgba(${r}, ${g}, ${b}, 0.55)`);
});
