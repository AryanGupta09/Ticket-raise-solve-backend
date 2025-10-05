const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const field = error.details[0].path[0];
      const message = error.details[0].message;
      
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: field,
          message: message
        }
      });
    }
    
    next();
  };
};

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
  name: Joi.string().required().messages({
    'any.required': 'Name is required'
  }),
  role: Joi.string().valid('user', 'agent', 'admin').default('user')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const ticketSchema = Joi.object({
  title: Joi.string().max(200).required().messages({
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().required().messages({
    'any.required': 'Description is required'
  }),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium')
});

const commentSchema = Joi.object({
  content: Joi.string().required().messages({
    'any.required': 'Comment content is required'
  }),
  parentComment: Joi.string().optional(),
  isInternal: Joi.boolean().default(false)
});

const updateTicketSchema = Joi.object({
  status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').optional(),
  assignedTo: Joi.string().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  version: Joi.number().required().messages({
    'any.required': 'Version is required for optimistic locking'
  })
});

const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid('user', 'agent', 'admin').required().messages({
    'any.required': 'Role is required',
    'any.only': 'Role must be user, agent, or admin'
  })
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  ticketSchema,
  commentSchema,
  updateTicketSchema,
  updateUserRoleSchema
};