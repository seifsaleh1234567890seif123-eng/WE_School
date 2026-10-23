/**
 * WE Applied Technology Schools — Enterprise Backend Core Engine
 * Powered by Node.js, Express, and Native SQLite (node:sqlite)
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const os = require('os');

const { initSchema } = require('./src/database/schema');
const { seedDatabase } = require('./src/database/seed');
const apiRoutes = require('./src/routes/api');
const adminRoutes = require('./src/routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Initialize SQLite Database & Auto-Seed
console.log('🔄 Initializing Enterprise Database & Schemas...');
initSchema();
seedDatabase();
console.log('🚀 Database Engine Armed & Ready (WAL Mode Enabled)');

// 2. Security & Request Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allows inline Web Audio API, dynamic styles & animations
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// 3. API Routers
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

// 4. Admin Portal Static Route
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// 5. Main Web Application Static Route
app.use(express.static(path.join(__dirname), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (/\.(html|js|css)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (/\.(webp|png|jpg|jpeg|svg|ico|mp4|woff2?)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Root Fallback to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin Route Fallback
app.get(/^\/admin/, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// 404 Handler for Unmatched API routes
app.all(/^\/api\/.*/, (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint '${req.originalUrl}' not found on WE ATS Core API.`
  });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled System Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Helper to detect local LAN/Wi-Fi IPv4 address for mobile access
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Start Server (Binds to 0.0.0.0 to enable mobile Wi-Fi connectivity)
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  const localIp = getLocalIp();
  console.log(`================================================================`);
  console.log(`🌐 WE Applied Technology Schools — Enterprise Engine is ACTIVE!`);
  console.log(`🔗 Portal URL (PC):      http://localhost:${PORT}`);
  console.log(`📱 Mobile Phone (Wi-Fi): http://${localIp}:${PORT}`);
  console.log(`🔐 Admin Dashboard:      http://localhost:${PORT}/admin`);
  console.log(`📊 Core REST API:        http://localhost:${PORT}/api/stats`);
  console.log(`💾 Native SQLite:        data/we_schools.db (WAL Enabled)`);
  console.log(`================================================================`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server.');
  server.close(() => console.log('HTTP server closed.'));
});

module.exports = app;
