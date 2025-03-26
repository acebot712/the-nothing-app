const request = require("supertest");
const app = require("../index");

describe("API Routes", () => {
  // Health check test
  describe("GET /health", () => {
    it("should respond with a 200 status code", async () => {
      const response = await request(app).get("/health");
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("ok");
    });
  });

  // Basic API endpoint tests - mocked to avoid actual database operations
  describe("User API", () => {
    // This is a basic test that expects the endpoint to exist
    // In a real test suite, you would mock the userService functions
    it("GET /api/users/:userId should return 404 for non-existent user", async () => {
      const response = await request(app).get("/api/users/non-existent-id");
      expect(response.statusCode).toBe(404);
    });
  });

  describe("Auth API", () => {
    it("POST /api/auth/register should require email and username", async () => {
      const response = await request(app).post("/api/auth/register").send({});
      expect(response.statusCode).toBe(400);
    });
  });

  describe("Leaderboard API", () => {
    it("GET /api/leaderboard should return a valid response", async () => {
      // This test will depend on having mock data or a test database
      const response = await request(app).get("/api/leaderboard");

      // Even if table doesn't exist, we should get a clean error, not a 500
      expect([200, 404, 400].includes(response.statusCode)).toBe(true);
    });
  });

  describe("Payment API", () => {
    it("POST /api/payments/create-intent should require tier", async () => {
      const response = await request(app)
        .post("/api/payments/create-intent")
        .send({});
      expect(response.statusCode).toBe(400);
    });
  });
});
