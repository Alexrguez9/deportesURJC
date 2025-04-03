import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

const mockTeamsAndResultsContext = {
  teams: [
    { _id: '1', name: 'Equipo C', sport: 'Fútbol-7', results: { wins: 1, draws: 1, losses: 3 }, points: 4 },
    { _id: '3', name: 'Equipo B', sport: 'Baloncesto', results: { wins: 2, draws: 2, losses: 1 }, points: 8 },
    { _id: '2', name: 'Equipo A', sport: 'Fútbol-7', results: { wins: 3, draws: 1, losses: 1 }, points: 10 },
  ],
  fetchTeams: jest.fn(),
};

describe('Rankings Component', () => {
  beforeEach(() => {
    useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
    jest.clearAllMocks();
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

  it('shows sport selector with default "Elige un deporte"', () => {
    render(<Rankings />);
    const dropdown = screen.getByRole('combobox');
    expect(dropdown.value).toBe('');
    expect(screen.getByRole('option', { name: 'Elige un deporte' })).toBeInTheDocument();
  });

  it('displays teams sorted by points for Fútbol-7 in correct order', async () => {
    render(<Rankings />);
  
    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 'Fútbol-7' } });
  
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      const dataRows = rows.slice(1); // omit header row
      expect(dataRows).toHaveLength(2); // Should show 2 teams for Fútbol-7
  
      expect(dataRows[0]).toHaveTextContent('Equipo A'); // 10 puntos
      expect(dataRows[1]).toHaveTextContent('Equipo C'); // 4 puntos
    });
  });
  

  it('filters teams based on selected sport', async () => {
    render(<Rankings />);
    
    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 'Fútbol-7' } });
  
    await waitFor(() => {
      expect(screen.getByText('Equipo A')).toBeInTheDocument();
      expect(screen.getByText('Equipo C')).toBeInTheDocument();
    });
  });
  

  it('displays message when no teams are available for selected sport', async () => {
    render(<Rankings />);
    
    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 'Voleibol' } });
  
    await waitFor(() => {
      expect(screen.getByText('No hay encuentros de Voleibol para mostrar')).toBeInTheDocument();
    });
  });
  
});
