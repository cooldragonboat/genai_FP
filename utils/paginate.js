function getPagination(query, defaultLimit = 6) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = defaultLimit;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function buildPageLinks(totalItems, limit, page) {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return { totalPages, page };
}

module.exports = { getPagination, buildPageLinks };
