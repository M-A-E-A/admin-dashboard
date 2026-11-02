const { pool } = require('../config/db');
const { devTransactionOperations } = require('../config/devData');

const isDevMode = process.env.DEV_MODE === 'true';

const getDashboardStats = async (req, res, next) => {
  try {
    let stats;

    if (isDevMode) {
      // DEV MODE: use in-memory data
      stats = await devTransactionOperations.computeStats();
    } else {
      // PRODUCTION MODE: query database
      const [userResults] = await pool.query('SELECT COUNT(*) as count FROM users');
      const totalUsers = userResults[0].count;

      const [transactionResults] = await pool.query('SELECT COUNT(*) as count FROM transactions');
      const totalTransactions = transactionResults[0].count;

      const [amountResults] = await pool.query('SELECT SUM(amount) as total FROM transactions');
      const totalTransactionAmount = parseFloat((amountResults[0].total || 0).toFixed(2));

      const [pendingResults] = await pool.query(
        "SELECT COUNT(*) as count FROM transactions WHERE status = 'pending'"
      );
      const pendingTransactions = pendingResults[0].count;

      stats = {
        totalUsers,
        totalTransactions,
        totalTransactionAmount,
        pendingTransactions,
      };
    }

    res.json({
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully.'
    });
  } catch (error) {
    console.error('Get stats error:', error);
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
