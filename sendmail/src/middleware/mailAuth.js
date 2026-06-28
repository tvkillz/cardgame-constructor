/**
 * Bearer token auth for protected routes (MAIL_API_KEY).
 */
function mailAuth(req, res, next) {
  const expected = process.env.MAIL_API_KEY;
  if (!expected) {
    return res.status(503).json({
      success: false,
      message: 'MAIL_API_KEY is not configured on the server',
    });
  }

  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!token || token !== expected) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized — use Authorization: Bearer <MAIL_API_KEY>',
    });
  }

  next();
}

module.exports = { mailAuth };
