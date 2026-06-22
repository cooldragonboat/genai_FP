const bcrypt = require('bcryptjs');
const db = require('./db');

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (userCount === 0) {
    const adminHash = bcrypt.hashSync('admin1234', 10);
    const userHash = bcrypt.hashSync('user1234', 10);
    db.prepare(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).run('admin', 'admin@example.com', adminHash, 'admin');
    db.prepare(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).run('小火', 'demo@example.com', userHash, 'user');
    console.log('已建立帳號: admin/admin1234 (管理員), 小火/user1234 (一般使用者)');
  }

  const articleCount = db.prepare('SELECT COUNT(*) AS c FROM articles').get().c;
  if (articleCount === 0) {
    const admin = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();
    const samples = [
      ['網站開發心得分享', '技術', '紀錄這次期末專題的開發過程與收穫。', '這裡是文章內容，你可以之後替換成真實文章內容...'],
      ['如何寫出乾淨的程式碼', '技術', '幾個簡單原則，讓程式碼更好維護。', '這裡是文章內容，你可以之後替換成真實文章內容...'],
      ['期末專題回顧', '心得', '從零到一完成一個全端網站專案。', '這裡是文章內容，你可以之後替換成真實文章內容...']
    ];
    const stmt = db.prepare(
      'INSERT INTO articles (title, category, summary, content, author_id) VALUES (?, ?, ?, ?, ?)'
    );
    for (const s of samples) stmt.run(s[0], s[1], s[2], s[3], admin.id);
  }

  const portfolioCount = db.prepare('SELECT COUNT(*) AS c FROM portfolio').get().c;
  if (portfolioCount === 0) {
    const stmt = db.prepare(
      'INSERT INTO portfolio (title, category, description, image_url, link_url) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run('範例作品一', '網頁設計', '這裡放作品說明，之後可替換成真實作品資訊。', '', '');
    stmt.run('範例作品二', '平面設計', '這裡放作品說明，之後可替換成真實作品資訊。', '', '');
  }
}

seed();
module.exports = seed;
