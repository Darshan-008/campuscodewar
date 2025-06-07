import { request, expect } from '../setup.js'

describe('Health Check Endpoint', () => {
  it('should return 200 OK', async () => {
    const response = await request.get('/api/health')
    expect(response.status).to.equal(200)
    expect(response.body).to.have.property('status', 'ok')
  })
}) 