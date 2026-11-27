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
    stmt.run('MahjongCloud 麻將聽牌機率分析', '雲端運算', '分散式雲端運算期末專題：輸入台灣麻將手牌，對每種打牌選擇以 Monte Carlo 模擬約百萬局，回傳胡牌機率排名與 95% 信賴區間。以 AWS（S3／API Gateway／Lambda／SQS／EC2 Auto Scaling／DynamoDB）打造平行運算管線。', '', '');
    stmt.run('電商顧客分群分析（RFM + K-means）', '資料科學', '以 UCI Online Retail 約 54 萬筆交易資料計算顧客 RFM 指標，結合五分位規則與 K-means 分群，找出各族群消費特徵（約 28% 顧客貢獻 76% 營收），並與 GMM／Ward 等方法比較。Python。', '', '');
    stmt.run('識詐群島・防詐騙遊戲', '人工智慧', '用遊戲學防詐騙：在島上開寶箱，判斷簡訊／Email／網頁／來電是否為詐騙，內建 AI 防詐助手與對練道場（RAG 檢索＋Microsoft Foundry 模型）。HTML/JS 前端＋Netlify Functions 後端。', '', 'https://gilded-centaur-cd46a9.netlify.app/');
    stmt.run('LLM-Planner 具身代理任務規劃', '畢業專題', '畢業專題：以大型語言模型為具身代理（embodied agent）做少樣本任務規劃，基於並延伸 LLM-Planner 研究，於 ALFRED 環境進行高階計畫生成與端到端代理實驗。', '', '');
    stmt.run('NCU Research Gateway 研究能量地圖', '人工智慧', '校務競賽作品：將中央大學教授的專長、論文、計畫與實驗室整理成互動式「研究能量地圖」，讓人用自然語言就能找到對的教授與研究。React + Vite 前端、Python 爬蟲資料管線、Gemma 產生研究總結。', '', '');
    stmt.run('JavaFX 蛋糕疊疊樂', '程式作品', '計算機實習期末專題：使用 Java 與 JavaFX 開發的迷你遊戲，點擊讓蛋糕掉落堆疊、沒對準就被切掉，並可選擇難度，採 MVC 架構。', '', '');
  }
}

seed();
module.exports = seed;
