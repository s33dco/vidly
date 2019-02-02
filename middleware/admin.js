module.exports = (req, res, next) => {
  // req.user from auth middleware

  // 401 unauth
  // 403 forbidden

  if (!req.user.isAdmin) return res.status(403).send('Access denied.');
  next();
}
