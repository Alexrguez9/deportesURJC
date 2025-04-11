const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Facility = require('../app/models/facility');
const User = require('../app/models/User');
const Reservation = require('../app/models/reservation');

describe('🧪 Reservas', () => {
  let user, facility;

  beforeAll(async () => {
    await User.deleteMany();
    await Facility.deleteMany();
    await Reservation.deleteMany();

    user = await User.create({
      name: 'Usuario Test',
      email: 'usuario@test.com',
      password: '123456'
    });

    facility = await Facility.create({
      name: 'Pista Central',
      isInternSport: true,
      description: 'Pista para deportes varios',
      schedule: {
        initialHour: new Date('2025-01-01T08:00:00Z'),
        endHour: new Date('2025-01-01T22:00:00Z')
      },
      capacity: 10,
      priceForHalfHour: 5
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('debería crear una reserva válida y calcular el precio', async () => {
    const res = await request(app).post('/reservations').send({
      userId: user._id.toString(),
      facilityId: facility._id.toString(),
      initDate: '2025-05-01T10:00:00.000Z',
      endDate: '2025-05-01T11:00:00.000Z',
      isPaid: false
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.totalPrice).toBe(10);
  });

  it('debería fallar si faltan campos requeridos', async () => {
    const res = await request(app).post('/reservations').send({});
    expect(res.statusCode).toBe(400);
  });
});
