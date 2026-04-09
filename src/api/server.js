const express = require('express');
const authenticateApiKey = require('./middleware/auth');
const otpRoutes = require('./routes/otp');
const { getConnectionStatus } = require('../whatsapp/handlers/connection');

const app = express();
app.use(express.json());

// API Key authentication middleware
app.use('/api/', authenticateApiKey);

// Routes
app.use('/api/otp', otpRoutes);

// Health check unauthenticated
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    whatsapp_status: getConnectionStatus(),
    timestamp: new Date().toISOString() 
  });
});

module.exports = app;
