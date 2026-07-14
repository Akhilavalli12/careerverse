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

describe('Application / Shortlisting API', () => {
  it('lets a recruiter shortlist a student and creates a notification', async () => {
    const { token: studentToken } = await registerAndLogin();
    const profileRes = await request(app).get('/api/students/me').set('Authorization', `Bearer ${studentToken}`);
    const studentId = profileRes.body.profile._id;

    const { token: recruiterToken } = await registerAndLogin({ role: 'recruiter' });

    const appRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ studentId, positionTitle: 'Frontend Intern' });

    expect(appRes.status).toBe(201);
    expect(appRes.body.application.status).toBe('shortlisted');

    // Verify the student received a notification
    const notifRes = await request(app).get('/api/notifications').set('Authorization', `Bearer ${studentToken}`);
    expect(notifRes.status).toBe(200);
    expect(notifRes.body.notifications.length).toBe(1);
    expect(notifRes.body.notifications[0].message).toMatch(/Frontend Intern/);
  });

  it('rejects a student from creating an application', async () => {
    const { token } = await registerAndLogin();
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: '000000000000000000000000', positionTitle: 'X' });

    expect(res.status).toBe(403);
  });

  it('lets a recruiter update an application status they own', async () => {
    const { token: studentToken } = await registerAndLogin();
    const profileRes = await request(app).get('/api/students/me').set('Authorization', `Bearer ${studentToken}`);
    const studentId = profileRes.body.profile._id;

    const { token: recruiterToken } = await registerAndLogin({ role: 'recruiter' });
    const appRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ studentId, positionTitle: 'Backend Intern' });

    const updateRes = await request(app)
      .patch(`/api/applications/${appRes.body.application._id}`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ status: 'interviewing' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.application.status).toBe('interviewing');
  });

  it('prevents one recruiter from updating another recruiter\'s application', async () => {
    const { token: studentToken } = await registerAndLogin();
    const profileRes = await request(app).get('/api/students/me').set('Authorization', `Bearer ${studentToken}`);
    const studentId = profileRes.body.profile._id;

    const { token: recruiterAToken } = await registerAndLogin({ role: 'recruiter' });
    const { token: recruiterBToken } = await registerAndLogin({ role: 'recruiter' });

    const appRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${recruiterAToken}`)
      .send({ studentId, positionTitle: 'Design Intern' });

    const updateRes = await request(app)
      .patch(`/api/applications/${appRes.body.application._id}`)
      .set('Authorization', `Bearer ${recruiterBToken}`)
      .send({ status: 'hired' });

    expect(updateRes.status).toBe(404); // scoped query means recruiter B can't find/touch it
  });
});

describe('AI / LinkedIn Import API', () => {
  it('rejects a non-student from hitting AI routes', async () => {
    const { token } = await registerAndLogin({ role: 'recruiter' });
    const res = await request(app)
      .post('/api/ai/linkedin-import')
      .set('Authorization', `Bearer ${token}`)
      .send({ pastedText: 'Some LinkedIn text here that is long enough to pass validation' });

    expect(res.status).toBe(403);
  });

  it('rejects LinkedIn import with too-short pasted text (when AI is configured) or returns 503 (when not)', async () => {
    const { token } = await registerAndLogin();
    const res = await request(app)
      .post('/api/ai/linkedin-import')
      .set('Authorization', `Bearer ${token}`)
      .send({ pastedText: 'short' });

    // Without ANTHROPIC_API_KEY set in test env, the 503 "not configured" guard fires first;
    // either outcome (400 for short text, 503 for missing config) is a correctly-guarded response.
    expect([400, 503]).toContain(res.status);
  });

  it('returns 503 when ANTHROPIC_API_KEY is not configured', async () => {
    const { token } = await registerAndLogin();
    const res = await request(app)
      .post('/api/ai/analyze')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    // No ANTHROPIC_API_KEY is set in the test environment by design
    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/not configured/i);
  });
});

describe('Admin API', () => {
  it('rejects non-admin roles from admin stats', async () => {
    const { token } = await registerAndLogin({ role: 'recruiter' });
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('allows an admin to view platform stats', async () => {
    const { token } = await registerAndLogin({ role: 'admin' });
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.stats).toHaveProperty('totalUsers');
  });

  it('lets an admin deactivate a user, and that user is then blocked', async () => {
    const { token: adminToken } = await registerAndLogin({ role: 'admin' });
    const { token: studentToken, user: student } = await registerAndLogin();

    const deactivateRes = await request(app)
      .patch(`/api/admin/users/${student.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(deactivateRes.status).toBe(200);

    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${studentToken}`);
    expect(meRes.status).toBe(403);
  });
});
