
const bcrypt = require('bcryptjs');
const { Book, User } = require('../models');

module.exports = async () => {
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();

    if (process.env.ADMIN_PASSWORD.length < 12 ||
        process.env.ADMIN_PASSWORD.includes('Substitua')) {
      throw new Error('Defina ADMIN_PASSWORD com pelo menos 12 caracteres.');
    }

    const [admin, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        name: process.env.ADMIN_NAME || 'Administrador',
        passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 11),
        role: 'ADMIN'
      }
    });

    if (!created && admin.role !== 'ADMIN') {
      throw new Error('ADMIN_EMAIL ja pertence a uma conta de cliente.');
    }

    if (!created && !(await bcrypt.compare(
      process.env.ADMIN_PASSWORD,
      admin.passwordHash
    ))) {
      admin.passwordHash = await bcrypt.hash(
        process.env.ADMIN_PASSWORD, 11
      );
      await admin.save();
      console.log('Senha do administrador atualizada.');
    }

    if (created) {
      console.log('Administrador inicial criado:', email);
    }

  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('Configure ADMIN_EMAIL e ADMIN_PASSWORD.');
  } else {
    console.warn('Administrador inicial nao configurado.');
  }

  if (await Book.count() === 0) {
    await Book.bulkCreate([
      { title: 'Dom Casmurro', author: 'Machado de Assis', category: 'Literatura brasileira', totalCopies: 3, availableCopies: 3 },
      { title: 'O Cortiço', author: 'Aluísio Azevedo', category: 'Literatura brasileira', totalCopies: 2, availableCopies: 2 },
      { title: 'Iracema', author: 'José de Alencar', category: 'Literatura brasileira', totalCopies: 4, availableCopies: 4 },
      { title: 'Memórias Póstumas de Brás Cubas', author: 'Machado de Assis', category: 'Romance', totalCopies: 2, availableCopies: 2 }
    ]);
    console.log('Catalogo de demonstracao criado.');
  }
};
