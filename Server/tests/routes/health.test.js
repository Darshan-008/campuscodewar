import request from 'supertest';
import { app } from '../../index.js';

describe('Health Check Endpoint', function () {
  this.timeout(10000); // Increase timeout for all tests in this block

  it('should return 200 OK', (done) => {
    request(app)
      .get('/health')
      .expect(200, done);
  });
});