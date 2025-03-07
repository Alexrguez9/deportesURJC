// functions.test.js

import { getHours, getDateWithoutTime } from './results';

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