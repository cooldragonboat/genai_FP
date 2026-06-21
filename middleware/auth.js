function attachUser(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  next();
}

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('error', { title: '無權限', message: '您沒有權限存取此頁面。' });
  }
  next();
}

function redirectIfLoggedIn(req, res, next) {
  if (req.session.user) return res.redirect('/');
  next();
}

module.exports = { attachUser, requireLogin, requireAdmin, redirectIfLoggedIn };
