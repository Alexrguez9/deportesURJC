import React from 'react';
import { render, screen } from '@testing-library/react';
import Encuentros from './Encuentros.jsx';

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    isAdmin: true,
  }),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), 
  useNavigate: jest.fn(),
}));

describe('Encuentros component', () => {
  it('renders correctly', () => {
    render(<Encuentros />);
    const heading = screen.getByText('Encuentros');
    expect(heading).toBeInTheDocument();
  });
});
