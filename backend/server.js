const dotenv = require('dotenv');

// Load environment variables FIRST, before any other requires
dotenv.config();

const { app, startServer: initServer } = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize database
    await initServer();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
