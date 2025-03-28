import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminModalTeams from "./AdminModalTeams";
import { useAuth } from "../../../context/AuthContext";
import { useTeamsAndResults } from "../../../context/TeamsAndResultsContext";
import { mockAuthContext } from "../../../utils/mocks";
import { toast } from 'sonner';

jest.mock('../../../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

jest.mock('../../../context/TeamsAndResultsContext', () => ({
    useTeamsAndResults: jest.fn()
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const mockCloseModal = jest.fn();
const mockTeamsAndResultsContext = {
    teams: [],
    addTeam: jest.fn(),
    updateTeam: jest.fn(),
    updateResultsWithNewTeamName: jest.fn().mockResolvedValue({ ok: true }),
};

describe("AdminModalTeams Component", () => {
    beforeEach(() => {
        useAuth.mockReturnValue(mockAuthContext);
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
        jest.clearAllMocks();
        toast.success.mockClear();
        toast.error.mockClear();
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
                results: { wins: 10, losses: 2, draws: 3 }
            };
            render(<AdminModalTeams closeModal={mockCloseModal} isNewTeam={false} popupData={popupData} />);
            expect(screen.getByLabelText(/Deporte:/i)).toHaveValue(popupData.sport);
            expect(screen.getByLabelText(/Nombre del equipo:/i)).toHaveValue(popupData.name);
            expect(screen.getByLabelText(/Partidos ganados:/i)).toHaveValue(Number(popupData.results.wins));
            expect(screen.getByLabelText(/Partidos perdidos:/i)).toHaveValue(Number(popupData.results.losses));
            expect(screen.getByLabelText(/Partidos empatados:/i)).toHaveValue(Number(popupData.results.draws));
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
        it("calls addTeam for new team creation on valid submit and shows success toast", async () => {
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

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Equipo añadido correctamente');
            });
        });

        it("calls updateTeam for existing team update on valid submit and shows success toast", async () => {
            mockTeamsAndResultsContext.updateTeam.mockResolvedValue({ ok: true });
            render(<AdminModalTeams
                closeModal={mockCloseModal}
                isNewTeam={false}
                popupData={{
                    _id: 'someTeamId',
                    sport: 'Fútbol-7',
                    name: 'Existing Team',
                    points: 50,
                    results: { wins: 10, losses: 2, draws: 3 },
                }}
            />);

            fireEvent.change(screen.getByLabelText(/Nombre del equipo:/i), { target: { value: 'Updated Team Name' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(mockTeamsAndResultsContext.updateTeam).toHaveBeenCalledTimes(1);
                expect(mockTeamsAndResultsContext.updateTeam).toHaveBeenCalledWith('someTeamId', expect.anything());
            });
            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Equipo actualizado correctamente');
            });
        });

        it("shows error toast if addTeam fails", async () => {
            mockAuthContext.user = { _id: "123", email: "admin@test.com", role: "admin" };
            mockTeamsAndResultsContext.addTeam.mockResolvedValue({ ok: false });
            render(<AdminModalTeams closeModal={mockCloseModal} isNewTeam={true} />);

            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
            fireEvent.change(screen.getByLabelText(/Nombre del equipo:/i), { target: { value: 'Test Team' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Error añadiendo el equipo');
            });
        });

        it("shows error toast if updateTeam fails", async () => {
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
                    results: { wins: 10, losses: 2, draws: 3 },
                }}
            />);

            fireEvent.change(screen.getByLabelText(/Nombre del equipo:/i), { target: { value: 'Updated Team Name' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Error actualizando el equipo');
            });
        });

        it("shows generic error toast if updateTeam throws error", async () => {
            mockAuthContext.user = { _id: "123", email: "admin@test.com", role: "admin" };
            mockTeamsAndResultsContext.updateTeam.mockRejectedValue(new Error("Update failed"));
            render(<AdminModalTeams
                closeModal={mockCloseModal}
                isNewTeam={false}
                popupData={{ _id: 'someTeamId', sport: 'Fútbol-7', name: 'Existing Team' }}
            />);

            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Ocurrió un error al procesar la solicitud.');
            });
        });

        it("llama a updateResultsWithNewTeamName si el nombre del equipo ha cambiado", async () => {
            mockAuthContext.user = { _id: "123", email: "admin@test.com", role: "admin" };
        
            mockTeamsAndResultsContext.updateTeam.mockResolvedValue({ ok: true });
            mockTeamsAndResultsContext.updateResultsWithNewTeamName.mockResolvedValue({ ok: true });
        
            const popupData = {
                _id: 'team123',
                sport: 'Fútbol-7',
                name: 'Equipo Antiguo',
                points: 20,
                results: {
                    wins: 3,
                    losses: 1,
                    draws: 2
                }
            };
        
            render(<AdminModalTeams closeModal={mockCloseModal} isNewTeam={false} popupData={popupData} />);
        
            fireEvent.change(screen.getByLabelText(/Nombre del equipo:/i), { target: { value: 'Equipo Nuevo' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
        
            await waitFor(() => {
                expect(mockTeamsAndResultsContext.updateTeam).toHaveBeenCalledWith('team123', expect.anything());
                expect(mockTeamsAndResultsContext.updateResultsWithNewTeamName).toHaveBeenCalledWith('team123', 'Equipo Nuevo');
                expect(toast.success).toHaveBeenCalledWith('Equipo actualizado correctamente');
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