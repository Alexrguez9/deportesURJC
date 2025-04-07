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

  it('debería registrar un usuario nuevo', async () => {
    const res = await request(app).post('/users/register').send(userData);
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe(userData.email);
  });

  it('debería fallar al registrar un email ya existente', async () => {
    await request(app).post('/users/register').send(userData);
    const res = await request(app).post('/users/register').send(userData);
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/ya está registrado/);
  });

  it('debería loguear correctamente con el usuario', async () => {
    await request(app).post('/users/register').send(userData);
    const res = await request(app).post('/users/login').send({
      email: userData.email,
      password: userData.password
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(userData.email);
  });

  it('debería obtener un usuario por ID', async () => {
    const reg = await request(app).post('/users/register').send(userData);
    const res = await request(app).get(`/users/${reg.body._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(userData.email);
  });

  it('debería actualizar nombre y contraseña', async () => {
    const reg = await request(app).post('/users/register').send(userData);
    const res = await request(app).put(`/users/${reg.body._id}/profile`).send({
      currentPassword: userData.password,
      newPassword: 'nueva123',
      name: 'Nuevo Nombre'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe('Nuevo Nombre');
  });

  it('debería eliminar un usuario', async () => {
    const reg = await request(app).post('/users/register').send({
      ...userData,
      email: 'delete@test.com'
    });
    const res = await request(app).delete(`/users/${reg.body._id}`);
    expect(res.statusCode).toBe(200);
  });
});
