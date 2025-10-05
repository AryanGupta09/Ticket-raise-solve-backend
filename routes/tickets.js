const express = require('express');
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment
} = require('../controllers/ticketController');
const { auth, authorize } = require('../middlewares/auth');
const { validate, ticketSchema, updateTicketSchema, commentSchema } = require('../middlewares/validation');

const router = express.Router();

// All routes require authentication
router.use(auth);

// POST /api/tickets - Create a new ticket
router.post('/', validate(ticketSchema), createTicket);

// GET /api/tickets - List tickets with pagination and search
router.get('/', getTickets);

// GET /api/tickets/:id - Get ticket details with comments and timeline
router.get('/:id', getTicketById);

// PATCH /api/tickets/:id - Update ticket (agents and admins only)
router.patch('/:id', authorize('agent', 'admin'), validate(updateTicketSchema), updateTicket);

// POST /api/tickets/:id/comments - Add comment to ticket
router.post('/:id/comments', validate(commentSchema), addComment);

module.exports = router;