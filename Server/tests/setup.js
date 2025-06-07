import { expect } from 'chai'
import supertest from 'supertest'
import { app } from '../index.js'

// Global test setup
before(async () => {
  // Add any setup code here (e.g., database connection for testing)
})

// Global test teardown
after(async () => {
  // Add any cleanup code here
})

export const request = supertest(app)
export { expect } 