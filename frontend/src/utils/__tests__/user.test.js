import { isSubscriptionExpired } from '../user';

describe('isSubscriptionExpired', () => {
  it('returns true if subscription is null or undefined', () => {
    expect(isSubscriptionExpired(null)).toBe(true);
    expect(isSubscriptionExpired(undefined)).toBe(true);
  });

  it('returns true if isActive is false or endDate does not exist.', () => {
    expect(isSubscriptionExpired({ isActive: false, endDate: '2025-04-01' })).toBe(true);
    expect(isSubscriptionExpired({ isActive: true })).toBe(true);
  });

  it('returns true if endDate has already passed', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    expect(isSubscriptionExpired({ isActive: true, endDate: pastDate.toISOString() })).toBe(true);
  });

  it('returns false if the subscription is active and has not expired.', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    expect(isSubscriptionExpired({ isActive: true, endDate: futureDate.toISOString() })).toBe(false);
  });
});
