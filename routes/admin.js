const express = require('express');
const db = require('../data/db');
const { requireLogin, requireAdmin } = require('../middleware/auth');
const { getPagination, buildPageLinks } = require('../utils/paginate');
const { isNonEmpty } = require('../utils/validate');

const router = express.Router();

router.use(requireLogin, requireAdmin);

router.get('/', (req, res) => {
  const stats = {
    userCount: db.prepare('SELECT COUNT(*) AS c FROM users').get().c,
    articleCount: db.prepare('SELECT COUNT(*) AS c FROM articles').get().c,
    pendingComments: db.prepare("SELECT COUNT(*) AS c FROM comments WHERE status = 'pending'").get().c,
    contactCount: db.prepare('SELECT COUNT(*) AS c FROM contact_messages').get().c,
  };
  const recentComments = db
    .prepare(
      `SELECT comments.*, articles.title AS article_title FROM comments
       LEFT JOIN articles ON comments.article_id = articles.id
       ORDER BY comments.created_at DESC LIMIT 5`
    )
    .all();
  const recentMessages = db
    .prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5')
    .all();

  res.render('admin/dashboard', { title: '後台管理', stats, recentComments, recentMessages });
});

// ---- 文章管理 ----
router.get('/articles', (req, res) => {
  const { page, limit, offset } = getPagination(req.query, 8);
  const search = req.query.q || '';
  let where = 'WHERE 1=1';
  const params = [];
  if (search) {
    where += ' AND title LIKE ?';
    params.push(`%${search}%`);
  }
  const total = db.prepare(`SELECT COUNT(*) AS c FROM articles ${where}`).get(...params).c;
  const articles = db
    .prepare(`SELECT * FROM articles ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);
  const { totalPages } = buildPageLinks(total, limit, page);

  res.render('admin/articles', { title: '文章管理', articles, search, page, totalPages });
});

router.get('/articles/new', (req, res) => {
  res.render('admin/article-form', { title: '新增文章', article: {}, errors: [] });
});

router.post('/articles/new', (req, res) => {
  const { title, category, summary, content, status } = req.body;
  const errors = [];
  if (!isNonEmpty(title)) errors.push('標題不可為空。');
  if (!isNonEmpty(content)) errors.push('內容不可為空。');

  if (errors.length > 0) {
    return res.render('admin/article-form', { title: '新增文章', article: req.body, errors });
  }

  db.prepare(
    'INSERT INTO articles (title, category, summary, content, status, author_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title, category || '未分類', summary || '', content, status || 'published', req.session.user.id);

  res.redirect('/admin/articles');
});

router.get('/articles/:id/edit', (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).render('error', { title: '找不到文章', message: '此文章不存在。' });
  res.render('admin/article-form', { title: '編輯文章', article, errors: [] });
});

router.post('/articles/:id/edit', (req, res) => {
  const { title, category, summary, content, status } = req.body;
  const errors = [];
  if (!isNonEmpty(title)) errors.push('標題不可為空。');
  if (!isNonEmpty(content)) errors.push('內容不可為空。');

  if (errors.length > 0) {
    return res.render('admin/article-form', { title: '編輯文章', article: { ...req.body, id: req.params.id }, errors });
  }

  db.prepare(
    `UPDATE articles SET title = ?, category = ?, summary = ?, content = ?, status = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(title, category || '未分類', summary || '', content, status || 'published', req.params.id);

  res.redirect('/admin/articles');
});

router.post('/articles/:id/delete', (req, res) => {
  db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM comments WHERE article_id = ?').run(req.params.id);
  res.redirect('/admin/articles');
});

// ---- 作品集管理 ----
router.get('/portfolio', (req, res) => {
  const items = db.prepare('SELECT * FROM portfolio ORDER BY created_at DESC').all();
  res.render('admin/portfolio', { title: '作品集管理', items });
});

router.post('/portfolio/new', (req, res) => {
  const { title, category, description, image_url, link_url } = req.body;
  if (isNonEmpty(title)) {
    db.prepare(
      'INSERT INTO portfolio (title, category, description, image_url, link_url) VALUES (?, ?, ?, ?, ?)'
    ).run(title, category || '其他', description || '', image_url || '', link_url || '');
  }
  res.redirect('/admin/portfolio');
});

router.post('/portfolio/:id/delete', (req, res) => {
  db.prepare('DELETE FROM portfolio WHERE id = ?').run(req.params.id);
  res.redirect('/admin/portfolio');
});

// ---- 留言審核 ----
router.get('/comments', (req, res) => {
  const filter = req.query.status || 'pending';
  const comments = db
    .prepare(
      `SELECT comments.*, articles.title AS article_title, users.username FROM comments
       LEFT JOIN articles ON comments.article_id = articles.id
       LEFT JOIN users ON comments.user_id = users.id
       WHERE comments.status = ?
       ORDER BY comments.created_at DESC`
    )
    .all(filter);
  res.render('admin/comments', { title: '留言審核', comments, filter });
});

router.post('/comments/:id/approve', (req, res) => {
  db.prepare("UPDATE comments SET status = 'approved' WHERE id = ?").run(req.params.id);
  res.redirect(req.headers.referer || '/admin/comments');
});

router.post('/comments/:id/reject', (req, res) => {
  db.prepare("UPDATE comments SET status = 'rejected' WHERE id = ?").run(req.params.id);
  res.redirect(req.headers.referer || '/admin/comments');
});

router.post('/comments/:id/delete', (req, res) => {
  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  res.redirect(req.headers.referer || '/admin/comments');
});

// ---- 使用者管理 / 角色區分 ----
router.get('/users', (req, res) => {
  const users = db.prepare('SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC').all();
  res.render('admin/users', { title: '使用者管理', users });
});

router.post('/users/:id/role', (req, res) => {
  const { role } = req.body;
  if (['user', 'admin'].includes(role)) {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  }
  res.redirect('/admin/users');
});

router.post('/users/:id/status', (req, res) => {
  const { status } = req.body;
  if (['active', 'banned'].includes(status)) {
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  }
  res.redirect('/admin/users');
});

// ---- 聯絡訊息 ----
router.get('/messages', (req, res) => {
  const messages = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
  res.render('admin/messages', { title: '聯絡訊息', messages });
});

module.exports = router;
