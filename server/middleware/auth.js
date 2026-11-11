const jwt = require('jsonwebtoken');
const { HttpError } = require('./errorHandler');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET no definido');

const signToken = (user) => jwt.sign({ id: user.id, role: 'professional' }, JWT_SECRET, { expiresIn: '8h' });

/** Bearer JWT → req.user = { id, role }. */
const authenticate = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(new HttpError(401, 'Token requerido'));
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(new HttpError(401, 'Token inválido o expirado'));
  }
};

module.exports = { authenticate, signToken };
