import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminModalTeams from "./AdminModalTeams";
import { useAuth } from "../../../context/AuthContext";
import { useTeamsAndResults } from "../../../context/TeamsAndResultsContext";
import { mockAuthContext } from "../../../utils/mocks";

jest.mock('../../../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

jest.mock('../../../context/TeamsAndResultsContext', () => ({
    useTeamsAndResults: jest.fn()
}));

const mockCloseModal = jest.fn();
const mockTeamsAndResultsContext = {
    teams: [],
    addTeam: jest.fn(),
    updateTeam: jest.fn(),
};

describe("AdminModalTeams Component", () => {
    beforeEach(() => {
        useAuth.mockReturnValue(mockAuthContext);
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
        jest.clearAllMocks();
    });

    describe("Rendering and Initial Display", () => {
        it("renders the component in Add Team mode", () => {
            render(<AdminModalTeams closeModal={mockCloseModal} isNewTeam={true} />);
            expect(screen.getByRole('heading', { name: /Añadir equipo/i })).toBeInTheDocument();
        });

        it("renders the component in Edit Team mode", () => {
            render(<AdminModalTeams closeModal={mockCloseModal} isNewTeam={false} popupData={{ name: 'Test Team', sport: 'Fútbol-7' }} />);
            expect(screen.getByRole('heading', { name: /Editar equipo/i })).toBeInTheDocument();
        });

        it("renders all form fields", () => {
            render(<AdminModalTeams closeModal={mockCloseModal} isNewTeam={true} />);
            expect(screen.getByLabelText(/Deporte:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Nombre del equipo:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Partidos ganados:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Partidos perdidos:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Partidos empatados:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Puntos:/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument();
        });

        it("fills in initial values when in Edit Team mode", () => {
            const popupData = {
                sport: 'Fútbol-sala', name: 'Existing Team', points: 50,
                results: { partidos_ganados: 10, partidos_perdidos: 2, partidos_empatados: 3 }
            };
            render(<AdminModalTeams closeModal={mockCloseModal} isNewTeam={false} popupData={popupData} />);
            expect(screen.getByLabelText(/Deporte:/i)).toHaveValue(popupData.sport);
            expect(screen.getByLabelText(/Nombre del equipo:/i)).toHaveValue(popupData.name);
            expect(screen.getByLabelText(/Partidos ganados:/i)).toHaveValue(Number(popupData.results.partidos_ganados));
            expect(screen.getByLabelText(/Partidos perdidos:/i)).toHaveValue(Number(popupData.results.partidos_perdidos));
            expect(screen.getByLabelText(/Partidos empatados:/i)).toHaveValue(Number(popupData.results.partidos_empatados));
            expect(screen.getByLabelText(/Puntos:/i)).toHaveValue(Number(popupData.points));
        });
    });

    describe("Input Validation and Error Messages", () => {
        it("shows error message for empty sport field", async () => {
            render(<AdminModalTeams closeModal={mockCloseModal} isNewTeam={true} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, selecciona un deporte/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty team name field", async () => {
            render(<AdminModalTeams closeModal={mockCloseModal} isNewTeam={true} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, introduce el nombre del equipo/i)).toBeInTheDocument();
            });
        });

        it("shows error message for negative partidos ganados", async () => {
            render(<AdminModalTeams closeModal={mockCloseModal} isNewTeam={true} />);
            fireEvent.change(screen.getByLabelText(/Partidos ganados:/i), { target: { value: '-1' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/El valor no puede ser negativo/i)).toBeInTheDocument();
            });
        });

        it("shows error message for negative puntos", async () => {
            render(<AdminModalTeams closeModal={mockCloseModal} isNewTeam={true} />);
            fireEvent.change(screen.getByLabelText(/Puntos:/i), { target: { value: '-10' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/El valor no puede ser negativo/i)).toBeInTheDocument();
            });
        });
    });

    describe("Form Submission and API Calls", () => {
        it("calls addTeam for new team creation on valid submit and shows success message", async () => {
            mockAuthContext.user = { _id: "123", email: "admin@test.com", role: "admin" };
            mockTeamsAndResultsContext.addTeam.mockResolvedValue({ ok: true });
            render(<AdminModalTeams closeModal={mockCloseModal} isNewTeam={true} />);
        
            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
            fireEvent.change(screen.getByLabelText(/Nombre del equipo:/i), { target: { value: 'New Team Name' } });
            fireEvent.change(screen.getByLabelText(/Partidos ganados:/i), { target: { value: '5' } });
            fireEvent.change(screen.getByLabelText(/Partidos perdidos:/i), { target: { value: '2' } });
            fireEvent.change(screen.getByLabelText(/Partidos empatados:/i), { target: { value: '1' } });
            fireEvent.change(screen.getByLabelText(/Puntos:/i), { target: { value: '16' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
        
            await new Promise(resolve => setTimeout(resolve, 0));
        
            await waitFor(() => {
                expect(screen.getByText(/Equipo añadido correctamente/i)).toBeInTheDocument();
            });
        });

        it("calls updateTeam for existing team update on valid submit", async () => {
            mockTeamsAndResultsContext.updateTeam.mockResolvedValue();
            render(<AdminModalTeams
                closeModal={mockCloseModal}
                isNewTeam={false} 
                popupData={{
                    _id: 'someTeamId',
                    sport: 'Fútbol-7',
                    name: 'Existing Team',
                    points: 50,
                    results: { partidos_ganados: 10, partidos_perdidos: 2, partidos_empatados: 3 },
                }}
            />);

            fireEvent.change(screen.getByLabelText(/Nombre del equipo:/i), { target: { value: 'Updated Team Name' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(mockTeamsAndResultsContext.updateTeam).toHaveBeenCalledTimes(1);
                expect(mockTeamsAndResultsContext.updateTeam).toHaveBeenCalledWith('someTeamId', expect.anything());
            });
        });

        it("shows error message if addTeam fails", async () => {
            mockAuthContext.user = { _id: "123", email: "admin@test.com", role: "admin" };
            mockTeamsAndResultsContext.addTeam.mockResolvedValue({ ok: false });
            render(<AdminModalTeams closeModal={mockCloseModal} isNewTeam={true} />);

            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
            fireEvent.change(screen.getByLabelText(/Nombre del equipo:/i), { target: { value: 'Test Team' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(screen.getByText(/Error añadiendo el equipo/i)).toBeInTheDocument();
            });
        });

        it("shows error message if updateTeam fails", async () => {
            mockAuthContext.user = { _id: "123", email: "admin@test.com", role: "admin" };
            mockTeamsAndResultsContext.updateTeam.mockResolvedValue({ ok: false });
            render(<AdminModalTeams
                closeModal={mockCloseModal}
                isNewTeam={false}
                popupData={{
                    _id: 'someTeamId',
                    sport: 'Fútbol-7',
                    name: 'Existing Team',
                    points: 50,
                    results: { partidos_ganados: 10, partidos_perdidos: 2, partidos_empatados: 3 },
                }}
            />);

            fireEvent.change(screen.getByLabelText(/Nombre del equipo:/i), { target: { value: 'Updated Team Name' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(screen.getByText(/Error actualizando el equipo/i)).toBeInTheDocument();
            });
        });

         it("shows generic error message if updateTeam fails", async () => {
            mockAuthContext.user = { _id: "123", email: "admin@test.com", role: "admin" };
            mockTeamsAndResultsContext.updateTeam.mockRejectedValue(new Error("Update failed"));
            render(<AdminModalTeams
                closeModal={mockCloseModal}
                isNewTeam={false}
                popupData={{ _id: 'someTeamId', sport: 'Fútbol-7', name: 'Existing Team'}}
            />);

            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(screen.getByText(/Ocurrió un error al procesar la solicitud./i)).toBeInTheDocument();
            });
        });
    });

    describe("Modal Close Functionality", () => {
        it("calls closeModal function when close button is clicked", () => {
            render(<AdminModalTeams closeModal={mockCloseModal} isNewTeam={true} />);
            fireEvent.click(document.querySelector('#close-menu'));
            expect(mockCloseModal).toHaveBeenCalledTimes(1);
        });
    });
});