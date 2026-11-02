const mysql = require('mysql2/promise');

const isDevMode = process.env.DEV_MODE === 'true';

let pool = null;

if (!isDevMode) {
  pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dashboard_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

const checkDBConnection = async () => {
  if (isDevMode) {
    console.log('Running in DEV MODE without MySQL');
    return;
  }

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('MySQL connected:', `${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'dashboard_db'}`);
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  checkDBConnection,
  mysql,
};
