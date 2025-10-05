# HelpDesk Mini Backend

A complete MERN stack backend for a helpdesk system with JWT authentication, role-based access control, ticket management, SLA tracking, and more.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (user, agent, admin)
- **Ticket Management**: Create, view, update tickets with priority and status tracking
- **Comment System**: Threaded comments with internal/external visibility
- **SLA Tracking**: Automatic deadline calculation and breach detection
- **Timeline Logs**: Complete audit trail of all ticket activities
- **Rate Limiting**: 60 requests per minute per user
- **Idempotency**: Prevent duplicate ticket creation
- **Optimistic Locking**: Prevent concurrent update conflicts
- **Search & Pagination**: Full-text search with paginated results

## Tech Stack

- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Joi** - Input validation
- **node-cron** - SLA breach checking
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin resource sharing

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your MongoDB URI and JWT secret.

3. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

4. **Start the server**:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## Test Credentials

After running the seed script, you can use these test accounts:

| Role  | Email                | Password |
|-------|---------------------|----------|
| Admin | admin@helpdesk.com  | admin123 |
| Agent | agent@helpdesk.com  | agent123 |
| Agent | agent2@helpdesk.com | agent123 |
| User  | user@helpdesk.com   | user123  |
| User  | user2@helpdesk.com  | user123  |

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Tickets

- `POST /api/tickets` - Create new ticket
- `GET /api/tickets` - List tickets (with pagination & search)
- `GET /api/tickets/:id` - Get ticket details with comments & timeline
- `PATCH /api/tickets/:id` - Update ticket (agents/admins only)
- `POST /api/tickets/:id/comments` - Add comment to ticket

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/agents` - Get all agents (for assignment)
- `PATCH /api/users/:id/role` - Update user role (admin only)
- `PATCH /api/users/:id/deactivate` - Deactivate user (admin only)

### System

- `GET /api/health` - Health check endpoint
- `GET /.well-known/hackathon.json` - Hackathon metadata

## API Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create a ticket (with idempotency)
```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Idempotency-Key: unique-key-123" \
  -d '{
    "title": "Login Issue",
    "description": "Cannot access my account",
    "priority": "high"
  }'
```

### List tickets with search and pagination
```bash
curl "http://localhost:5000/api/tickets?limit=10&offset=0&q=login" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update ticket status (with optimistic locking)
```bash
curl -X PATCH http://localhost:5000/api/tickets/TICKET_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "in_progress",
    "assignedTo": "AGENT_ID",
    "version": 0
  }'
```

### Add a comment
```bash
curl -X POST http://localhost:5000/api/tickets/TICKET_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "I have the same issue",
    "isInternal": false
  }'
```

## Role-Based Access Control

### User Permissions
- Create tickets
- View own tickets
- Add comments to own tickets

### Agent Permissions
- View assigned tickets and unassigned open tickets
- Update ticket status and assignment
- Add comments (including internal notes)

### Admin Permissions
- View all tickets
- Assign tickets to agents
- Manage users and roles
- All agent permissions

## SLA Management

Tickets automatically get deadlines based on priority:
- **Urgent**: 4 hours
- **High**: 8 hours
- **Medium**: 24 hours
- **Low**: 72 hours

A cron job runs every 5 minutes to check for SLA breaches and automatically marks overdue tickets as "breached".

## Error Handling

All API responses follow a consistent error format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "field": "fieldName",
    "message": "Human readable error message"
  }
}
```

Common error codes:
- `FIELD_REQUIRED` - Missing required field
- `VALIDATION_ERROR` - Input validation failed
- `INVALID_TOKEN` - JWT token invalid or expired
- `ACCESS_DENIED` - Insufficient permissions
- `RATE_LIMIT` - Too many requests
- `STALE_UPDATE` - Optimistic locking conflict

## Project Structure

```
backend/
├── controllers/          # Request handlers
│   ├── authController.js
│   ├── ticketController.js
│   └── userController.js
├── middlewares/          # Custom middleware
│   ├── auth.js          # Authentication & authorization
│   └── validation.js    # Input validation schemas
├── models/              # Database schemas
│   ├── User.js
│   ├── Ticket.js
│   ├── Comment.js
│   └── Timeline.js
├── routes/              # API routes
│   ├── auth.js
│   ├── tickets.js
│   └── users.js
├── utils/               # Utility functions
│   ├── slaChecker.js    # SLA breach detection
│   └── seed.js          # Database seeding
├── .env                 # Environment variables
├── .env.example         # Environment template
├── package.json         # Dependencies and scripts
├── server.js           # Main application file
└── README.md           # This file
```

## Development

### Running in Development Mode
```bash
npm run dev
```

This uses nodemon for automatic server restart on file changes.

### Database Seeding
```bash
npm run seed
```

This will:
1. Clear existing data
2. Create test users with different roles
3. Create sample tickets with various statuses
4. Add sample comments and timeline entries

### Environment Variables

Required environment variables:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper MongoDB URI
4. Set up process manager (PM2, Docker, etc.)
5. Configure reverse proxy (nginx)
6. Enable HTTPS
7. Set up monitoring and logging

## License

MIT License