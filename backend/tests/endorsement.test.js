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

describe('Endorsement API', () => {
  it('lets one student endorse a skill another student has listed', async () => {
    const { token: aToken } = await registerAndLogin();
    const { token: bToken } = await registerAndLogin();

    const bProfile = await request(app).get('/api/students/me').set('Authorization', `Bearer ${bToken}`);
    await request(app)
      .put('/api/students/me')
      .set('Authorization', `Bearer ${bToken}`)
      .send({ skills: ['React'] });

    const res = await request(app)
      .post(`/api/endorsements/${bProfile.body.profile._id}`)
      .set('Authorization', `Bearer ${aToken}`)
      .send({ skill: 'React', message: 'Great with React!' });

    expect(res.status).toBe(201);
    expect(res.body.endorsement.skill).toBe('React');
  });

  it('rejects endorsing a skill the student has not listed', async () => {
    const { token: aToken } = await registerAndLogin();
    const { token: bToken } = await registerAndLogin();
    const bProfile = await request(app).get('/api/students/me').set('Authorization', `Bearer ${bToken}`);

    const res = await request(app)
      .post(`/api/endorsements/${bProfile.body.profile._id}`)
      .set('Authorization', `Bearer ${aToken}`)
      .send({ skill: 'Rust' });

    expect(res.status).toBe(400);
  });

  it('rejects endorsing your own profile', async () => {
    const { token } = await registerAndLogin();
    const profile = await request(app).get('/api/students/me').set('Authorization', `Bearer ${token}`);
    await request(app).put('/api/students/me').set('Authorization', `Bearer ${token}`).send({ skills: ['Go'] });

    const res = await request(app)
      .post(`/api/endorsements/${profile.body.profile._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ skill: 'Go' });

    expect(res.status).toBe(400);
  });

  it('rejects a duplicate endorsement of the same skill from the same person', async () => {
    const { token: aToken } = await registerAndLogin();
    const { token: bToken } = await registerAndLogin();
    const bProfile = await request(app).get('/api/students/me').set('Authorization', `Bearer ${bToken}`);
    await request(app).put('/api/students/me').set('Authorization', `Bearer ${bToken}`).send({ skills: ['Docker'] });

    await request(app)
      .post(`/api/endorsements/${bProfile.body.profile._id}`)
      .set('Authorization', `Bearer ${aToken}`)
      .send({ skill: 'Docker' });

    const res = await request(app)
      .post(`/api/endorsements/${bProfile.body.profile._id}`)
      .set('Authorization', `Bearer ${aToken}`)
      .send({ skill: 'Docker' });

    expect(res.status).toBe(409);
  });

  it('lists endorsements grouped by skill', async () => {
    const { token: aToken } = await registerAndLogin();
    const { token: bToken } = await registerAndLogin();
    const bProfile = await request(app).get('/api/students/me').set('Authorization', `Bearer ${bToken}`);
    await request(app).put('/api/students/me').set('Authorization', `Bearer ${bToken}`).send({ skills: ['Python'] });

    await request(app)
      .post(`/api/endorsements/${bProfile.body.profile._id}`)
      .set('Authorization', `Bearer ${aToken}`)
      .send({ skill: 'Python' });

    const res = await request(app).get(`/api/endorsements/${bProfile.body.profile._id}`);

    expect(res.status).toBe(200);
    expect(res.body.grouped.Python.length).toBe(1);
  });
});
