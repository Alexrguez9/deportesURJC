import React from 'react';
import { mount } from 'enzyme';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Encuentros from './Encuentros.jsx';
import { GoPencil } from 'react-icons/go';

jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const responseApi = [{
  _id: '1',
  deporte: 'Fútbol-7',
  jornada: '1',
  equipo_local: 'Equipo A',
  goles_local: 2,
  goles_visitante: 1,
  equipo_visitante: 'Equipo B',
  fecha: '2024-11-20',
  hora: '18:00',
  lugar: 'Campo 1',
}]

describe('Encuentros component', () => {
  describe('when user is admin', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() => {
        return Promise.resolve({
          json: () => Promise.resolve(responseApi),
          status: 200,
        });
      });
      const { useAuth } = require('../../../context/AuthContext');
      useAuth.mockReturnValue({ isAdmin: jest.fn(() => true) });
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('renders correctly and fetches data', async () => {
      await act(async () => {
        render(<Encuentros />);
      });
    
      const heading = await screen.findByRole('heading', { name: /Encuentros/i });
      expect(heading).toBeInTheDocument();

      const firstSportCell = screen.getAllByRole('cell')[0];
      expect(firstSportCell.textContent).toBe(responseApi[0].deporte);
    });

    it('filters results based on selected sport', async () => {
      render(<Encuentros />);
      await waitFor(() => expect(screen.getByText('Equipo A')).toBeInTheDocument());

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'Fútbol-sala' } });

      expect(screen.queryByText('Equipo A')).not.toBeInTheDocument(); // No debería mostrar resultados para Fútbol-sala
    });

    it('opens the modal correctly', async () => {
      render(<Encuentros />);
      await waitFor(() => expect(screen.getByText('Equipo A')).toBeInTheDocument());
      
      const editButton = screen.getByTestId('edit-button');
      fireEvent.click(editButton);
    
      const modalHeading = await screen.findByText('Administrar resultados'); // Título del modal
      expect(modalHeading).toBeInTheDocument();
    
    });
    
    it('renders edit button when user is admin', async () => {
      const { useAuth } = require('../../../context/AuthContext');
      useAuth.mockReturnValue({ isAdmin: jest.fn(() => true) });
      render(<Encuentros />);
      await waitFor(() => expect(screen.getByText('Equipo A')).toBeInTheDocument());
      const editButton = screen.getByTestId('edit-button');
      /*  // Busca el botón por su clase (usa querySelector en el container del render)
      const editButton = document.querySelector('.editPencil');
      console.log(editButton?.outerHTML);
      expect(editButton).not.toBeNull();
      */
      expect(editButton).toBeInTheDocument();
    });
  });
  describe('when user is not admin', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() => {
        return Promise.resolve({
          json: () => Promise.resolve(responseApi),
          status: 200,
        });
      });
      const { useAuth } = require('../../../context/AuthContext');
      useAuth.mockReturnValue({ isAdmin: jest.fn(() => false) });
    });
    it('does not render edit button when user is not admin', async () => {
      render(<Encuentros />);
      await waitFor(() => expect(screen.getByText('Equipo A')).toBeInTheDocument());
      const editButton = screen.queryByTestId('edit-button');    
      expect(editButton).toBeNull();
    });
  });
});
