const userDao = require('../dao/userDao');

exports.requireAuth = async (req, res, next) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: 'Faça login para continuar.' });
    const user = await userDao.byId(req.session.userId);
    if (!user) return res.status(401).json({ error: 'Sessão inválida.' });
    req.user = user;
    next();
  } catch (error) { next(error); }
};

exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Acesso exclusivo do administrador.' });
  next();
};
