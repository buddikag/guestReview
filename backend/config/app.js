import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

// Application configuration
const config = {
  // Frontend Base URL (should match frontend's VITE_BASE_URL)
  //frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'https://guest.creative-2.com',
  
  // Backend URL
  backendUrl: process.env.BACKEND_URL || process.env.PORT 
    ? `http://localhost:${process.env.PORT || 3000}` 
    : 'http://localhost:3000',
  
  // Server Port
  port: process.env.PORT || 3000,
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT Secret
  jwtSecret: process.env.JWT_SECRET || 'gss_2026_@',
};

// Validate required configuration
if (!config.frontendBaseUrl) {
  logger.warn('FRONTEND_BASE_URL not set, using default: http://localhost:5173');
}

// Log configuration on startup (without sensitive data)
logger.info('Application configuration loaded', {
  frontendBaseUrl: config.frontendBaseUrl,
  backendUrl: config.backendUrl,
  port: config.port,
  nodeEnv: config.nodeEnv,
});

export default config;
