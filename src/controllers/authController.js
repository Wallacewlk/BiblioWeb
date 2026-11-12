const bcrypt = require('bcryptjs');
const userDao = require('../dao/userDao');

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
function startSession(req, user) {
  return new Promise((resolve, reject) => req.session.regenerate((err) => {
    if (err) return reject(err);
    req.session.userId = user.id;
    req.session.save((saveError) => saveError ? reject(saveError) : resolve());
  }));
}
exports.register = async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      return res.status(400).json({ error: 'Informe nome (2 a 100 caracteres), e-mail válido e senha de 8+ caracteres.' });
    }
    if (await userDao.byEmail(email)) return res.status(409).json({ error: 'E-mail já cadastrado.' });
    const passwordHash = await bcrypt.hash(password, 11);
    const user = await userDao.create({ name, email, passwordHash, role: 'CLIENTE' });
    await startSession(req, user);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) { next(error); }
};
exports.login = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const user = await userDao.byEmail(email);
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }
    await startSession(req, user);
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
};
exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('biblioweb.sid', { path: '/' });
    res.json({ message: 'Sessão encerrada.' });
  });
};
exports.me = (req, res) => res.json({ user: publicUser(req.user) });
