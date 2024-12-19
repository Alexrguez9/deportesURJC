import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';

// Mock del contexto AuthContext
jest.mock('../../context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Header Component', () => {
    let mockLogout;

    beforeEach(() => {
        mockLogout = jest.fn();
    });

    test('renders navigation links and login button when user is not logged in', () => {
        useAuth.mockReturnValue({ user: null, logout: mockLogout });
        render(<Header />, { wrapper: MemoryRouter });

        expect(screen.getByText(/Inicio/i)).toBeInTheDocument();
        expect(screen.getByText(/Ligas Internas/i)).toBeInTheDocument();
        expect(screen.getByText(/Salas y gimnasio/i)).toBeInTheDocument();
        expect(screen.getByText(/Instalaciones/i)).toBeInTheDocument();
        expect(screen.getByText(/Recargar monedero/i)).toBeInTheDocument();

        // When user not loggen in, login button should be displayed
        const loginButton = screen.getByRole('button', { name: /Iniciar sesión/i });
        expect(loginButton).toBeInTheDocument();
    });

    test('renders user dropdown and logout button when user is logged in', () => {
        useAuth.mockReturnValue({
            user: { name: 'Juan Perez' },
            logout: mockLogout,
        });
        render(<Header />, { wrapper: MemoryRouter });

        const userButton = screen.getByRole('button', { name: /Juan Perez/i });
        expect(userButton).toBeInTheDocument();

        fireEvent.click(userButton);

        expect(screen.getByText(/Mi cuenta/i)).toBeInTheDocument();
        expect(screen.getByText(/Mis reservas/i)).toBeInTheDocument();
        expect(screen.getByText(/Configuración/i)).toBeInTheDocument();

        const logoutButton = screen.getByRole('button', { name: /Cerrar sesión/i });
        expect(logoutButton).toBeInTheDocument();
    });

    test('calls logout and navigates to home on logout', () => {
        useAuth.mockReturnValue({
            user: { name: 'Juan Perez' },
            logout: mockLogout,
        });
        render(<Header />, { wrapper: MemoryRouter });

        const userButton = screen.getByRole('button', { name: /Juan Perez/i });
        fireEvent.click(userButton);

        const logoutButton = screen.getByRole('button', { name: /Cerrar sesión/i });
        fireEvent.click(logoutButton);

        expect(mockLogout).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('renders logo with correct alt text and link', () => {
        useAuth.mockReturnValue({ user: null, logout: mockLogout });
        render(<Header />, { wrapper: MemoryRouter });

        const logo = screen.getByAltText(/Logo URJC Deportes/i);
        expect(logo).toBeInTheDocument();
        expect(logo.closest('a')).toHaveAttribute('href', '/');
    });
});
