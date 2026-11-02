const { devTransactionOperations } = require('../config/devData');
const { pool } = require('../config/db');

const isDevMode = process.env.DEV_MODE === 'true';

const getTransactionsByUserId = async (userId) => {
  if (isDevMode) {
    return devTransactionOperations.getTransactionsByUserId(userId);
  }
  
  try {
    const [transactions] = await pool.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return transactions;
  } catch (error) {
    console.error('Database error in getTransactionsByUserId:', error);
    throw error;
  }
};

const createTransaction = async ({ title, amount, type, status = 'pending', user_id }) => {
  if (isDevMode) {
    return devTransactionOperations.createTransaction({ title, amount, type, status, user_id });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO transactions (title, amount, type, status, user_id) VALUES (?, ?, ?, ?, ?)',
      [title, amount, type, status, user_id]
    );
    return {
      id: result.insertId,
      title,
      amount,
      type,
      status,
      user_id,
      date: new Date(),
      created_at: new Date(),
    };
  } catch (error) {
    console.error('Database error in createTransaction:', error);
    throw error;
  }
};

module.exports = {
  getTransactionsByUserId,
  createTransaction,
};
