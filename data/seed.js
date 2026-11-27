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
    ).run('demo', 'demo@example.com', userHash, 'user');
    console.log('已建立帳號: admin/admin1234 (管理員), demo/user1234 (一般使用者)');
  }

  const articleCount = db.prepare('SELECT COUNT(*) AS c FROM articles').get().c;
  if (articleCount === 0) {
    const admin = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();
    const samples = [
      ['我的作品集網站開發歷程', '技術', '分享我如何從零打造這個個人作品集網站。', '這裡是文章內容，你可以之後替換成真實文章內容...'],
      ['如何寫出乾淨的程式碼', '技術', '幾個簡單原則，讓程式碼更好維護。', '這裡是文章內容，你可以之後替換成真實文章內容...'],
      ['設計一個作品集該注意什麼', '心得', '從版面、配色到內容編排的一些心得。', '這裡是文章內容，你可以之後替換成真實文章內容...']
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
    stmt.run('個人作品集網站', '網頁設計', '使用 Node.js + Express + EJS + SQLite 打造的個人作品集網站，具備會員系統、文章與後台管理，採 cyberpunk 霓虹視覺風格，並部署於 Render。', '', 'https://smallfire.onrender.com');
    stmt.run('MoodTrack 情緒追蹤平台', '網頁開發', '以 Flask 開發的個人情緒與壓力紀錄分析平台：每日記錄心情、睡眠與運動，並用心情日曆與多種圖表視覺化生活模式。含會員系統、資料隔離、CSRF 保護與 68 項自動化測試，已部署上線。', '', 'https://smallfire.pythonanywhere.com/');
    stmt.run('雲端運算專案', '雲端運算', '雲端運算課程期末專案，實作雲端服務的部署與應用。', '', '');
    stmt.run('資料科學專案', '資料科學', '資料科學專案，涵蓋資料蒐集、清理、分析與視覺化。', '', '');
    stmt.run('Microsoft AI 專案', '人工智慧', '結合 Microsoft AI 服務開發的應用專案。', '', '');
    stmt.run('Capstone 畢業專題', '專題', '跨領域整合的畢業專題，從需求規劃到成果實作。', '', '');
    stmt.run('AI 競賽專案', '人工智慧', '參加 AI 競賽所開發的模型與解決方案。', '', '');
    stmt.run('JavaFX 遊戲', '程式作品', '使用 Java 與 JavaFX 開發的桌面遊戲。', '', '');
  }
}

seed();
module.exports = seed;
