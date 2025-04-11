const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Team = require('../app/models/team');
const Result = require('../app/models/result');

describe('🧪 Resultados', () => {
  let localTeam, visitorTeam, resultId;

  beforeAll(async () => {
    await Team.deleteMany();
    await Result.deleteMany();

    localTeam = await Team.create({ name: 'Local', sport: 'futbol' });
    visitorTeam = await Team.create({ name: 'Visitante', sport: 'futbol' });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('debería insertar un resultado válido', async () => {
    const res = await request(app).post('/results').send({
      sport: 'futbol',
      round: 1,
      date: '2025-01-01',
      hour: '17:00',
      place: 'Campo 1',
      localTeamId: localTeam._id.toString(),
      visitorTeamId: visitorTeam._id.toString(),
      localTeam: localTeam.name,
      visitorTeam: visitorTeam.name,
      localGoals: 2,
      visitorGoals: 1,
      result: '2-1'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    resultId = res.body._id;
  });

  it('debería obtener un resultado por ID', async () => {
    if (!resultId) return;
    const res = await request(app).get(`/results/${resultId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe('2-1');
  });

  it('debería actualizar un resultado', async () => {
    if (!resultId) return;
    const res = await request(app).put(`/results/${resultId}`).send({
      localGoals: 3,
      visitorGoals: 0,
      result: '3-0'
    });
    expect(res.statusCode).toBe(200);
  });

  it('debería eliminar un resultado', async () => {
    if (!resultId) return;
    const res = await request(app).delete(`/results/${resultId}`);
    expect(res.statusCode).toBe(200);
  });

  it('debería rechazar si los equipos no existen', async () => {
    const res = await request(app).post('/results').send({
      sport: 'futbol',
      round: 1,
      date: '2025-01-01',
      hour: '17:00',
      place: 'Campo 2',
      localTeamId: new mongoose.Types.ObjectId().toString(),
      visitorTeamId: new mongoose.Types.ObjectId().toString(),
      localTeam: 'FakeLocal',
      visitorTeam: 'FakeVisitor',
      localGoals: 1,
      visitorGoals: 1,
      result: '1-1'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Uno o ambos equipos no existen');
  });
});
