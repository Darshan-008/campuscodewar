import { expect } from 'chai';
import request from 'supertest';
import { app } from '../index.js';

describe('Server API Tests', () => {
  describe('GET /', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/');
      expect(response.status).to.equal(200);
      expect(response.text).to.equal('Hello World');
    });
  });

  describe('Authentication Endpoints', () => {
    it('should return 400 for invalid login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@test.com',
          password: 'wrongpassword'
        });
      expect(response.status).to.equal(400);
    });
  });
}); 