const request = require('supertest');
const app = require('../app');

const registerAndLogin = async (overrides = {}) => {
  const user = {
    name: 'Test User',
    email: `user${Date.now()}${Math.random()}@test.com`,
    password: 'password123',
    role: 'student',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(user);
  return { token: res.body.token, user: res.body.user };
};

describe('Institution API', () => {
  it('lets an institution set up its profile with branding', async () => {
    const { token } = await registerAndLogin({ role: 'institution' });

    const res = await request(app)
      .put('/api/institutions/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test College', domain: 'testcollege.edu', branding: { primaryColor: '#ff0000' } });

    expect(res.status).toBe(200);
    expect(res.body.institution.name).toBe('Test College');
    expect(res.body.institution.branding.primaryColor).toBe('#ff0000');
  });

  // Regression test: /institutions/me and /institutions/verification-requests must not be
  // shadowed by the /institutions/:id wildcard route declared after them
  it('correctly routes /institutions/me to the "me" handler, not the :id wildcard', async () => {
    const { token } = await registerAndLogin({ role: 'institution' });
    await request(app).put('/api/institutions/me').set('Authorization', `Bearer ${token}`).send({ name: 'Test College' });

    const res = await request(app).get('/api/institutions/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.institution.name).toBe('Test College');
  });

  it('correctly routes /institutions/verification-requests to its own handler, not the :id wildcard', async () => {
    const { token } = await registerAndLogin({ role: 'institution' });
    await request(app).put('/api/institutions/me').set('Authorization', `Bearer ${token}`).send({ name: 'Test College' });

    const res = await request(app)
      .get('/api/institutions/verification-requests')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.requests)).toBe(true);
  });

  it('runs the full verification lifecycle: request → approve → student flagged verified', async () => {
    const { token: instToken } = await registerAndLogin({ role: 'institution' });
    await request(app).put('/api/institutions/me').set('Authorization', `Bearer ${instToken}`).send({ name: 'Test College' });
    const meRes = await request(app).get('/api/institutions/me').set('Authorization', `Bearer ${instToken}`);
    const institutionId = meRes.body.institution._id;

    const { token: studentToken } = await registerAndLogin();

    const reqRes = await request(app)
      .post('/api/institutions/verification-requests')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ institutionId, studentIdNumber: '12345' });

    expect(reqRes.status).toBe(201);

    const approveRes = await request(app)
      .patch(`/api/institutions/verification-requests/${reqRes.body.request._id}`)
      .set('Authorization', `Bearer ${instToken}`)
      .send({ status: 'approved' });

    expect(approveRes.status).toBe(200);

    const profileRes = await request(app).get('/api/students/me').set('Authorization', `Bearer ${studentToken}`);
    expect(profileRes.body.profile.institutionVerified).toBe(true);
  });

  it('returns 404 for an unapproved institution\'s public page', async () => {
    const { token: instToken } = await registerAndLogin({ role: 'institution' });
    await request(app).put('/api/institutions/me').set('Authorization', `Bearer ${instToken}`).send({ name: 'Unapproved U' });
    const meRes = await request(app).get('/api/institutions/me').set('Authorization', `Bearer ${instToken}`);

    // Institution hasn't been approved by an admin yet
    const res = await request(app).get(`/api/institutions/${meRes.body.institution._id}`);
    expect(res.status).toBe(404);
  });
});
