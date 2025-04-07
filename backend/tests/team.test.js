const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Team = require('../app/models/team');

describe('🧪 Teams', () => {
  let team;

  beforeEach(async () => {
    await Team.deleteMany();
    team = await Team.create({ name: 'Equipo test', sport: 'futbol' });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('debería obtener todos los equipos', async () => {
    const res = await request(app).get('/teams');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('debería crear un nuevo equipo', async () => {
    const res = await request(app).post('/teams').send({
      name: 'Equipo Basket',
      sport: 'baloncesto'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Equipo Basket');
  });

  it('debería actualizar un equipo existente', async () => {
    const res = await request(app).put(`/teams/${team._id}`).send({
      name: 'Equipo Actualizado'
    });
    expect(res.statusCode).toBe(200);
  });

  it('debería devolver 404 si el equipo no existe al actualizar', async () => {
    const res = await request(app).put('/teams/000000000000000000000000').send({
      name: 'No existe'
    });
    expect(res.statusCode).toBe(404);
  });

  it('debería eliminar un equipo existente', async () => {
    const res = await request(app).delete(`/teams/${team._id}`);
    expect(res.statusCode).toBe(200);
  });

  it('debería devolver 404 si el equipo no existe al eliminar', async () => {
    const res = await request(app).delete('/teams/000000000000000000000000');
    expect(res.statusCode).toBe(404);
  });
});
