require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const routes = require('./routes');
const { db } = require('./models');
const seed = require('./services/seed');

const app = express();
app.set('trust proxy', 1);
const production = process.env.NODE_ENV === 'production';
if (production && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
  throw new Error('Defina SESSION_SECRET com pelo menos 32 caracteres na hospedagem.');
}
app.use(helmet());
app.use(express.json({ limit: '20kb' }));

const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5500,http://127.0.0.1:5500')
  .split(',').map((s) => s.trim()).filter(Boolean);
// CORS explícito: aceita a própria origem da aplicação e as origens externas definidas no .env.
// Mesmo quando front e API estão no mesmo domínio, requisições POST podem enviar o header Origin.
app.use('/api', cors((req, callback) => {
  const origin = req.get('origin');
  const selfOrigin = `${req.protocol}://${req.get('host')}`;
  if (origin && origin !== selfOrigin && !allowedOrigins.includes(origin)) {
    return callback(Object.assign(new Error('Origem não permitida pelo CORS.'), { status: 403 }));
  }
  callback(null, {
    origin: origin || false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  });
}));
const store = new SequelizeStore({ db, tableName: 'Sessions', checkExpirationInterval: 15 * 60 * 1000, expiration: 24 * 60 * 60 * 1000 });
app.use(session({
  name: 'biblioweb.sid',
  secret: process.env.SESSION_SECRET || 'CHAVE-APENAS-PARA-TESTES-LOCAIS-MUDE-ESTA-CHAVE',
  resave: false, saveUninitialized: false, store,
  cookie: { httpOnly: true, secure: production, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 }
}));
app.use('/api', routes);
app.use(express.static(path.join(__dirname, '../public')));
app.get('/', (_, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.use('/api', (_, res) => res.status(404).json({ error: 'Rota de API não encontrada.' }));
app.use((error, req, res, next) => {
  console.error('[API ERROR]', error);
  if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ error: 'Registro já existente.' });
  if (error.name?.startsWith('SequelizeValidation') || error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'Dados inválidos para o banco de dados.' });
  }
  res.status(error.status || 500).json({ error: error.status ? error.message : 'Erro interno do servidor.' });
});

async function start() {
  await db.authenticate();
  await db.sync();
  await store.sync();
  await seed();
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`BiblioWeb iniciado em http://localhost:${port}`);
    console.log(`API: http://localhost:${port}/api/health`);
  });
}
if (require.main === module) start().catch((error) => { console.error('Falha ao iniciar:', error); process.exit(1); });
module.exports = { app, start };
