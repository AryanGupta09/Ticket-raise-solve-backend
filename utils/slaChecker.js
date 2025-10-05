const Ticket = require('../models/Ticket');
const Timeline = require('../models/Timeline');

const checkSLABreaches = async () => {
  try {
    const now = new Date();
    
    // Find tickets that are past their deadline and not already marked as breached
    const breachedTickets = await Ticket.find({
      deadline: { $lt: now },
      status: { $nin: ['resolved', 'closed', 'breached'] }
    });

    console.log(`Found ${breachedTickets.length} tickets with SLA breaches`);

    for (const ticket of breachedTickets) {
      // Update ticket status to breached
      await Ticket.findByIdAndUpdate(ticket._id, {
        status: 'breached',
        version: ticket.version + 1
      });

      // Create timeline entry
      await Timeline.create({
        ticket: ticket._id,
        action: 'sla_breached',
        actor: null, // System action
        details: {
          originalDeadline: ticket.deadline,
          breachedAt: now,
          originalStatus: ticket.status
        }
      });

      console.log(`Marked ticket ${ticket._id} as SLA breached`);
    }

    return breachedTickets.length;
  } catch (error) {
    console.error('SLA breach check error:', error);
    return 0;
  }
};

module.exports = {
  checkSLABreaches
};