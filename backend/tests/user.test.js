const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../app/models/User');

describe('🧪 Auth tests', () => {
  beforeEach(async () => {
    await User.deleteMany();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  const userData = {
    name: 'Alex',
    email: 'alex@test.com',
    password: '123456',
    registration: {
      gym: { isActive: true },
      athletics: { isActive: false }
    }
  };

  it('should register a new user', async () => {
    const res = await request(app).post('/users/register').send(userData);
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe(userData.email);
  });

  it('should fail to register an existing user', async () => {
    await request(app).post('/users/register').send(userData);
    const res = await request(app).post('/users/register').send(userData);
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/ya está registrado/);
  });

  it('should login a user', async () => {
    await request(app).post('/users/register').send(userData);
  
    const agent = request.agent(app); // Mantain session between requests
  
    const loginRes = await agent.post('/users/login').send({
      email: userData.email,
      password: userData.password
    });
  
    expect(loginRes.statusCode).toBe(200);
  
    const sessionRes = await agent.get('/users/session');
    expect(sessionRes.statusCode).toBe(200);
    expect(sessionRes.body.email).toBe(userData.email);
  });

  it('should obtain an user by ID', async () => {
    const reg = await request(app).post('/users/register').send(userData);
    const res = await request(app).get(`/users/${reg.body._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(userData.email);
  });

  it('should update correctly users name and password', async () => {
    const reg = await request(app).post('/users/register').send(userData);
    const res = await request(app).put(`/users/${reg.body._id}/profile`).send({
      currentPassword: userData.password,
      newPassword: 'nueva123',
      name: 'Nuevo Nombre'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe('Nuevo Nombre');
  });

  it('should delete correctly a user', async () => {
    const reg = await request(app).post('/users/register').send({
      ...userData,
      email: 'delete@test.com'
    });
    const res = await request(app).delete(`/users/${reg.body._id}`);
    expect(res.statusCode).toBe(200);
  });
});
