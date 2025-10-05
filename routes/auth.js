const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { auth } = require('../middlewares/auth');
const { validate, registerSchema, loginSchema } = require('../middlewares/validation');

const router = express.Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/auth/profile
router.get('/profile', auth, getProfile);

module.exports = router;