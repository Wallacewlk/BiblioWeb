// VV&TS: execute apenas com o BiblioWeb local e banco SQLite local.
const { defineConfig } = require('cypress');
require('dotenv').config();

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) {
  throw new Error('Cypress bloqueado: remova DATABASE_URL do .env LOCAL para usar SQLite, nunca o banco do Render.');
}
if (process.env.NODE_ENV === 'production') {
  throw new Error('Cypress bloqueado: nao execute em NODE_ENV=production.');
}

module.exports = defineConfig({
  video: false,
  screenshotOnRunFailure: true,
  viewportWidth: 1280,
  viewportHeight: 800,
  e2e: {
    baseUrl: 'http://127.0.0.1:3000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false,
    testIsolation: true,
    env: {
      // Credenciais lidas apenas do .env LOCAL, nunca gravadas no repositório.
      adminEmail: process.env.ADMIN_EMAIL || '',
      adminPassword: process.env.ADMIN_PASSWORD || '',
    },
  },
});
