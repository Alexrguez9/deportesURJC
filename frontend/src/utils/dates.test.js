import {
    getHoursAndMinutes,
    getDateWithoutTime,
    getPrettyDate,
    getMonthlyDateRange,
    validateHours
} from './dates';

// Dates in getHoursAndMinutes are in UTC, so we need to adjust them to Spain time in tests
describe('getHoursAndMinutes', () => {
    it('should return hours and minutes in HH:MM format with leading zeros', () => {
        const date = '2024-07-28T10:30:00';
        expect(getHoursAndMinutes(date)).toBe('08:30');
    });

    it('should correctly return hours and minutes for different times with leading zeros', () => {
        expect(getHoursAndMinutes('2024-07-28T09:15:00')).toBe('07:15');
        expect(getHoursAndMinutes('2024-07-28T23:59:00')).toBe('21:59');
        expect(getHoursAndMinutes('2024-07-28T00:00:00')).toBe('22:00');
        expect(getHoursAndMinutes('2024-07-28T05:08:00')).toBe('03:08');
    });

    it('should work with different date formats supported by new Date()', () => {
        expect(getHoursAndMinutes('July 28, 2024 14:45:00')).toBe('12:45');
        expect(getHoursAndMinutes('2024/07/28 16:20:00')).toBe('14:20');
    });

    it('should correctly handle single-digit hours by adding a leading zero', () => {
        expect(getHoursAndMinutes('2024-07-28T01:05:00')).toBe('23:05');
    });

    it('should return undefined if date is null or undefined', () => {
        expect(getHoursAndMinutes(null)).toBeUndefined();
        expect(getHoursAndMinutes(undefined)).toBeUndefined();
    });
});

describe('getDateWithoutTime', () => {
    it('should return the date in YYYY-MM-DD format', () => {
        const date = '2024-07-28T10:30:00';
        expect(getDateWithoutTime(date)).toBe('2024-07-28');
    });

    it('should work with different date formats supported by new Date()', () => {
        expect(getDateWithoutTime('August 15, 2024 18:00:00')).toBe('2024-08-15');
        expect(getDateWithoutTime('2024/09/02 09:00:00')).toBe('2024-09-02');
    });

    it('should return the correct date for different months and days', () => {
        expect(getDateWithoutTime('2024-01-01T12:00:00')).toBe('2024-01-01'); // Start of year
        expect(getDateWithoutTime('2024-12-31T12:00:00')).toBe('2024-12-31'); // End of year
        expect(getDateWithoutTime('2024-02-29T12:00:00')).toBe('2024-02-29'); // Leap year
    });
});

describe('getPrettyDate', () => {
    it('should return a human-readable date in Spanish with date and time', () => {
        const date = new Date('2024-07-28T10:30:00');
        const expectedPrettyDate = new Date('2024-07-28T10:30:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(date)).toBe(expectedPrettyDate);
    });

    it('should work with different Date objects', () => {
        const date1 = new Date('2024-08-15T18:45:30');
        const expected1 = date1.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(date1)).toBe(expected1);

        const date2 = new Date('2025-01-02T09:10:05');
        const expected2 = date2.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(date2)).toBe(expected2);
    });

    it('should return the correct date and time for different months, days, and hours', () => {
        const dateStartOfYear = new Date('2024-01-01T00:00:00');
        const expectedStartOfYear = dateStartOfYear.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(dateStartOfYear)).toBe(expectedStartOfYear);

        const dateEndOfYear = new Date('2024-12-31T23:59:59');
        const expectedEndOfYear = dateEndOfYear.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(dateEndOfYear)).toBe(expectedEndOfYear);

        const dateLeapYear = new Date('2024-02-29T12:30:00');
        const expectedLeapYear = dateLeapYear.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(dateLeapYear)).toBe(expectedLeapYear);
    });

    it('should correctly handle single-digit minutes and hours', () => {
        const dateSingleDigitTime = new Date('2024-07-28T05:08:00');
        const expectedSingleDigitTime = dateSingleDigitTime.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(dateSingleDigitTime)).toBe(expectedSingleDigitTime);
    });

    it('should work with different input date formats (string)', () => {
        const dateStringISO = '2024-10-20T15:22:10';
        const expectedStringISO = new Date(dateStringISO).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(dateStringISO)).toBe(expectedStringISO);

        const dateStringUS = 'October 20, 2024 08:30:00';
        const expectedStringUS = new Date(dateStringUS).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(dateStringUS)).toBe(expectedStringUS);
    });
});

describe('getMonthlyDateRange', () => {
    it('should return a date range for the user, with the end date being one month after the start date', () => {
        const mockUser = {};
        const {startDate, endDate} = getMonthlyDateRange(mockUser);

        expect(startDate).toBeDefined();
        expect(endDate).toBeDefined();
        expect(typeof startDate).toBe('string');
        expect(typeof endDate).toBe('string');

        const start = new Date(startDate);
        const end = new Date(endDate);

        const expectedEndDate = new Date(start);
        expectedEndDate.setMonth(expectedEndDate.getMonth() + 1);
        expect(end.toISOString()).toBe(expectedEndDate.toISOString());
    });

    it('should return [null, null] if the user is not defined', () => {
        expect(getMonthlyDateRange(null)).toEqual([null, null]);
        expect(getMonthlyDateRange(undefined)).toEqual([null, null]);
    });
});

describe('validateHours', () => {
    const minTime = new Date('2024-07-28T08:30:00');
    const maxTime = new Date('2024-07-28T18:00:00');

    it('should return true for a time within the range', () => {
        const date = new Date('2024-07-28T10:00:00');
        expect(validateHours(date, minTime, maxTime)).toBe(true);
    });

    it('should return false if the time is before the minimum', () => {
        const date = new Date('2024-07-28T07:00:00');
        expect(validateHours(date, minTime, maxTime)).toBe(false);
    });

    it('should return false if the time is after the maximum', () => {
        const date = new Date('2024-07-28T19:00:00');
        expect(validateHours(date, minTime, maxTime)).toBe(false);
    });

    it('should return false if the time is equal to the minimum but minutes are less', () => {
        const date = new Date('2024-07-28T08:15:00');
        expect(validateHours(date, minTime, maxTime)).toBe(false);
    });

    it('should return false if the time is equal to the maximum but minutes are more', () => {
        const date = new Date('2024-07-28T18:30:00');
        expect(validateHours(date, minTime, maxTime)).toBe(false);
    });

    it('should return true if the time is exactly the minimum', () => {
        const date = new Date('2024-07-28T08:30:00');
        expect(validateHours(date, minTime, maxTime)).toBe(true);
    });

    it('should return true if the time is exactly the maximum', () => {
        const date = new Date('2024-07-28T18:00:00');
        expect(validateHours(date, minTime, maxTime)).toBe(true);
    });

    it('should return true if minutes are just within the upper limit', () => {
        const date = new Date('2024-07-28T17:59:00');
        expect(validateHours(date, minTime, maxTime)).toBe(true);
    });

    it('should return true if minutes are just within the lower limit', () => {
        const date = new Date('2024-07-28T08:30:00');
        expect(validateHours(date, minTime, maxTime)).toBe(true);
    });
});
