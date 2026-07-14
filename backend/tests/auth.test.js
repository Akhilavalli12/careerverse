const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
  const validUser = {
    name: 'Test Student',
    email: 'student@test.com',
    password: 'password123',
    role: 'student',
  };

  describe('POST /api/auth/register', () => {
    it('registers a new student and returns a token', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(validUser.email);
      expect(res.body.user.role).toBe('student');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('rejects registration with a duplicate email', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const res = await request(app).post('/api/auth/register').send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('rejects registration missing required fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects registration with a malformed email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'not-an-email' });

      expect(res.status).toBe(400);
    });

    it('rejects registration with a password under 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'short@test.com', password: 'ab1' });

      expect(res.status).toBe(400);
    });

    it('rejects registration with a password containing no digit', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'nodigit@test.com', password: 'passwordonly' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/number/i);
    });

    it('defaults to role student for an invalid role value', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'other@test.com', role: 'superadmin' });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('student');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validUser);
    });

    it('logs in with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('rejects an incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects a non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('rejects requests with no token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('rejects requests with an invalid token', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });

    it('returns the current user with a valid token', async () => {
      const registerRes = await request(app).post('/api/auth/register').send(validUser);
      const token = registerRes.body.token;

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(validUser.email);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('always returns success, even for an unknown email (no user enumeration)', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({ email: 'unknown@test.com' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
