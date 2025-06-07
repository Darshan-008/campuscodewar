import request from 'supertest';
import { app } from '../index.js';

describe('Server API Tests', function () {
  this.timeout(10000);

  describe('Authentication Endpoints', function () {
    it('should return 400 for invalid login', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid@example.com', password: 'wrongpassword' })
        .expect(400);
    });
  });
});