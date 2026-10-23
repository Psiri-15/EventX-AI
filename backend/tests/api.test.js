const test = require('node:test');
const assert = require('node:assert');
const http = require('http');

const API_BASE = 'http://localhost:5000/api';

// Helper for making API requests in tests
const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

test('EventX AI Backend API Integration Tests', async (t) => {
  let attendeeToken = '';
  let organizerToken = '';
  let adminToken = '';
  let sampleEventId = '';
  let sampleTicketCode = '';

  await t.test('1. Health check endpoint responds online', async () => {
    const res = await request('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'online');
  });

  await t.test('2. Attendee Authentication & Profile', async () => {
    const res = await request('/auth/login', 'POST', {
      email: 'alex@eventx.ai',
      password: 'Attendee@123',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.user.role, 'attendee');
    attendeeToken = res.data.token;
  });

  await t.test('3. Organizer Authentication', async () => {
    const res = await request('/auth/login', 'POST', {
      email: 'techcorp@eventx.ai',
      password: 'Organizer@123',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.role, 'organizer');
    organizerToken = res.data.token;
  });

  await t.test('4. Admin Authentication', async () => {
    const res = await request('/auth/login', 'POST', {
      email: 'admin@eventx.ai',
      password: 'Admin@123',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.role, 'admin');
    adminToken = res.data.token;
  });

  await t.test('5. Public Event Discovery & Filtering', async () => {
    const res = await request('/events?category=technology');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.events));
    assert.ok(res.data.events.length > 0);
    sampleEventId = res.data.events[0]._id;
  });

  await t.test('6. Role Authorization: Attendee blocked from Admin routes', async () => {
    const res = await request('/admin/stats', 'GET', null, attendeeToken);
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
  });

  await t.test('7. Role Authorization: Admin can access Admin stats', async () => {
    const res = await request('/admin/stats', 'GET', null, adminToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.stats.totalUsers > 0);
  });

  await t.test('8. Attendee views their tickets & extracts ticket code', async () => {
    const res = await request('/tickets/my-tickets', 'GET', null, attendeeToken);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.tickets.length > 0);
    sampleTicketCode = res.data.tickets[0].ticketCode;
    assert.ok(sampleTicketCode.startsWith('TKT-'));
  });

  await t.test('9. Organizer Validates Ticket at Gate', async () => {
    const res = await request('/tickets/validate', 'POST', { ticketCode: sampleTicketCode }, organizerToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.isValid, true);
    assert.strictEqual(res.data.status, 'valid');
  });

  await t.test('10. AI Chatbot queries and responds accurately', async () => {
    const res = await request('/ai/chat', 'POST', { message: 'What technology events are available?' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.reply.length > 20);
  });

  await t.test('11. AI Personalized Recommendations return scored events', async () => {
    const res = await request('/ai/recommendations', 'GET', null, attendeeToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.recommendations));
  });
});
