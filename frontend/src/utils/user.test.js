import { isSubscriptionExpired } from '../utils/user';

describe('isSubscriptionExpired', () => {
  it('devuelve true si subscription es null o undefined', () => {
    expect(isSubscriptionExpired(null)).toBe(true);
    expect(isSubscriptionExpired(undefined)).toBe(true);
  });

  it('devuelve true si estado es false o fechaFin no existe', () => {
    expect(isSubscriptionExpired({ estado: false, fechaFin: '2025-04-01' })).toBe(true);
    expect(isSubscriptionExpired({ estado: true })).toBe(true);
  });

  it('devuelve true si la fechaFin ya pasó', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    expect(isSubscriptionExpired({ estado: true, fechaFin: pastDate.toISOString() })).toBe(true);
  });

  it('devuelve false si la suscripción está activa y no ha expirado', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    expect(isSubscriptionExpired({ estado: true, fechaFin: futureDate.toISOString() })).toBe(false);
  });
});
