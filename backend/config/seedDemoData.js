const bcrypt = require('bcryptjs');
const { pool } = require('./db');

const seedDemoData = async () => {
  const [userCountRows] = await pool.query('SELECT COUNT(*) AS count FROM users');
  const userCount = userCountRows[0]?.count || 0;

  if (userCount === 0) {
    const defaultUsers = [
      { name: 'Admin Demo', email: 'admin@example.com', password: 'Demo1234', role: 'admin' },
      { name: 'Alice Martin', email: 'alice@example.com', password: 'Demo1234', role: 'user' },
      { name: 'Pierre Laurent', email: 'pierre@example.com', password: 'Demo1234', role: 'user' },
      { name: 'Claire Dupont', email: 'claire@example.com', password: 'user' },
      { name: 'Lucie Bernard', email: 'lucie@example.com', password: 'user' },
    ];

    for (const user of defaultUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [
        user.name,
        user.email,
        hashedPassword,
        user.role,
      ]);
    }

    console.log('Seeded demo users.');
  }

  const [transactionCountRows] = await pool.query('SELECT COUNT(*) AS count FROM transactions');
  const transactionCount = transactionCountRows[0]?.count || 0;

  if (transactionCount === 0) {
    const [users] = await pool.query('SELECT id, name, email FROM users ORDER BY id');
    const demoTransactions = [
      { title: 'Paiement d’abonnement', amount: 124.5, type: 'Paiement', status: 'completed' },
      { title: 'Facture client', amount: 278.9, type: 'Paiement', status: 'completed' },
      { title: 'Remboursement', amount: 42.0, type: 'Refund', status: 'failed' },
      { title: 'Transfert interne', amount: 560.0, type: 'Transfert', status: 'pending' },
      { title: 'Nouvelle inscription', amount: 14.0, type: 'Paiement', status: 'completed' },
      { title: 'Cours de démonstration', amount: 99.99, type: 'Paiement', status: 'completed' },
      { title: 'Carte cadeau', amount: 30.0, type: 'Paiement', status: 'pending' },
      { title: 'Abonnement mensuel', amount: 45.0, type: 'Paiement', status: 'completed' },
    ];

    let userIndex = 0;
    for (const transaction of demoTransactions) {
      const user = users[userIndex % users.length];
      await pool.query(
        'INSERT INTO transactions (title, amount, type, status, user_id) VALUES (?, ?, ?, ?, ?)',
        [transaction.title, transaction.amount, transaction.type, transaction.status, user.id]
      );
      userIndex += 1;
    }

    console.log('Seeded demo transactions.');
  }
};

module.exports = seedDemoData;
