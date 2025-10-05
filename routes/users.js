const express = require('express');
const {
  getUsers,
  updateUserRole,
  deactivateUser,
  getAgents
} = require('../controllers/userController');
const { auth, authorize } = require('../middlewares/auth');
const { validate, updateUserRoleSchema } = require('../middlewares/validation');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/users - Get all users (admin only)
router.get('/', authorize('admin'), getUsers);

// GET /api/users/agents - Get all agents (for assignment dropdown)
router.get('/agents', authorize('agent', 'admin'), getAgents);

// PATCH /api/users/:id/role - Update user role (admin only)
router.patch('/:id/role', authorize('admin'), validate(updateUserRoleSchema), updateUserRole);

// PATCH /api/users/:id/deactivate - Deactivate user (admin only)
router.patch('/:id/deactivate', authorize('admin'), deactivateUser);

module.exports = router;