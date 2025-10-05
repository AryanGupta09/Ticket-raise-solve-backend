const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    // Only admins can view all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          code: 'ACCESS_DENIED',
          message: 'Only admins can view all users'
        }
      });
    }

    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      users
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Get users error:', error);
    }
    res.status(500).json({
      error: {
        code: 'FETCH_USERS_FAILED',
        message: 'Failed to fetch users'
      }
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Only admins can update user roles
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          code: 'ACCESS_DENIED',
          message: 'Only admins can update user roles'
        }
      });
    }

    if (!['user', 'agent', 'admin'].includes(role)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ROLE',
          field: 'role',
          message: 'Invalid role specified'
        }
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Update user role error:', error);
    }
    res.status(500).json({
      error: {
        code: 'UPDATE_USER_FAILED',
        message: 'Failed to update user role'
      }
    });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Only admins can deactivate users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          code: 'ACCESS_DENIED',
          message: 'Only admins can deactivate users'
        }
      });
    }

    // Prevent self-deactivation
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        error: {
          code: 'SELF_DEACTIVATION',
          message: 'Cannot deactivate your own account'
        }
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      message: 'User deactivated successfully',
      user
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Deactivate user error:', error);
    }
    res.status(500).json({
      error: {
        code: 'DEACTIVATE_USER_FAILED',
        message: 'Failed to deactivate user'
      }
    });
  }
};

const getAgents = async (req, res) => {
  try {
    const agents = await User.find({ 
      role: { $in: ['agent', 'admin'] },
      isActive: true 
    }).select('name email role');

    res.json({
      agents
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Get agents error:', error);
    }
    res.status(500).json({
      error: {
        code: 'FETCH_AGENTS_FAILED',
        message: 'Failed to fetch agents'
      }
    });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  deactivateUser,
  getAgents
};