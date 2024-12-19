import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFound from './NotFound';

jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { name: 'Juan', correo: 'juan@urjc.es' },
    }),
}));

jest.mock('../../components/header/Header', () => () => <div>Mocked Header</div>);
jest.mock('../../components/footer/Footer', () => () => <div>Mocked Footer</div>);

describe('NotFound Component', () => {
    test('renders correctly with the correct content', () => {
        render(<NotFound />);
        expect(screen.getByText(/404 - Page Not Found/i)).toBeInTheDocument();
        expect(screen.getByText(/The page you are looking for does not exist/i)).toBeInTheDocument();
    });

    test('renders Header and Footer components', () => {
        render(<NotFound />);
        expect(screen.getByText(/Mocked Header/i)).toBeInTheDocument();
        expect(screen.getByText(/Mocked Footer/i)).toBeInTheDocument();
    });
});
