import { render, screen, fireEvent } from '@testing-library/react';
import Rankings from './Rankings';
import { useTeamsAndResults } from '../../../context/TeamsAndResultsContext';

jest.mock('../../../context/TeamsAndResultsContext', () => ({
  useTeamsAndResults: jest.fn(),
}));

jest.mock('../../../components/backButton/BackButton', () => {
  const MockBackButton = () => <button>Volver</button>;
  MockBackButton.displayName = 'MockBackButton';
  return MockBackButton;
});

describe('Rankings Component', () => {
  beforeEach(() => {
    useTeamsAndResults.mockReturnValue({
      teams: [
        { _id: '1', name: 'Equipo A', sport: 'Fútbol-7', results: { wins: 3, draws: 1, losses: 1 }, points: 10 },
        { _id: '2', name: 'Equipo B', sport: 'Baloncesto', results: { wins: 2, draws: 2, losses: 1 }, points: 8 },
        { _id: '3', name: 'Equipo C', sport: 'Fútbol-7', results: { wins: 1, draws: 1, losses: 3 }, points: 4 },
      ],
      fetchTeams: jest.fn(),
    });
  });

  it('renders correctly', () => {
    render(<Rankings />);
    expect(screen.getByText('Clasificaciones Ligas Internas')).toBeInTheDocument();
    expect(screen.getByText('Consulta las clasificaciones de las ligas internas de la URJC')).toBeInTheDocument();
  });

  it('calls fetchTeams on mount', () => {
    const { fetchTeams } = useTeamsAndResults();
    render(<Rankings />);
    expect(fetchTeams).toHaveBeenCalled();
  });

  it('displays teams sorted by points', () => {
    render(<Rankings />);
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Equipo A'); // 10 points
    expect(rows[2]).toHaveTextContent('Equipo B'); // 8 points
    expect(rows[3]).toHaveTextContent('Equipo C'); // 4 points
  });

  it('filters teams based on selected sport', () => {
    render(<Rankings />);
    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 'Fútbol-7' } });
    
    expect(screen.getByText('Equipo A')).toBeInTheDocument();
    expect(screen.getByText('Equipo C')).toBeInTheDocument();
    expect(screen.queryByText('Equipo B')).not.toBeInTheDocument();
  });

  it('displays message when no teams are available for selected sport', () => {
    render(<Rankings />);
    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 'Voleibol' } });
    
    expect(screen.getByText('No hay encuentros de Voleibol para mostrar')).toBeInTheDocument();
  });
});
