// functions.test.js

import { getHours, getDateWithoutTime, getPrettyDate } from './dates';

describe('getHours', () => {
    it('debería retornar las horas y minutos en formato HH:MM', () => {
        const date = '2024-07-28T10:30:00';
        expect(getHours(date)).toBe('10:30');
    });

    it('debería retornar las horas y minutos correctamente para diferentes horas', () => {
        expect(getHours('2024-07-28T09:15:00')).toBe('9:15');
        expect(getHours('2024-07-28T23:59:00')).toBe('23:59');
        expect(getHours('2024-07-28T00:00:00')).toBe('0:0');
        expect(getHours('2024-07-28T05:08:00')).toBe('5:8'); // Prueba con minutos de un solo dígito
    });

    it('debería funcionar con diferentes formatos de fecha que new Date() soporta', () => {
        expect(getHours('July 28, 2024 14:45:00')).toBe('14:45');
        expect(getHours('2024/07/28 16:20:00')).toBe('16:20');
    });

    it('debería manejar correctamente las horas con un solo dígito', () => {
        expect(getHours('2024-07-28T01:05:00')).toBe('1:5'); // Originalmente podría fallar si no se formatea correctamente
    });
});

describe('getDateWithoutTime', () => {
    it('debería retornar la fecha en formato YYYY-MM-DD', () => {
        const date = '2024-07-28T10:30:00';
        expect(getDateWithoutTime(date)).toBe('2024-07-28');
    });

    it('debería funcionar con diferentes formatos de fecha que new Date() soporta', () => {
        expect(getDateWithoutTime('August 15, 2024 18:00:00')).toBe('2024-08-15');
        expect(getDateWithoutTime('2024/09/02 09:00:00')).toBe('2024-09-02');
    });

    it('debería retornar la fecha correctamente para diferentes meses y días', () => {
        expect(getDateWithoutTime('2024-01-01T12:00:00')).toBe('2024-01-01'); // Inicio de año
        expect(getDateWithoutTime('2024-12-31T12:00:00')).toBe('2024-12-31'); // Fin de año
        expect(getDateWithoutTime('2024-02-29T12:00:00')).toBe('2024-02-29'); // Año bisiesto
    });
});

describe('getPrettyDate', () => {
    it('debería retornar la fecha en formato legible en español con fecha y hora', () => {
        const date = new Date('2024-07-28T10:30:00');
        const expectedPrettyDate = new Date('2024-07-28T10:30:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(date)).toBe(expectedPrettyDate);
    });

    it('debería funcionar con diferentes objetos Date', () => {
        const date1 = new Date('2024-08-15T18:45:30');
        const expected1 = date1.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(date1)).toBe(expected1);

        const date2 = new Date('2025-01-02T09:10:05');
        const expected2 = date2.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(date2)).toBe(expected2);
    });

    it('debería retornar la fecha y hora correctamente para diferentes meses, días y horas', () => {
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

    it('debería manejar correctamente minutos y horas de un solo dígito', () => {
        const dateSingleDigitTime = new Date('2024-07-28T05:08:00');
        const expectedSingleDigitTime = dateSingleDigitTime.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(dateSingleDigitTime)).toBe(expectedSingleDigitTime);
    });

    it('debería funcionar con diferentes formatos de entrada de fecha (string)', () => {
        const dateStringISO = '2024-10-20T15:22:10';
        const expectedStringISO = new Date(dateStringISO).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(dateStringISO)).toBe(expectedStringISO);

        const dateStringUS = 'October 20, 2024 08:30:00'; // Formato US
        const expectedStringUS = new Date(dateStringUS).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        expect(getPrettyDate(dateStringUS)).toBe(expectedStringUS);
    });
});