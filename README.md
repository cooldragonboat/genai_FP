# 期末專題網站

不需要外部 API，使用 Node.js + Express + EJS + SQLite (better-sqlite3) 自行實作的全端網站範例。

## 功能

- 靜態頁面：首頁、關於我們、聯絡資訊、作品集、文章列表
- 聯絡表單（含驗證）
- 會員系統：註冊 / 登入 / 登出，密碼以 bcrypt 雜湊，Session 驗證
- 文章管理：新增、修改、刪除、列表、分頁、搜尋、分類篩選
- 作品集管理：新增、刪除、搜尋、分類篩選
- 留言板：訪客或會員皆可留言，需經管理員審核才會顯示
- 後台管理：統計總覽、文章管理、作品集管理、留言審核、使用者角色與停權管理、聯絡訊息檢視
- 權限管理：一般使用者 / 管理員角色區分，後台路由僅管理員可存取
- RWD 響應式設計 + 炫彩霓光背景效果

## 安裝與啟動

```bash
npm install
cp .env.example .env
npm start
```

啟動後開啟 http://localhost:3000

預設測試帳號（首次啟動自動建立）：
- 管理員：`admin` / `admin1234`
- 一般使用者：`demo` / `user1234`

## 背景圖片

把你想用的圖片命名為 `hero.jpg`，放到 `public/images/hero.jpg`，網站背景與霓光特效會自動套用在這張圖上（`public/css/style.css` 中的 `.bg-hero`）。

## 之後可以替換的內容

- `data/seed.js`：文章與作品集的範例資料（會在資料庫第一次建立時自動寫入，之後可從後台新增/編輯/刪除）
- 「關於我們」`views/about.ejs`、「聯絡資訊」`views/contact.ejs` 文案
- 文章 / 作品集 / 聯絡資訊內容可直接在後台或註冊登入後管理，也可以直接修改 seed 資料

## 專案結構

```
server.js              入口
data/db.js              SQLite 資料表結構
data/seed.js             初始資料
middleware/auth.js       登入 / 角色驗證
routes/auth.js           登入註冊登出
routes/pages.js          前台頁面、文章、作品集、留言、聯絡表單
routes/admin.js          後台管理
views/                   EJS 樣板
public/                  CSS / JS / 圖片
```
