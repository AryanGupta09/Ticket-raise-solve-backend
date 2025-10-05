# Quick Startup Guide

## Prerequisites
- Node.js (v16+)
- MongoDB running locally or connection string ready

## 1. Install Dependencies
```bash
npm install
```

## 2. Start MongoDB
Make sure MongoDB is running on your system:
- **Local MongoDB**: `mongod`
- **MongoDB Atlas**: Update MONGODB_URI in .env

## 3. Seed Database (Optional)
```bash
npm run seed
```

## 4. Start Server
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

## 5. Test API (Optional)
```bash
npm test
```

## 6. Access Endpoints
- Health: http://localhost:5000/api/health
- Hackathon: http://localhost:5000/.well-known/hackathon.json

## Test Accounts (after seeding)
- **Admin**: admin@helpdesk.com / admin123
- **Agent**: agent@helpdesk.com / agent123  
- **User**: user@helpdesk.com / user123

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- For Atlas: whitelist your IP address

### Port Already in Use
- Change PORT in .env file
- Kill existing process: `lsof -ti:5000 | xargs kill -9`

### JWT Errors
- Ensure JWT_SECRET is set in .env
- Check token format in Authorization header: `Bearer <token>`

## API Testing with curl

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@helpdesk.com","password":"user123"}'
```

### Create Ticket
```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Issue","description":"Test description","priority":"high"}'
```

### List Tickets
```bash
curl http://localhost:5000/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN"
```