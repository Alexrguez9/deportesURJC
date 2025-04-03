import {
    getMinTime,
    getMaxTime,
    generateTimeSlots,
    checkSubscriptionForFacility
  } from '../facilities';
  
  describe('utils/facilities', () => {
    describe('getMinTime', () => {
      it('returns a valid date with correct UTC time', () => {
        const facility = { schedule: { initialHour: '2023-08-03T09:00:00Z' } };
        const result = getMinTime(facility);
        expect(result).toBeInstanceOf(Date);
        expect(result.getUTCHours()).toBe(7); // UTC hour should be 7
      });
  
      it('returns current date if no schedule', () => {
        expect(getMinTime(null)).toBeInstanceOf(Date);
        expect(getMinTime({})).toBeInstanceOf(Date);
      });
    });
  
    describe('getMaxTime', () => {
      it('adjusts end time correctly if minute is 0', () => {
        const facility = { schedule: { endHour: '2023-08-03T18:00:00Z' } };
        const result = getMaxTime(facility);
        expect(result.getUTCHours()).toBe(15); // UTC hour should be 15
        expect(result.getUTCMinutes()).toBe(30);
      });
  
      it('adjusts end time correctly if minute is 30', () => {
        const facility = { schedule: { endHour: '2023-08-03T18:30:00Z' } };
        const result = getMaxTime(facility);
        expect(result.getUTCHours()).toBe(16); // UTC hour should be 16
        expect(result.getUTCMinutes()).toBe(0);
      });
  
      it('returns current date if no schedule', () => {
        expect(getMaxTime(null)).toBeInstanceOf(Date);
        expect(getMaxTime({})).toBeInstanceOf(Date);
      });
    });
  
    describe('checkSubscriptionForFacility', () => {
      it('returns false if user lacks gym subscription', () => {
        const result = checkSubscriptionForFacility('Gimnasio', { subscription: { gym: { isActive: false } } });
        expect(result.ok).toBe(false);
        expect(result.message).toMatch(/No tienes una suscripción activa en Gimnasio/);
      });
  
      it('returns false if user lacks athletics subscription', () => {
        const result = checkSubscriptionForFacility('Atletismo', { subscription: { athletics: { isActive: false } } });
        expect(result.ok).toBe(false);
        expect(result.message).toMatch(/No tienes una suscripción activa en Atletismo/);
      });
  
      it('returns true if user has active subscription', () => {
        const result = checkSubscriptionForFacility('Otro', {});
        expect(result.ok).toBe(true);
      });
    });
  
    describe('generateTimeSlots', () => {
      it('returns expected slots array', async () => {
        const mockFacility = {
          _id: '1',
          capacity: 2,
          schedule: {
            initialHour: '2023-08-03T09:00:00Z',
            endHour: '2023-08-03T10:00:00Z',
          },
        };
  
        const day = new Date('2023-08-04T00:00:00Z');
        const mockCounter = jest.fn().mockResolvedValue(1);
  
        const slots = await generateTimeSlots(mockFacility, day, mockCounter);
        expect(slots.length).toBeGreaterThan(0);
        expect(slots[0]).toHaveProperty('available');
        expect(slots[0].remaining).toBe(1);
      });
  
      it('returns empty array if schedule is invalid', async () => {
        const slots = await generateTimeSlots({}, new Date(), jest.fn());
        expect(slots).toEqual([]);
      });
    });
  });
  