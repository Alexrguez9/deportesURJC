import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Clasificaciones from './Clasificaciones';
import { useTeamsAndResults } from '../../../context/TeamsAndResultsContext';

jest.mock('../../../context/TeamsAndResultsContext', () => ({
  useTeamsAndResults: jest.fn(),
}));

jest.mock('../../../components/backButton/BackButton', () => () => <button>Volver</button>);

describe('Clasificaciones Component', () => {
  beforeEach(() => {
    useTeamsAndResults.mockReturnValue({
      teams: [
        { _id: '1', name: 'Equipo A', sport: 'Fútbol-7', results: { partidos_ganados: 3, partidos_empatados: 1, partidos_perdidos: 1 }, points: 10 },
        { _id: '2', name: 'Equipo B', sport: 'Baloncesto', results: { partidos_ganados: 2, partidos_empatados: 2, partidos_perdidos: 1 }, points: 8 },
        { _id: '3', name: 'Equipo C', sport: 'Fútbol-7', results: { partidos_ganados: 1, partidos_empatados: 1, partidos_perdidos: 3 }, points: 4 },
      ],
      fetchTeams: jest.fn(),
    });
  });

  it('renders correctly', () => {
    render(<Clasificaciones />);
    expect(screen.getByText('Clasificaciones Ligas Internas')).toBeInTheDocument();
    expect(screen.getByText('Consulta las clasificaciones de las ligas internas de la URJC')).toBeInTheDocument();
  });

  it('calls fetchTeams on mount', () => {
    const { fetchTeams } = useTeamsAndResults();
    render(<Clasificaciones />);
    expect(fetchTeams).toHaveBeenCalled();
  });

  it('displays teams sorted by points', () => {
    render(<Clasificaciones />);
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Equipo A'); // 10 puntos
    expect(rows[2]).toHaveTextContent('Equipo B'); // 8 puntos
    expect(rows[3]).toHaveTextContent('Equipo C'); // 4 puntos
  });

  it('filters teams based on selected sport', () => {
    render(<Clasificaciones />);
    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 'Fútbol-7' } });
    
    expect(screen.getByText('Equipo A')).toBeInTheDocument();
    expect(screen.getByText('Equipo C')).toBeInTheDocument();
    expect(screen.queryByText('Equipo B')).not.toBeInTheDocument();
  });
});
