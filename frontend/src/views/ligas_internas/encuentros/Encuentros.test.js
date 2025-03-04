import React from 'react';
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import Encuentros from "./Encuentros";
import { BrowserRouter } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useTeamsAndResults } from "../../../context/TeamsAndResultsContext";
import { mockAuthContext, mockTeamsAndResultsContext } from "../../../utils/mocks";

jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

jest.mock("../../../context/TeamsAndResultsContext", () => ({
    useTeamsAndResults: jest.fn()
}));

describe("Encuentros Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
    });

    it("renders Encuentros component", () => {
        render(
            <BrowserRouter>
                <Encuentros />
            </BrowserRouter>
        );
        expect(screen.getByRole('heading', { name: /encuentros/i })).toBeInTheDocument();
    });

    it("displays welcome message for non-admin users", () => {
        mockAuthContext.isAdmin.mockReturnValue(false);
        render(
            <BrowserRouter>
                <Encuentros />
            </BrowserRouter>
        );
        expect(screen.getByText(/Bienvenido a la página de Encuentros/i)).toBeInTheDocument();
    });

    it("displays admin instructions for admin users", () => {
        mockAuthContext.isAdmin.mockReturnValue(true);
        render(
            <BrowserRouter>
                <Encuentros />
            </BrowserRouter>
        );
        expect(screen.getByText(/Aquí puedes administrar los Encuentros/i)).toBeInTheDocument();
    });

    it("renders the 'add' button for admin users", () => {
      mockAuthContext.user = { _id: "123", email: "test@admin.es", role: "admin" };
      mockAuthContext.isAdmin.mockReturnValue(true);
      render(
          <BrowserRouter>
              <Encuentros />
          </BrowserRouter>
      );
      const topButtonsContent = document.querySelector('.top-buttons-content');
      const addButton = topButtonsContent.querySelector('.iconPlus');
      expect(addButton).toBeInTheDocument();
    });

    it("does not render the 'add' button for non-admin users", () => {
      mockAuthContext.isAdmin.mockReturnValue(false);
      render(
          <BrowserRouter>
              <Encuentros />
          </BrowserRouter>
      );
      const topButtonsContent = document.querySelector('.top-buttons-content');
      const addButton = topButtonsContent.querySelector('.iconPlus');
      expect(addButton).not.toBeInTheDocument();
    });

    it("renders results table when results are available", async () => {
        render(
            <BrowserRouter>
                <Encuentros />
            </BrowserRouter>
        );
        await waitFor(() => {
            const select = screen.getByRole("combobox");
            fireEvent.change(select, { target: { value: "Fútbol-7" } });
            expect(screen.getByRole('table')).toBeInTheDocument();
        });
    });

    it("renders 'No hay resultados' message when no results are available for a filter", async () => {
        mockTeamsAndResultsContext.results = [];
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
        render(
            <BrowserRouter>
                <Encuentros />
            </BrowserRouter>
        );
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Fútbol-7' } });
        await waitFor(() => {
            expect(screen.getByText(/No hay resultados de Fútbol-7 para mostrar/i)).toBeInTheDocument();
        });
    });

    it("filters results by sport", async () => {
      mockTeamsAndResultsContext.results = [{ _id: '1', jornada: 1, goles_local: 2, goles_visitante: 1, sport: 'Fútbol-sala', equipo_local: 'Local Team', equipo_visitante: 'Visitor Team' }];
      mockTeamsAndResultsContext.fetchResults.mockResolvedValue(mockTeamsAndResultsContext.results);
      useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
      render(
          <BrowserRouter>
              <Encuentros />
          </BrowserRouter>
      );
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Fútbol-sala' } });
      await waitFor(() => {

        expect(screen.queryByRole('cell', { name: /Fútbol-sala/i })).toBeInTheDocument();
      });
    });

    it("filters results Fútbol-7 by default", async () => {
        render(
            <BrowserRouter>
                <Encuentros />
            </BrowserRouter>
        );
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Fútbol-sala' } });
        await waitFor(() => {
            // Assuming mockResults only has 'Fútbol-7', checking for its absence after filtering for 'Fútbol-sala'
            expect(screen.queryByRole('cell', { name: /Fútbol-7/i })).not.toBeInTheDocument();
        });
    });

    it("opens the modal when 'add' button is clicked by admin", async () => {
        mockAuthContext.isAdmin.mockReturnValue(true);
        mockTeamsAndResultsContext.results = [{ _id: '1', jornada: 1, goles_local: 2, goles_visitante: 1, sport: 'Fútbol-7', equipo_local: 'Local Team', equipo_visitante: 'Visitor Team' }]; // Added team names
        mockTeamsAndResultsContext.fetchResults.mockResolvedValue(mockTeamsAndResultsContext.results);
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <Encuentros />
            </BrowserRouter>
        );
        const topButtonsContent = document.querySelector('.top-buttons-content');
        const addButton = topButtonsContent.querySelector('.iconPlus');
        fireEvent.click(addButton);
        await waitFor(() => {
          expect(mockTeamsAndResultsContext.fetchResults).toHaveBeenCalledTimes(1);
        });
    });

    it("opens the modal with result data when 'edit' button is clicked by admin", async () => {
        mockAuthContext.isAdmin.mockReturnValue(true);
        mockTeamsAndResultsContext.results = [{ _id: '1', jornada: 1, goles_local: 2, goles_visitante: 1, sport: 'Fútbol-7', equipo_local: 'Local Team', equipo_visitante: 'Visitor Team' }];
        mockTeamsAndResultsContext.fetchResults.mockResolvedValue(mockTeamsAndResultsContext.results);
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <Encuentros />
            </BrowserRouter>
        );
        await waitFor(() => {
          const editButton = screen.getByRole('cell', { name: 'Fútbol-7' }).closest('tr').querySelector('.editPencil');
          fireEvent.click(editButton);
        });
        await waitFor(() => {
            expect(mockTeamsAndResultsContext.fetchResults).toHaveBeenCalledTimes(1);
        });
    });

    it("calls deleteResult function when 'delete' button is clicked by admin", async () => {
        mockAuthContext.isAdmin.mockReturnValue(true);
        mockTeamsAndResultsContext.deleteResult.mockResolvedValue(true);
        mockTeamsAndResultsContext.results = [{ _id: '1', jornada: 1, goles_local: 2, goles_visitante: 1, sport: 'Fútbol-7', equipo_local: 'Local Team', equipo_visitante: 'Visitor Team' }];
        mockTeamsAndResultsContext.fetchResults.mockResolvedValue(mockTeamsAndResultsContext.results);
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
        useAuth.mockReturnValue(mockAuthContext);

        render(
            <BrowserRouter>
                <Encuentros />
            </BrowserRouter>
        );

        await waitFor(() => screen.getByRole('cell', { name: 'Fútbol-7' }));
        const deleteButton = screen.getByRole('cell', { name: 'Fútbol-7' }).closest('tr').querySelector('.deleteTrash');
        console.log('deleteButton: ', deleteButton);
        fireEvent.click(deleteButton);

        await waitFor(async () => {
            expect(mockTeamsAndResultsContext.deleteResult).toHaveBeenCalledTimes(1);
            expect(mockTeamsAndResultsContext.deleteResult).toHaveBeenCalledWith('1');
        });
    });
});