import { isSubscriptionExpired } from '../utils/user';

describe('isSubscriptionExpired', () => {
  it('devuelve true si subscription es null o undefined', () => {
    expect(isSubscriptionExpired(null)).toBe(true);
    expect(isSubscriptionExpired(undefined)).toBe(true);
  });

  it('devuelve true si isActive es false o endDate no existe', () => {
    expect(isSubscriptionExpired({ isActive: false, endDate: '2025-04-01' })).toBe(true);
    expect(isSubscriptionExpired({ isActive: true })).toBe(true);
  });

  it('devuelve true si endDate ya pasó', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    expect(isSubscriptionExpired({ isActive: true, endDate: pastDate.toISOString() })).toBe(true);
  });

  it('devuelve false si la suscripción está activa y no ha expirado', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    expect(isSubscriptionExpired({ isActive: true, endDate: futureDate.toISOString() })).toBe(false);
  });
});
