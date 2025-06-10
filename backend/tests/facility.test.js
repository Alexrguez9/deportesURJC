const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Facility = require('../app/models/facility');

describe('🧪 Facilities', () => {
  let facility;

  beforeEach(async () => {
    await Facility.deleteMany();

    facility = await Facility.create({
      name: 'Gimnasio Central',
      isInternSport: true,
      description: 'Instalación equipada',
      schedule: {
        initialHour: new Date('2025-04-01T08:00:00Z'),
        endHour: new Date('2025-04-01T22:00:00Z')
      },
      capacity: 20,
      priceForHalfHour: 3.5
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('debería obtener todas las instalaciones', async () => {
    const res = await request(app).get('/facilities');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('debería crear una instalación nueva', async () => {
    const res = await request(app).post('/facilities').send({
      name: 'Pista Atletismo',
      isInternSport: false,
      description: 'Pista al aire libre',
      schedule: {
        initialHour: new Date('2025-04-01T08:00:00Z'),
        endHour: new Date('2025-04-01T22:00:00Z')
      },
      capacity: 15,
      priceForHalfHour: 4
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Pista Atletismo');
  });

  it('debería actualizar una instalación existente', async () => {
    const res = await request(app).put(`/facilities/${facility._id}`).send({
      name: 'Gimnasio Actualizado'
    });
    expect(res.statusCode).toBe(200);
  });

  it('debería fallar si intenta actualizar un ID inexistente', async () => {
    const res = await request(app).put('/facilities/000000000000000000000000').send({
      name: 'Instalación no válida'
    });
    expect(res.statusCode).toBe(404);
  });

  it('debería eliminar una instalación existente', async () => {
    const res = await request(app).delete(`/facilities/${facility._id}`);
    expect(res.statusCode).toBe(200);
  });

  it('debería fallar al eliminar un ID inexistente', async () => {
    const res = await request(app).delete('/facilities/000000000000000000000000');
    expect(res.statusCode).toBe(404);
  });
});
