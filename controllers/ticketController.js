const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const Timeline = require('../models/Timeline');
const User = require('../models/User');

const createTicket = async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        const idempotencyKey = req.headers['idempotency-key'];

        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({
                error: {
                    code: 'FIELD_REQUIRED',
                    field: !title ? 'title' : 'description',
                    message: !title ? 'Title is required' : 'Description is required'
                }
            });
        }

        // Check for idempotency
        if (idempotencyKey) {
            const existingTicket = await Ticket.findOne({ idempotencyKey });
            if (existingTicket) {
                return res.status(200).json({
                    message: 'Ticket already exists',
                    ticket: existingTicket
                });
            }
        }

        // Create ticket
        const ticketData = {
            title,
            description,
            priority,
            createdBy: req.user._id
        };

        if (idempotencyKey) {
            ticketData.idempotencyKey = idempotencyKey;
        }

        const ticket = new Ticket(ticketData);
        await ticket.save();

        // Create timeline entry
        await Timeline.create({
            ticket: ticket._id,
            action: 'created',
            actor: req.user._id,
            details: { priority }
        });

        // Populate the ticket
        await ticket.populate('createdBy', 'name email role');

        res.status(201).json({
            message: 'Ticket created successfully',
            ticket
        });
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({
            error: {
                code: 'TICKET_CREATION_FAILED',
                message: 'Failed to create ticket'
            }
        });
    }
};

const getTickets = async (req, res) => {
    try {
        const { limit = 10, offset = 0, q } = req.query;
        const limitNum = parseInt(limit);
        const offsetNum = parseInt(offset);

        // Build query based on user role
        let query = {};

        if (req.user.role === 'user') {
            query.createdBy = req.user._id;
        } else if (req.user.role === 'agent') {
            query.$or = [
                { assignedTo: req.user._id },
                { assignedTo: null, status: { $in: ['open', 'in_progress'] } }
            ];
        }
        // Admin can see all tickets (no additional query filters)

        // Add search functionality
        if (q) {
            query.$text = { $search: q };
        }

        const tickets = await Ticket.find(query)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role')
            .sort({ createdAt: -1 })
            .skip(offsetNum)
            .limit(limitNum);

        const total = await Ticket.countDocuments(query);
        const nextOffset = offsetNum + limitNum < total ? offsetNum + limitNum : null;

        res.json({
            items: tickets,
            total,
            next_offset: nextOffset
        });
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({
            error: {
                code: 'FETCH_TICKETS_FAILED',
                message: 'Failed to fetch tickets'
            }
        });
    }
};

const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;

        const ticket = await Ticket.findById(id)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role');

        if (!ticket) {
            return res.status(404).json({
                error: {
                    code: 'TICKET_NOT_FOUND',
                    message: 'Ticket not found'
                }
            });
        }

        // Check permissions
        if (req.user.role === 'user' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You can only view your own tickets'
                }
            });
        }

        if (req.user.role === 'agent' &&
            ticket.assignedTo?._id.toString() !== req.user._id.toString() &&
            ticket.assignedTo !== null) {
            return res.status(403).json({
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You can only view assigned tickets'
                }
            });
        }

        // Get comments
        const comments = await Comment.find({ ticket: id })
            .populate('author', 'name email role')
            .populate('parentComment')
            .sort({ createdAt: 1 });

        // Get timeline
        const timeline = await Timeline.find({ ticket: id })
            .populate('actor', 'name email role')
            .sort({ timestamp: 1 });

        res.json({
            ticket,
            comments,
            timeline
        });
    } catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({
            error: {
                code: 'FETCH_TICKET_FAILED',
                message: 'Failed to fetch ticket'
            }
        });
    }
};

