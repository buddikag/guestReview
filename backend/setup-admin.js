import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import pool from './config/database.js';

async function setupAdmin() {
  try {
    // Hash the default password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if super admin already exists
    const [results] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR role = ?',
      ['superadmin', 'super_admin']
    );

    if (results.length > 0) {
      // Update existing super admin password
      await pool.execute(
        'UPDATE users SET password = ? WHERE username = ? OR role = ?',
        [hashedPassword, 'superadmin', 'super_admin']
      );
      console.log('Super admin password updated successfully!');
      console.log('Username: superadmin');
      console.log('Password: admin123');
      console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
    } else {
      // Create new super admin
      await pool.execute(
        'INSERT INTO users (username, email, password, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['superadmin', 'admin@gss.com', hashedPassword, 'Super Administrator', 'super_admin', 1]
      );
      console.log('Super admin created successfully!');
      console.log('Username: superadmin');
      console.log('Password: admin123');
      console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();

