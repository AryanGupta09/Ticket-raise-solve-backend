const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');
const { checkSLABreaches } = require('./utils/slaChecker');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'Not connected (Demo Mode)'
  });
});

// Hackathon endpoint
app.get('/.well-known/hackathon.json', (req, res) => {
  res.json({
    name: 'HelpDesk Mini',
    description: 'A complete helpdesk system with ticket management, SLA tracking, and role-based access control',
    version: '1.0.0',
    tech_stack: ['Node.js', 'Express', 'MongoDB', 'JWT'],
    features: [
      'JWT Authentication',
      'Role-based Access Control',
      'Ticket Management',
      'SLA Tracking',
      'Comment System',
      'Timeline Logs',
      'Rate Limiting',
      'Idempotency'
    ]
  });
});

// Demo mode middleware - simulate database responses
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`📡 ${req.method} ${req.path} - Demo Mode`);
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    const field = Object.keys(err.errors)[0];
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        field: field,
        message: err.errors[field].message
      }
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token'
      }
    });
  }
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Start server without MongoDB for demo
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 HelpDesk Mini Server Started!');
  console.log(`📊 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Hackathon info: http://localhost:${PORT}/.well-known/hackathon.json`);
  console.log('\n💡 Demo Mode: Running without database');
  console.log('🔧 To enable full functionality:');
  console.log('1. Install MongoDB: https://www.mongodb.com/try/download/community');
  console.log('2. Or use MongoDB Atlas: https://www.mongodb.com/atlas');
  console.log('3. Run: npm run seed (after MongoDB is connected)\n');
});

module.exports = app;