const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assignedTo, priority, version } = req.body;

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({
                error: {
                    code: 'TICKET_NOT_FOUND',
                    message: 'Ticket not found'
                }
            });
        }

        // Check optimistic locking
        if (ticket.version !== version) {
            return res.status(409).json({
                error: {
                    code: 'STALE_UPDATE',
                    message: 'Ticket has been modified by another user. Please refresh and try again.'
                }
            });
        }

        // Check permissions
        if (req.user.role === 'user') {
            return res.status(403).json({
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'Users cannot update tickets'
                }
            });
        }

        if (req.user.role === 'agent' &&
            ticket.assignedTo?.toString() !== req.user._id.toString() &&
            ticket.assignedTo !== null) {
            return res.status(403).json({
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You can only update assigned tickets'
                }
            });
        }

        const updates = {};
        const timelineDetails = {};

        if (status && status !== ticket.status) {
            updates.status = status;
            timelineDetails.oldStatus = ticket.status;
            timelineDetails.newStatus = status;

            await Timeline.create({
                ticket: id,
                action: 'status_changed',
                actor: req.user._id,
                details: timelineDetails
            });
        }

        if (assignedTo !== undefined && assignedTo !== ticket.assignedTo?.toString()) {
            if (assignedTo) {
                const assignee = await User.findById(assignedTo);
                if (!assignee || !['agent', 'admin'].includes(assignee.role)) {
                    return res.status(400).json({
                        error: {
                            code: 'INVALID_ASSIGNEE',
                            message: 'Can only assign to agents or admins'
                        }
                    });
                }
            }

            updates.assignedTo = assignedTo || null;

            await Timeline.create({
                ticket: id,
                action: 'assigned',
                actor: req.user._id,
                details: {
                    assignedTo: assignedTo,
                    previousAssignee: ticket.assignedTo
                }
            });
        }

        if (priority && priority !== ticket.priority) {
            updates.priority = priority;
            timelineDetails.oldPriority = ticket.priority;
            timelineDetails.newPriority = priority;
        }

        // Increment version for optimistic locking
        updates.version = ticket.version + 1;

        const updatedTicket = await Ticket.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        ).populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role');

        if (Object.keys(timelineDetails).length > 0) {
            await Timeline.create({
                ticket: id,
                action: 'updated',
                actor: req.user._id,
                details: timelineDetails
            });
        }

        res.json({
            message: 'Ticket updated successfully',
            ticket: updatedTicket
        });
    } catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({
            error: {
                code: 'UPDATE_TICKET_FAILED',
                message: 'Failed to update ticket'
            }
        });
    }
};

const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, parentComment, isInternal } = req.body;

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({
                error: {
                    code: 'TICKET_NOT_FOUND',
                    message: 'Ticket not found'
                }
            });
        }

        // Check permissions
        if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You can only comment on your own tickets'
                }
            });
        }

        if (req.user.role === 'agent' &&
            ticket.assignedTo?.toString() !== req.user._id.toString() &&
            ticket.assignedTo !== null) {
            return res.status(403).json({
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You can only comment on assigned tickets'
                }
            });
        }

        // Validate parent comment if provided
        if (parentComment) {
            const parent = await Comment.findById(parentComment);
            if (!parent || parent.ticket.toString() !== id) {
                return res.status(400).json({
                    error: {
                        code: 'INVALID_PARENT_COMMENT',
                        message: 'Invalid parent comment'
                    }
                });
            }
        }

        const comment = new Comment({
            content,
            ticket: id,
            author: req.user._id,
            parentComment: parentComment || null,
            isInternal: isInternal && ['agent', 'admin'].includes(req.user.role)
        });

        await comment.save();
        await comment.populate('author', 'name email role');

        // Create timeline entry
        await Timeline.create({
            ticket: id,
            action: 'comment_added',
            actor: req.user._id,
            details: {
                commentId: comment._id,
                isInternal: comment.isInternal
            }
        });

        res.status(201).json({
            message: 'Comment added successfully',
            comment
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            error: {
                code: 'ADD_COMMENT_FAILED',
                message: 'Failed to add comment'
            }
        });
    }
};

module.exports = {
    createTicket,
    getTickets,
    getTicketById,
    updateTicket,
    addComment
};