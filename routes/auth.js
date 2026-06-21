const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../data/db');
const { redirectIfLoggedIn } = require('../middleware/auth');
const { isNonEmpty, isEmail, isLengthBetween } = require('../utils/validate');

const router = express.Router();

router.get('/register', redirectIfLoggedIn, (req, res) => {
  res.render('register', { title: '註冊', errors: [], form: {} });
});

router.post('/register', redirectIfLoggedIn, (req, res) => {
  const { username, email, password, confirm } = req.body;
  const errors = [];

  if (!isLengthBetween(username, 3, 20)) errors.push('使用者名稱需為 3-20 個字元。');
  if (!isEmail(email)) errors.push('Email 格式不正確。');
  if (!isLengthBetween(password, 6, 100)) errors.push('密碼至少需要 6 個字元。');
  if (password !== confirm) errors.push('密碼與確認密碼不一致。');

  if (errors.length === 0) {
    const exists = db
      .prepare('SELECT id FROM users WHERE username = ? OR email = ?')
      .get(username, email);
    if (exists) errors.push('使用者名稱或 Email 已被註冊。');
  }

  if (errors.length > 0) {
    return res.render('register', { title: '註冊', errors, form: { username, email } });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(username, email, hash, 'user');

  req.session.user = { id: result.lastInsertRowid, username, role: 'user' };
  res.redirect('/');
});

router.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('login', { title: '登入', errors: [], form: {}, redirectTo: req.query.redirect || '/' });
});

router.post('/login', redirectIfLoggedIn, (req, res) => {
  const { username, password } = req.body;
  const redirectTo = req.body.redirectTo || '/';
  const errors = [];

  if (!isNonEmpty(username) || !isNonEmpty(password)) {
    errors.push('請輸入帳號與密碼。');
    return res.render('login', { title: '登入', errors, form: { username }, redirectTo });
  }

  const user = db
    .prepare('SELECT * FROM users WHERE username = ? OR email = ?')
    .get(username, username);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    errors.push('帳號或密碼錯誤。');
    return res.render('login', { title: '登入', errors, form: { username }, redirectTo });
  }

  if (user.status === 'banned') {
    errors.push('此帳號已被停權，請聯絡管理員。');
    return res.render('login', { title: '登入', errors, form: { username }, redirectTo });
  }

  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.redirect(redirectTo);
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
