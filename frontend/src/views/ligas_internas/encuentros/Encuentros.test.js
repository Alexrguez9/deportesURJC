import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Encuentros from './Encuentros.jsx';
import { useTeamsAndResults } from '../../../context/TeamsAndResultsContext';

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {},
    isAdmin: jest.fn(() => true),
  }),
}));

jest.mock('../../../context/TeamsAndResultsContext', () => ({
  useTeamsAndResults: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Encuentros component', () => {
  beforeEach(() => {
    useTeamsAndResults.mockReturnValue({
      results: [],
      fetchResults: jest.fn(),
    });
  });

  it('renders correctly', () => {
    render(<Encuentros />);
    const heading = screen.getByText('Encuentros');
    expect(heading).toBeInTheDocument();
  });
  
  it('displays the default message when there are no results', () => {
    render(<Encuentros />);
    expect(screen.getByText(/No hay resultados de Todos para mostrar/i)).toBeInTheDocument();
  });

  it('renders the filter dropdown', () => {
    render(<Encuentros />);
    const selectElement = screen.getByRole('combobox'); 
    expect(selectElement).toBeInTheDocument();
  });

  it('filters results based on selected sport', () => {
    const mockResults = [
      { _id: '1', sport: 'Fútbol-7', jornada: 1, equipo_local: 'Equipo A', goles_local: 2, goles_visitante: 1, equipo_visitante: 'Equipo B', fecha: '2025-02-11', hora: '18:00', lugar: 'Cancha 1' },
      { _id: '2', sport: 'Voleibol', jornada: 2, equipo_local: 'Equipo C', goles_local: 3, goles_visitante: 2, equipo_visitante: 'Equipo D', fecha: '2025-02-12', hora: '19:00', lugar: 'Cancha 2' },
    ];

    useTeamsAndResults.mockReturnValue({ results: mockResults, fetchResults: jest.fn() });

    render(<Encuentros />);
    
    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 'Fútbol-7' } });

    expect(screen.getByText('Equipo A')).toBeInTheDocument();
    expect(screen.queryByText('Equipo C')).not.toBeInTheDocument();
  });
});
