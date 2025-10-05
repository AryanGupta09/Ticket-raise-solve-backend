const mongoose = require('mongoose');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const Timeline = require('../models/Timeline');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk-mini');
    if (process.env.NODE_ENV !== 'production') {
      console.log('Connected to MongoDB');
    }

    // Clear existing data
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await Comment.deleteMany({});
    await Timeline.deleteMany({});
    if (process.env.NODE_ENV !== 'production') {
      console.log('Cleared existing data');
    }

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@helpdesk.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Agent Smith',
        email: 'agent@helpdesk.com',
        password: 'agent123',
        role: 'agent'
      },
      {
        name: 'Agent Johnson',
        email: 'agent2@helpdesk.com',
        password: 'agent123',
        role: 'agent'
      },
      {
        name: 'John Doe',
        email: 'user@helpdesk.com',
        password: 'user123',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'user2@helpdesk.com',
        password: 'user123',
        role: 'user'
      }
    ]);

    if (process.env.NODE_ENV !== 'production') {
      console.log('Created users');
    }

    // Create tickets
    const tickets = await Ticket.create([
      {
        title: 'Login Issues',
        description: 'Cannot login to the system. Getting authentication error.',
        priority: 'high',
        status: 'open',
        createdBy: users[3]._id, // John Doe
        assignedTo: users[1]._id, // Agent Smith
      },
      {
        title: 'Password Reset Request',
        description: 'Need to reset my password as I forgot it.',
        priority: 'medium',
        status: 'in_progress',
        createdBy: users[4]._id, // Jane Smith
        assignedTo: users[2]._id, // Agent Johnson
      },
      {
        title: 'Feature Request: Dark Mode',
        description: 'Would like to have a dark mode option in the application.',
        priority: 'low',
        status: 'open',
        createdBy: users[3]._id, // John Doe
      },
      {
        title: 'System Performance Issues',
        description: 'The system is running very slowly, especially during peak hours.',
        priority: 'urgent',
        status: 'resolved',
        createdBy: users[4]._id, // Jane Smith
        assignedTo: users[1]._id, // Agent Smith
      },
      {
        title: 'Email Notifications Not Working',
        description: 'Not receiving email notifications for ticket updates.',
        priority: 'medium',
        status: 'closed',
        createdBy: users[3]._id, // John Doe
        assignedTo: users[2]._id, // Agent Johnson
      }
    ]);

    if (process.env.NODE_ENV !== 'production') {
      console.log('Created tickets');
    }

    // Create timeline entries for tickets
    const timelineEntries = [];
    for (const ticket of tickets) {
      timelineEntries.push({
        ticket: ticket._id,
        action: 'created',
        actor: ticket.createdBy,
        details: { priority: ticket.priority }
      });

      if (ticket.assignedTo) {
        timelineEntries.push({
          ticket: ticket._id,
          action: 'assigned',
          actor: users[0]._id, // Admin assigned
          details: { assignedTo: ticket.assignedTo }
        });
      }

      if (ticket.status !== 'open') {
        timelineEntries.push({
          ticket: ticket._id,
          action: 'status_changed',
          actor: ticket.assignedTo || users[0]._id,
          details: { 
            oldStatus: 'open', 
            newStatus: ticket.status 
          }
        });
      }
    }

    await Timeline.create(timelineEntries);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Created timeline entries');
    }

    // Create some comments
    const comments = await Comment.create([
      {
        content: 'I have tried clearing my browser cache but the issue persists.',
        ticket: tickets[0]._id,
        author: users[3]._id // John Doe
      },
      {
        content: 'Thank you for the additional information. I will investigate this further.',
        ticket: tickets[0]._id,
        author: users[1]._id // Agent Smith
      },
      {
        content: 'I have sent you a password reset link to your registered email.',
        ticket: tickets[1]._id,
        author: users[2]._id // Agent Johnson
      },
      {
        content: 'This is a great suggestion. I will forward it to the development team.',
        ticket: tickets[2]._id,
        author: users[1]._id // Agent Smith
      },
      {
        content: 'The performance issue has been resolved. Please check and confirm.',
        ticket: tickets[3]._id,
        author: users[1]._id // Agent Smith
      }
    ]);

    if (process.env.NODE_ENV !== 'production') {
      console.log('Created comments');
    }

    // Create timeline entries for comments
    const commentTimelineEntries = comments.map(comment => ({
      ticket: comment.ticket,
      action: 'comment_added',
      actor: comment.author,
      details: { 
        commentId: comment._id,
        isInternal: comment.isInternal 
      }
    }));

    await Timeline.create(commentTimelineEntries);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Created comment timeline entries');
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('\n=== SEED DATA CREATED SUCCESSFULLY ===');
      console.log('\nTest Credentials:');
      console.log('Admin: admin@helpdesk.com / admin123');
      console.log('Agent: agent@helpdesk.com / agent123');
      console.log('Agent 2: agent2@helpdesk.com / agent123');
      console.log('User: user@helpdesk.com / user123');
      console.log('User 2: user2@helpdesk.com / user123');
      console.log('\nDatabase seeded with:');
      console.log(`- ${users.length} users`);
      console.log(`- ${tickets.length} tickets`);
      console.log(`- ${comments.length} comments`);
      console.log(`- ${timelineEntries.length + commentTimelineEntries.length} timeline entries`);
    }

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Seed error:', error);
    }
  } finally {
    await mongoose.disconnect();
    if (process.env.NODE_ENV !== 'production') {
      console.log('Disconnected from MongoDB');
    }
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData };