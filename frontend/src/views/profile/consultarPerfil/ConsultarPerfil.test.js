import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ConsultarPerfil from './ConsultarPerfil';
import { useInstalacionesReservas } from '../../../context/InstalacionesReservasContext';
import { MemoryRouter } from 'react-router-dom';

// Mock de AuthContext
jest.mock('../../../context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// Mock de InstalacionesReservasContext
jest.mock('../../../context/InstalacionesReservasContext', () => ({
    useInstalacionesReservas: jest.fn(),
}));

describe('ConsultarPerfil Component', () => {
    beforeAll(() => {
        const { useAuth } = require('../../../context/AuthContext');
        useAuth.mockReturnValue({ 
            user: { _id: '123456', name: 'Pepe', email: 'pepe@urjc.es' },
            logout: jest.fn(),
            deleteUser: jest.fn(),
        });
        const { useInstalacionesReservas } = require('../../../context/InstalacionesReservasContext');
        useInstalacionesReservas.mockReturnValue({
            reservas: [{ _id: '456', userId: '123' }],
            deleteReserva: jest.fn(),
        });
    });
    
    test('renders profile information correctly', () => {
        render(<ConsultarPerfil />, { wrapper: MemoryRouter });
        expect(screen.getByText(/Nombre: Pepe/i)).toBeInTheDocument();
        expect(screen.getByText(/Email: pepe@urjc.es/i)).toBeInTheDocument();
    });

    test('renders buttons to logout and delete account', () => {
        render(<ConsultarPerfil />, { wrapper: MemoryRouter });
        expect(screen.getByText(/¿quieres cerrar sesión?/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cerrar sesión/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Eliminar cuenta/i })).toBeInTheDocument();
    });

    test('handles logout button click', async () => {
        const mockLogout = jest.fn();
        const { useAuth } = require('../../../context/AuthContext');
        useAuth.mockReturnValue({ 
            user: { _id: '123', name: 'Juan', email: 'juan@urjc.es' },
            logout: mockLogout,
            deleteUser: jest.fn(),
        });
        render(<ConsultarPerfil />, { wrapper: MemoryRouter });

        fireEvent.click(screen.getByRole('button', { name: /Cerrar sesión/i }));

        await act(async () => {
            expect(mockLogout).toHaveBeenCalledTimes(1);
        });
    });

    test('opens and closes delete confirmation popup', () => {
        render(<ConsultarPerfil />, { wrapper: MemoryRouter });
        expect(screen.queryByText(/Confirmar eliminación de cuenta/i)).toBeNull();

        fireEvent.click(screen.getByText(/Eliminar cuenta/i));
        expect(screen.getByText(/Confirmar eliminación de cuenta/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText(/Cancelar/i));
        expect(screen.queryByText(/Confirmar eliminación de cuenta/i)).toBeNull();
    });

    jest.mock('../../../context/InstalacionesReservasContext', () => ({
        useInstalacionesReservas: jest.fn(),
    }));
    
    test('handles delete account button click', async () => {
        const mockDeleteUser = jest.fn();
        const mockDeleteReserva = jest.fn();
        const mockReservas = [
            { _id: '456', userId: '123', name: 'Reserva 1' },
            { _id: '789', userId: '123', name: 'Reserva 2' },
        ];

        const { useAuth } = require('../../../context/AuthContext');
        useAuth.mockReturnValue({
            user: { _id: '123', name: 'Test User', email: 'test@user.com' },
            logout: jest.fn(),
            deleteUser: mockDeleteUser,
        });
        useInstalacionesReservas.mockReturnValue({
            reservas: mockReservas,
            deleteReserva: mockDeleteReserva,
        });
    
        render(<ConsultarPerfil />, { wrapper: MemoryRouter });
    
        fireEvent.click(screen.getByRole('button', { name: /Eliminar cuenta/i }));
        expect(screen.getByText(/Confirmar eliminación de cuenta/i)).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /Eliminar definitivamente/i }));
        });

        expect(mockDeleteReserva).toHaveBeenCalledTimes(2);
        expect(mockDeleteReserva).toHaveBeenCalledWith('456');
        expect(mockDeleteReserva).toHaveBeenCalledWith('789');

        expect(mockDeleteUser).toHaveBeenCalledTimes(1);
        expect(mockDeleteUser).toHaveBeenCalledWith('123');
    });
});
