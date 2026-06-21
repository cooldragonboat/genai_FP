const express = require('express');
const db = require('../data/db');
const { getPagination, buildPageLinks } = require('../utils/paginate');
const { isNonEmpty, isEmail, isLengthBetween } = require('../utils/validate');

const router = express.Router();

router.get('/', (req, res) => {
  const latestArticles = db
    .prepare("SELECT * FROM articles WHERE status = 'published' ORDER BY created_at DESC LIMIT 3")
    .all();
  const portfolioPreview = db
    .prepare('SELECT * FROM portfolio ORDER BY created_at DESC LIMIT 3')
    .all();
  res.render('home', { title: '首頁', latestArticles, portfolioPreview });
});

router.get('/about', (req, res) => {
  res.render('about', { title: '關於我們' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { title: '聯絡資訊', errors: [], success: false, form: {} });
});

router.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  const errors = [];
  if (!isLengthBetween(name, 2, 50)) errors.push('姓名需為 2-50 個字元。');
  if (!isEmail(email)) errors.push('Email 格式不正確。');
  if (!isNonEmpty(message)) errors.push('請輸入訊息內容。');

  if (errors.length > 0) {
    return res.render('contact', { title: '聯絡資訊', errors, success: false, form: { name, email, subject, message } });
  }

  db.prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)').run(
    name,
    email,
    subject || '',
    message
  );

  res.render('contact', { title: '聯絡資訊', errors: [], success: true, form: {} });
});

router.get('/portfolio', (req, res) => {
  const category = req.query.category || '';
  const search = req.query.q || '';

  let sql = 'SELECT * FROM portfolio WHERE 1=1';
  const params = [];
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY created_at DESC';

  const items = db.prepare(sql).all(...params);
  const categories = db.prepare('SELECT DISTINCT category FROM portfolio').all().map((r) => r.category);

  res.render('portfolio', { title: '作品集', items, categories, category, search });
});

router.get('/articles', (req, res) => {
  const { page, limit, offset } = getPagination(req.query, 6);
  const category = req.query.category || '';
  const search = req.query.q || '';

  let where = "WHERE status = 'published'";
  const params = [];
  if (category) {
    where += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    where += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const total = db.prepare(`SELECT COUNT(*) AS c FROM articles ${where}`).get(...params).c;
  const articles = db
    .prepare(`SELECT * FROM articles ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);
  const categories = db
    .prepare("SELECT DISTINCT category FROM articles WHERE status = 'published'")
    .all()
    .map((r) => r.category);

  const { totalPages } = buildPageLinks(total, limit, page);

  res.render('articles', { title: '文章列表', articles, categories, category, search, page, totalPages });
});

router.get('/articles/:id', (req, res) => {
  const article = db
    .prepare("SELECT * FROM articles WHERE id = ? AND status = 'published'")
    .get(req.params.id);
  if (!article) {
    return res.status(404).render('error', { title: '找不到文章', message: '此文章不存在或已被刪除。' });
  }
  const comments = db
    .prepare(
      `SELECT comments.*, users.username FROM comments
       LEFT JOIN users ON comments.user_id = users.id
       WHERE comments.article_id = ? AND comments.status = 'approved'
       ORDER BY comments.created_at DESC`
    )
    .all(article.id);

  res.render('article-detail', { title: article.title, article, comments, errors: [], success: req.query.posted === '1' });
});

router.post('/articles/:id/comments', (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).render('error', { title: '找不到文章', message: '此文章不存在。' });

  const { content, guest_name } = req.body;
  const errors = [];
  if (!isNonEmpty(content)) errors.push('留言內容不可為空。');

  const user = req.session.user;
  if (!user && !isNonEmpty(guest_name)) errors.push('請輸入您的稱呼。');

  if (errors.length > 0) {
    const comments = db
      .prepare(
        `SELECT comments.*, users.username FROM comments
         LEFT JOIN users ON comments.user_id = users.id
         WHERE comments.article_id = ? AND comments.status = 'approved'
         ORDER BY comments.created_at DESC`
      )
      .all(article.id);
    return res.render('article-detail', { title: article.title, article, comments, errors, success: false });
  }

  db.prepare(
    'INSERT INTO comments (article_id, user_id, guest_name, content, status) VALUES (?, ?, ?, ?, ?)'
  ).run(article.id, user ? user.id : null, user ? null : guest_name, content, 'pending');

  res.redirect(`/articles/${article.id}?posted=1`);
});

module.exports = router;
