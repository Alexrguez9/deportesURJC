import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RecargaMonedero from './RecargaMonedero';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Mock de AuthContext
jest.mock('../../context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

describe('RecargaMonedero Component', () => {
    let mockUpdateUser;

    beforeEach(() => {
        mockUpdateUser = jest.fn();
        useAuth.mockReturnValue({
            user: {
                _id: '123',
                name: 'Juan Perez',
                email: 'juan.perez@urjc.es',
                saldo: 50,
            },
            updateUser: mockUpdateUser,
        });
    });

    test('renders recarga monedero content', () => {
        render(<RecargaMonedero />, { wrapper: MemoryRouter });

        expect(screen.getByRole('heading', { level: 1, name: /Recarga de monedero/i })).toBeInTheDocument();        expect(screen.getByText(/Introduce el importe a recargar/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/€/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Enviar/i })).toBeInTheDocument();
        expect(screen.getByText(/Nombre:/i)).toBeInTheDocument();
        expect(screen.getByText(/Correo:/i)).toBeInTheDocument();
        expect(screen.getByText(/Saldo actual:/i)).toBeInTheDocument();
    });

    test('handles valid recharge submission', async () => {
        render(<RecargaMonedero />, { wrapper: MemoryRouter });

        const input = screen.getByPlaceholderText(/€/i);
        const button = screen.getByRole('button', { name: /Enviar/i });

        fireEvent.change(input, { target: { value: '30' } });
        await act(async () => {
            fireEvent.click(button);
        });

        expect(mockUpdateUser).toHaveBeenCalledTimes(1);
        expect(mockUpdateUser).toHaveBeenCalledWith('123', {
            _id: '123',
            name: 'Juan Perez',
            email: 'juan.perez@urjc.es',
            saldo: 80, // Saldo actualizado
        });
    });

    test('shows alert on invalid recharge amount', () => {
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        render(<RecargaMonedero />, { wrapper: MemoryRouter });

        const input = screen.getByPlaceholderText(/€/i);
        const button = screen.getByRole('button', { name: /Enviar/i });

        fireEvent.change(input, { target: { value: '-10' } });
        fireEvent.click(button);

        expect(window.alert).toHaveBeenCalledWith('Por favor, introduce un importe válido.');
    });

    test('renders loading spinner during submission', async () => {
        mockUpdateUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
        render(<RecargaMonedero />, { wrapper: MemoryRouter });

        const input = screen.getByPlaceholderText(/€/i);
        const button = screen.getByRole('button', { name: /Enviar/i });

        fireEvent.change(input, { target: { value: '20' } });
        await act(async () => {
            fireEvent.click(button);
        });

        const spinner = document.querySelector('.spinner');
        console.log(spinner?.outerHTML);
        expect(spinner).not.toBeNull();
    });

    test('handles user absence', () => {
        useAuth.mockReturnValue({ user: null, updateUser: mockUpdateUser });
        render(<RecargaMonedero />, { wrapper: MemoryRouter });

        expect(screen.getByText(/No se ha podido cargar el usuario./i)).toBeInTheDocument();
    });
});
