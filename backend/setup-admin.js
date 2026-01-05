import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { connection } from './config/database.js';

async function setupAdmin() {
  try {
    // Hash the default password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if super admin already exists
    connection.query(
      'SELECT * FROM users WHERE username = ? OR role = ?',
      ['superadmin', 'super_admin'],
      async (err, results) => {
        if (err) {
          console.error('Error checking for existing admin:', err);
          process.exit(1);
        }

        if (results.length > 0) {
          // Update existing super admin password
          connection.query(
            'UPDATE users SET password = ? WHERE username = ? OR role = ?',
            [hashedPassword, 'superadmin', 'super_admin'],
            (err, result) => {
              if (err) {
                console.error('Error updating admin password:', err);
                process.exit(1);
              }
              console.log('Super admin password updated successfully!');
              console.log('Username: superadmin');
              console.log('Password: admin123');
              console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
              connection.end();
            }
          );
        } else {
          // Create new super admin
          connection.query(
            'INSERT INTO users (username, email, password, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            ['superadmin', 'admin@gss.com', hashedPassword, 'Super Administrator', 'super_admin', 1],
            (err, result) => {
              if (err) {
                console.error('Error creating admin:', err);
                process.exit(1);
              }
              console.log('Super admin created successfully!');
              console.log('Username: superadmin');
              console.log('Password: admin123');
              console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
              connection.end();
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();

