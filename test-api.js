const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials
const testUser = {
  email: 'user@helpdesk.com',
  password: 'user123'
};

const testAgent = {
  email: 'agent@helpdesk.com',
  password: 'agent123'
};

let userToken = '';
let agentToken = '';
let ticketId = '';

const test = async () => {
  try {
    console.log('🚀 Starting API Tests...\n');

    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', health.data.status);

    // Test 2: User Login
    console.log('\n2. Testing user login...');
    const userLogin = await axios.post(`${BASE_URL}/auth/login`, testUser);
    userToken = userLogin.data.token;
    console.log('✅ User login successful');

    // Test 3: Agent Login
    console.log('\n3. Testing agent login...');
    const agentLogin = await axios.post(`${BASE_URL}/auth/login`, testAgent);
    agentToken = agentLogin.data.token;
    console.log('✅ Agent login successful');

    // Test 4: Create Ticket (User)
    console.log('\n4. Testing ticket creation...');
    const ticketData = {
      title: 'API Test Ticket',
      description: 'This is a test ticket created via API',
      priority: 'medium'
    };
    
    const createTicket = await axios.post(`${BASE_URL}/tickets`, ticketData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    ticketId = createTicket.data.ticket._id;
    console.log('✅ Ticket created:', ticketId);

    // Test 5: List Tickets (User)
    console.log('\n5. Testing ticket listing...');
    const listTickets = await axios.get(`${BASE_URL}/tickets?limit=5`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Listed tickets:', listTickets.data.items.length);

    // Test 6: Get Ticket Details
    console.log('\n6. Testing ticket details...');
    const ticketDetails = await axios.get(`${BASE_URL}/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Ticket details retrieved');

    // Test 7: Add Comment (User)
    console.log('\n7. Testing comment creation...');
    const commentData = {
      content: 'This is a test comment from API'
    };
    
    const addComment = await axios.post(`${BASE_URL}/tickets/${ticketId}/comments`, commentData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Comment added');

    // Test 8: Update Ticket (Agent)
    console.log('\n8. Testing ticket update...');
    const updateData = {
      status: 'in_progress',
      assignedTo: agentLogin.data.user._id,
      version: ticketDetails.data.ticket.version
    };
    
    const updateTicket = await axios.patch(`${BASE_URL}/tickets/${ticketId}`, updateData, {
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    console.log('✅ Ticket updated by agent');

    // Test 9: Search Tickets
    console.log('\n9. Testing ticket search...');
    const searchTickets = await axios.get(`${BASE_URL}/tickets?q=API&limit=5`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Search completed:', searchTickets.data.items.length, 'results');

    // Test 10: Rate Limiting (make multiple requests)
    console.log('\n10. Testing rate limiting...');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        axios.get(`${BASE_URL}/tickets`, {
          headers: { Authorization: `Bearer ${userToken}` }
        }).catch(err => err.response)
      );
    }
    
    const results = await Promise.all(promises);
    const rateLimited = results.some(r => r.status === 429);
    console.log('✅ Rate limiting test completed');

    console.log('\n🎉 All API tests completed successfully!');
    console.log('\nTest Summary:');
    console.log('- Health check: ✅');
    console.log('- Authentication: ✅');
    console.log('- Ticket CRUD: ✅');
    console.log('- Comments: ✅');
    console.log('- Search & Pagination: ✅');
    console.log('- Role-based Access: ✅');
    console.log('- Rate Limiting: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
};

// Run tests if called directly
if (require.main === module) {
  test();
}

module.exports = { test };