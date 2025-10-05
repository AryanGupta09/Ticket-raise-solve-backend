const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');
const apiRoutes = require('./routes/api');
const { checkSLABreaches } = require('./utils/slaChecker');

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true
}));
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
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

// Root endpoint - Beautiful landing page
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Welcome to HelpDesk Mini API',
    description: 'A complete helpdesk system with ticket management, SLA tracking, and role-based access control',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    quick_links: {
      api_info: '/api',
      api_docs: '/api/docs',
      health_check: '/api/health',
      hackathon_info: '/.well-known/hackathon.json',
      system_info: '/api/info',
      stats: '/api/stats'
    },
    endpoints: {
      authentication: '/api/auth',
      tickets: '/api/tickets',
      users: '/api/users',
      system: '/api'
    },
    features: [
      '🔐 JWT Authentication',
      '👥 Role-based Access Control',
      '🎫 Ticket Management',
      '⏰ SLA Tracking',
      '💬 Comment System',
      '📊 Timeline & Audit Trail',
      '🛡️ Rate Limiting',
      '✅ Input Validation',
      '🌐 CORS Support'
    ],
    tech_stack: {
      backend: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose'],
      security: ['JWT', 'bcryptjs', 'Rate Limiting'],
      features: ['Cron Jobs', 'Input Validation', 'Error Handling']
    },
    deployment: {
      platform: 'Render',
      environment: process.env.NODE_ENV || 'development',
      database: process.env.MONGODB_URI ? 'MongoDB Atlas' : 'Local MongoDB'
    },
    documentation: {
      github: 'https://github.com/your-username/helpdesk-mini',
      api_documentation: '/api/docs',
      health_status: '/api/health'
    },
    contact: {
      developer: 'HelpDesk Mini Team',
      email: 'support@helpdesk-mini.com',
      repository: 'https://github.com/your-username/helpdesk-mini'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Hackathon endpoint
app.get('/.well-known/hackathon.json', (req, res) => {
  res.json({
    name: 'HelpDesk Mini',
    description: 'A complete helpdesk system with ticket management, SLA tracking, and role-based access control',
    version: '1.0.0',
    tech_stack: ['Node.js', 'Express', 'MongoDB', 'JWT', 'React', 'Vite'],
    features: [
      'JWT Authentication',
      'Role-based Access Control',
      'Ticket Management',
      'SLA Tracking',
      'Comment System',
      'Timeline Logs',
      'Rate Limiting',
      'Input Validation',
      'Error Handling',
      'CORS Support'
    ],
    api_endpoints: {
      root: '/',
      api_info: '/api',
      documentation: '/api/docs',
      health_check: '/api/health',
      system_info: '/api/info',
      stats: '/api/stats',
      authentication: '/api/auth',
      tickets: '/api/tickets',
      users: '/api/users'
    },
    demo_credentials: {
      admin: 'admin@helpdesk.com / admin123',
      agent: 'agent@helpdesk.com / agent123',
      user: 'user@helpdesk.com / user123'
    },
    deployment: {
      backend: 'Render',
      frontend: 'Vercel/Netlify',
      database: 'MongoDB Atlas'
    },
    repository: 'https://github.com/your-username/helpdesk-mini',
    live_demo: {
      backend: 'https://helpdesk-mini-backend.onrender.com',
      frontend: 'https://helpdesk-mini-frontend.vercel.app'
    },
    hackathon_info: {
      event: 'Your Hackathon Name',
      team: 'Your Team Name',
      submission_date: new Date().toISOString(),
      category: 'Web Application',
      track: 'Full Stack Development'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  
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

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk-mini';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    // Start SLA checker cron job (runs every 5 minutes)
    cron.schedule('*/5 * * * *', () => {
      checkSLABreaches();
    });
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      }
    });
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
    
    // Start server anyway for demo purposes
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Server running on port ${PORT} (without database)`);
      }
    });
  });

module.exports = app;