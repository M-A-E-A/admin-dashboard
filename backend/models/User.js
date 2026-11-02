const { devUserOperations } = require('../config/devData');
const { pool } = require('../config/db');

const isDevMode = process.env.DEV_MODE === 'true';

const findUserByEmail = async (email) => {
  if (isDevMode) {
    return devUserOperations.findUserByEmail(email);
  }
  
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Database error in findUserByEmail:', error);
    throw error;
  }
};

const findUserById = async (id) => {
  if (isDevMode) {
    return devUserOperations.findUserById(id);
  }
  
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Database error in findUserById:', error);
    throw error;
  }
};

const findAllUsers = async () => {
  if (isDevMode) {
    return devUserOperations.findAllUsers();
  }
  
  try {
    const [users] = await pool.query('SELECT id, name, email, role, created_at FROM users');
    return users;
  } catch (error) {
    console.error('Database error in findAllUsers:', error);
    throw error;
  }
};

const createUser = async ({ name, email, password, role = 'user', status = 'Actif' }) => {
  if (isDevMode) {
    return devUserOperations.createUser({ name, email, password, role, status });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return {
      id: result.insertId,
      name,
      email,
      role,
      status,
      created_at: new Date(),
    };
  } catch (error) {
    console.error('Database error in createUser:', error);
    throw error;
  }
};

const updateUser = async (id, updates) => {
  if (isDevMode) {
    return devUserOperations.updateUser(id, updates);
  }
  
  try {
    // Build dynamic update query
    const fields = [];
    const values = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.password !== undefined) {
      fields.push('password = ?');
      values.push(updates.password);
    }
    
    if (fields.length === 0) {
      // No updates, just return current user
      return findUserById(id);
    }
    
    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    await pool.query(query, values);
    return findUserById(id);
  } catch (error) {
    console.error('Database error in updateUser:', error);
    throw error;
  }
};

module.exports = {
  findUserByEmail,
  findUserById,
  findAllUsers,
  createUser,
  updateUser,
};
