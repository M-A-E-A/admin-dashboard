const bcrypt = require('bcryptjs');

// In-memory data store for DEV MODE (temporary, not persisted)
let devUsers = [];
let devTransactions = [];
let nextUserId = 1;
let nextTransactionId = 1;

// Initialize demo data with pre-hashed passwords
const initializeDemoData = async () => {
  // Clear existing data
  devUsers = [];
  devTransactions = [];
  nextUserId = 1;
  nextTransactionId = 1;

  // Demo users with pre-hashed password "Demo1234"
  const demoUsers = [
    {
      id: nextUserId++,
      name: 'Admin Demo',
      email: 'admin@example.com',
      password: '$2a$10$PLACEHOLDER_ADMIN_HASH', // Will be replaced below
      role: 'admin',
      status: 'Actif',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: nextUserId++,
      name: 'Alice Martin',
      email: 'alice@example.com',
      password: '$2a$10$PLACEHOLDER_ALICE_HASH',
      role: 'user',
      status: 'Actif',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: nextUserId++,
      name: 'Pierre Laurent',
      email: 'pierre@example.com',
      password: '$2a$10$PLACEHOLDER_PIERRE_HASH',
      role: 'user',
      status: 'En attente',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: nextUserId++,
      name: 'Claire Dupont',
      email: 'claire@example.com',
      password: '$2a$10$PLACEHOLDER_CLAIRE_HASH',
      role: 'user',
      status: 'Actif',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: nextUserId++,
      name: 'Lucie Bernard',
      email: 'lucie@example.com',
      password: '$2a$10$PLACEHOLDER_LUCIE_HASH',
      role: 'user',
      status: 'Inactif',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  // Hash all passwords
  for (const user of demoUsers) {
    user.password = await bcrypt.hash('Demo1234', 10);
  }

  devUsers = demoUsers;

  // Demo transactions
  const demoTransactions = [
    {
      id: nextTransactionId++,
      title: 'Paiement d\'abonnement',
      amount: 124.5,
      type: 'Paiement',
      status: 'completed',
      user_id: 1,
      date: new Date('2024-01-15'),
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15'),
    },
    {
      id: nextTransactionId++,
      title: 'Facture client',
      amount: 278.9,
      type: 'Paiement',
      status: 'completed',
      user_id: 2,
      date: new Date('2024-01-16'),
      created_at: new Date('2024-01-16'),
      updated_at: new Date('2024-01-16'),
    },
    {
      id: nextTransactionId++,
      title: 'Remboursement',
      amount: 42.0,
      type: 'Refund',
      status: 'failed',
      user_id: 3,
      date: new Date('2024-01-17'),
      created_at: new Date('2024-01-17'),
      updated_at: new Date('2024-01-17'),
    },
    {
      id: nextTransactionId++,
      title: 'Transfert interne',
      amount: 560.0,
      type: 'Transfert',
      status: 'pending',
      user_id: 1,
      date: new Date('2024-01-18'),
      created_at: new Date('2024-01-18'),
      updated_at: new Date('2024-01-18'),
    },
    {
      id: nextTransactionId++,
      title: 'Nouvelle inscription',
      amount: 14.0,
      type: 'Paiement',
      status: 'completed',
      user_id: 4,
      date: new Date('2024-01-19'),
      created_at: new Date('2024-01-19'),
      updated_at: new Date('2024-01-19'),
    },
    {
      id: nextTransactionId++,
      title: 'Cours de démonstration',
      amount: 99.99,
      type: 'Paiement',
      status: 'completed',
      user_id: 5,
      date: new Date('2024-01-20'),
      created_at: new Date('2024-01-20'),
      updated_at: new Date('2024-01-20'),
    },
    {
      id: nextTransactionId++,
      title: 'Carte cadeau',
      amount: 30.0,
      type: 'Paiement',
      status: 'pending',
      user_id: 2,
      date: new Date('2024-01-21'),
      created_at: new Date('2024-01-21'),
      updated_at: new Date('2024-01-21'),
    },
    {
      id: nextTransactionId++,
      title: 'Abonnement mensuel',
      amount: 45.0,
      type: 'Paiement',
      status: 'completed',
      user_id: 3,
      date: new Date('2024-01-22'),
      created_at: new Date('2024-01-22'),
      updated_at: new Date('2024-01-22'),
    },
  ];

  devTransactions = demoTransactions;
};

// User operations for DEV MODE
const devUserOperations = {
  findUserByEmail: async (email) => {
    return devUsers.find((u) => u.email === email);
  },

  findUserById: async (id) => {
    const user = devUsers.find((u) => u.id === id);
    if (user) {
      // Return without password (same as SQL mode)
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return undefined;
  },

  findAllUsers: async () => {
    // Return users without passwords
    return devUsers.map((u) => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
  },

  createUser: async ({ name, email, password, role = 'user', status = 'Actif' }) => {
    const newUser = {
      id: nextUserId++,
      name,
      email,
      password,
      role,
      status,
      created_at: new Date(),
      updated_at: new Date(),
    };
    devUsers.push(newUser);
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      created_at: newUser.created_at,
    };
  },

  updateUser: async (id, updates) => {
    const userIndex = devUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) return undefined;

    const user = devUsers[userIndex];
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.password) user.password = updates.password;
    if (updates.role) user.role = updates.role;
    if (updates.status) user.status = updates.status;

    user.updated_at = new Date();
    devUsers[userIndex] = user;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};

// Transaction operations for DEV MODE
const devTransactionOperations = {
  getTransactionsByUserId: async (userId) => {
    return devTransactions
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  createTransaction: async ({ title, amount, type, status = 'pending', user_id }) => {
    const newTransaction = {
      id: nextTransactionId++,
      title,
      amount,
      type,
      status,
      user_id,
      date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };
    devTransactions.push(newTransaction);
    return newTransaction;
  },

  // Helper to compute stats from in-memory data
  computeStats: async () => {
    const totalUsers = devUsers.length;
    const totalTransactions = devTransactions.length;
    const totalAmount = devTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const pendingTransactions = devTransactions.filter((t) => t.status === 'pending').length;

    return {
      totalUsers,
      totalTransactions,
      totalTransactionAmount: parseFloat(totalAmount.toFixed(2)),
      pendingTransactions,
    };
  },
};

module.exports = {
  devUsers,
  devTransactions,
  initializeDemoData,
  devUserOperations,
  devTransactionOperations,
};
