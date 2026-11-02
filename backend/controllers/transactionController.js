const { getTransactionsByUserId, createTransaction: createTransactionRecord } = require('../models/Transaction');

const getTransactions = async (req, res, next) => {
  try {
    const transactions = await getTransactionsByUserId(req.user.id);
    res.json({
      success: true,
      data: transactions,
      message: 'Transactions retrieved successfully.'
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, status } = req.body;

    if (!title || !amount || !type) {
      return res.status(400).json({ 
        success: false,
        data: null,
        message: 'Title, amount, and type are required.' 
      });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ 
        success: false,
        data: null,
        message: 'Amount must be a number greater than 0.' 
      });
    }

    const transaction = await createTransactionRecord({
      title,
      amount: numAmount,
      type,
      status: status || 'pending',
      user_id: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction created successfully.'
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    next(error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
};
