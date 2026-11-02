const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const { getAllUsers, createNewUser } = require('./controllers/userController');
const { protect } = require('./middleware/authMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { initializeDatabase } = require('./config/initDb');
const { checkDBConnection } = require('./config/db');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8000', 'http://localhost:5000', 'file://'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Dashboard backend is running',
    data: { version: '1.0.0' }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.get('/api/users', protect, getAllUsers);
app.post('/api/users', protect, createNewUser);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await checkDBConnection();
    await initializeDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
};

// Export both app and startup function
module.exports = { app, startServer };
