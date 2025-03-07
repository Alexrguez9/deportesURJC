import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminModalResults from "./AdminModalResults";
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
const mockTeams = [
    { _id: 'team1', name: 'Team A', sport: 'Fútbol-7' },
    { _id: 'team2', name: 'Team B', sport: 'Fútbol-7' },
    { _id: 'team3', name: 'Team C', sport: 'Básket 3x3' },
];
const mockTeamsAndResultsContext = {
    teams: mockTeams,
    addResult: jest.fn().mockResolvedValue({ ok: true }),
    updateResult: jest.fn().mockResolvedValue({ ok: true }),
};

describe("AdminModalResults Component", () => {
    beforeEach(() => {
        useAuth.mockReturnValue(mockAuthContext);
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
        jest.clearAllMocks();
    });

    describe("Rendering and Initial Display", () => {
        it("renders the component in Add Result mode", () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            expect(screen.getByRole('heading', { name: /Añadir resultado/i })).toBeInTheDocument();
        });

        it("renders the component in Edit Result mode", () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={false} popupData={{ sport: 'Fútbol-7' }} />);
            expect(screen.getByRole('heading', { name: /Editar resultado/i })).toBeInTheDocument();
        });

        it("renders all form fields", () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            expect(screen.getByLabelText(/Deporte:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Jornada:/i)).toBeInTheDocument();
            expect(screen.getByLabelText('Equipo local:')).toBeInTheDocument();
            expect(screen.getByLabelText(/Goles del equipo local:/i)).toBeInTheDocument();
            expect(screen.getByLabelText('Equipo visitante:')).toBeInTheDocument();
            expect(screen.getByLabelText(/Goles del equipo visitante:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Fecha:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Hora:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Lugar:/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument();
        });

        it("fills in initial values when in Edit Result mode", async () => {
            const popupData = {
                sport: 'Fútbol-7',
                jornada: 5,
                equipo_local: 'Team A',
                goles_local: 2,
                equipo_visitante: 'Team B',
                goles_visitante: 1,
                fecha: '2024-07-20',
                hora: '19:00',
                lugar: 'Campo X'
            };
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={false} popupData={popupData} />);
            await waitFor(() => {
                const localTeamLabel = screen.getByText('Equipo local:').closest('label');
                const localTeamOptionA = localTeamLabel.querySelector('option[value="Team A"]');
                expect(localTeamOptionA).toBeInTheDocument();
            });

            expect(screen.getByLabelText(/Deporte:/i)).toHaveValue(popupData.sport);
            expect(screen.getByLabelText(/Jornada:/i)).toHaveValue(Number(popupData.jornada));
            expect(screen.getByLabelText('Equipo local:')).toHaveValue(popupData.equipo_local);
            expect(screen.getByLabelText(/Goles del equipo local:/i)).toHaveValue(Number(popupData.goles_local));
            expect(screen.getByLabelText('Equipo visitante:')).toHaveValue(popupData.equipo_visitante);
            expect(screen.getByLabelText(/Goles del equipo visitante:/i)).toHaveValue(Number(popupData.goles_visitante));
            expect(screen.getByLabelText(/Fecha:/i)).toHaveValue("2024-07-20");
            expect(screen.getByLabelText(/Hora:/i)).toHaveValue(popupData.hora);
            expect(screen.getByLabelText(/Lugar:/i)).toHaveValue(popupData.lugar);
        });
    });

    describe("Input Validation and Error Messages", () => {
        it("shows error message for empty deporte field", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, selecciona un deporte/i)).toBeInTheDocument();
            });
        });

        it("Jornada field should have value 1 when is not passed by props", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByLabelText(/Jornada:/i)).toHaveValue(1); 
            });
        });

        it("shows error message for empty equipo local field", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
            fireEvent.change(screen.getByLabelText(/Jornada:/i), { target: { value: '1' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, selecciona un equipo local/i)).toBeInTheDocument();
            });
        });

        it("shows error message for negative goles local", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
            fireEvent.change(screen.getByLabelText(/Jornada:/i), { target: { value: '1' } });
            fireEvent.change(screen.getByLabelText('Equipo local:'), { target: { value: 'Team A' } });
            fireEvent.change(screen.getByLabelText('Equipo visitante:'), { target: { value: 'Team B' } });
            fireEvent.change(screen.getByLabelText(/Fecha:/i), { target: { value: '2024-07-20' } });
            fireEvent.change(screen.getByLabelText(/Hora:/i), { target: { value: '19:00' } });
            fireEvent.change(screen.getByLabelText(/Lugar:/i), { target: { value: 'Campo X' } });
            fireEvent.change(screen.getByLabelText(/Goles del equipo local:/i), { target: { value: '-1' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(screen.getByText(/Los goles no pueden ser negativos/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty equipo visitante field", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
            fireEvent.change(screen.getByLabelText(/Jornada:/i), { target: { value: '1' } });
            fireEvent.change(screen.getByLabelText('Equipo local:'), { target: { value: 'Team A' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, selecciona un equipo visitante/i)).toBeInTheDocument();
            });
        });

        it("shows error message for negative goles visitante", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
            fireEvent.change(screen.getByLabelText(/Jornada:/i), { target: { value: '1' } });
            fireEvent.change(screen.getByLabelText('Equipo local:'), { target: { value: 'Team A' } });
            fireEvent.change(screen.getByLabelText('Equipo visitante:'), { target: { value: 'Team B' } });
            fireEvent.change(screen.getByLabelText(/Goles del equipo local:/i), { target: { value: '1' } });
            fireEvent.change(screen.getByLabelText(/Fecha:/i), { target: { value: '2024-07-20' } });
            fireEvent.change(screen.getByLabelText(/Hora:/i), { target: { value: '19:00' } });
            fireEvent.change(screen.getByLabelText(/Lugar:/i), { target: { value: 'Campo X' } });
            fireEvent.change(screen.getByLabelText(/Goles del equipo visitante:/i), { target: { value: '-1' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Los goles no pueden ser negativos/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty fecha field", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
            fireEvent.change(screen.getByLabelText(/Jornada:/i), { target: { value: '1' } });
            fireEvent.change(screen.getByLabelText('Equipo local:'), { target: { value: 'Team A' } });
            fireEvent.change(screen.getByLabelText('Equipo visitante:'), { target: { value: 'Team B' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, introduce la fecha/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty hora field", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
            fireEvent.change(screen.getByLabelText(/Jornada:/i), { target: { value: '1' } });
            fireEvent.change(screen.getByLabelText('Equipo local:'), { target: { value: 'Team A' } });
            fireEvent.change(screen.getByLabelText('Equipo visitante:'), { target: { value: 'Team B' } });
            fireEvent.change(screen.getByLabelText(/Fecha:/i), { target: { value: '2024-07-20' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, introduce la hora/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty lugar field", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
            fireEvent.change(screen.getByLabelText(/Jornada:/i), { target: { value: '1' } });
            fireEvent.change(screen.getByLabelText('Equipo local:'), { target: { value: 'Team A' } });
            fireEvent.change(screen.getByLabelText('Equipo visitante:'), { target: { value: 'Team B' } });
            fireEvent.change(screen.getByLabelText(/Fecha:/i), { target: { value: '2024-07-20' } });
            fireEvent.change(screen.getByLabelText(/Hora:/i), { target: { value: '19:00' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, introduce el lugar/i)).toBeInTheDocument();
            });
        });
    });

    describe("Form Submission and API Calls", () => {
        /* TODO: revisar estos tests
        it.only("calls addResult for new result creation on valid submit and shows success message", async () => {
            mockAuthContext.user = { _id: "123", email: "test@example.es", role: "admin" };
            const mockAddResult = mockTeamsAndResultsContext.addResult.mockResolvedValue({ ok: true });
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);

            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
            fireEvent.change(screen.getByLabelText(/Jornada:/i), { target: { value: '1' } });
            fireEvent.change(screen.getByLabelText('Equipo local:'), { target: { value: 'Team A' } });
            fireEvent.change(screen.getByLabelText(/Goles del equipo local:/i), { target: { value: '2' } });
            fireEvent.change(screen.getByLabelText('Equipo visitante:'), { target: { value: 'Team B' } });
            fireEvent.change(screen.getByLabelText(/Goles del equipo visitante:/i), { target: { value: '1' } });
            fireEvent.change(screen.getByLabelText(/Fecha:/i), { target: { value: '2024-07-20' } });
            fireEvent.change(screen.getByLabelText(/Hora:/i), { target: { value: '19:00' } });
            fireEvent.change(screen.getByLabelText(/Lugar:/i), { target: { value: 'Campo X' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await new Promise(resolve => setTimeout(resolve, 0));

            await waitFor(() => {
                // expect(mockAddResult).toHaveBeenCalledTimes(1);
                expect(screen.getByText(/Resultado añadido correctamente/i)).toBeInTheDocument();
            });
        });

        it.only("calls updateResult for existing result update on valid submit", async () => {
            mockAuthContext.user = { _id: "123", email: "admin@test.com", role: "admin" };
            const mockUpdateResult = mockTeamsAndResultsContext.updateResult;
            render(
                <AdminModalResults
                    closeModal={mockCloseModal}
                    isNewResult={false}
                    popupData={{
                        _id: 'someResultId',
                        sport: 'Fútbol-7',
                        jornada: 1,
                        equipo_local: 'Team A',
                        goles_local: 1,
                        equipo_visitante: 'Team B',
                        goles_visitante: 0,
                        fecha: '2024-07-20',
                        hora: '18:00',
                        lugar: 'Old Camp'
                    }}
                />
            );

            fireEvent.change(screen.getByLabelText(/Goles del equipo local:/i), { target: { value: '3' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(mockUpdateResult).toHaveBeenCalledTimes(1);
                expect(mockUpdateResult).toHaveBeenCalledWith('someResultId', expect.anything());
                expect(screen.getByText(/Resultado actualizado correctamente/i)).toBeInTheDocument();
            });
        });

        it.only("shows error message if addResult fails", async () => {
            mockAuthContext.user = { _id: "123", email: "admin@test.com", role: "admin" };
            mockTeamsAndResultsContext.addResult.mockResolvedValue({ ok: false });
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);

            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
            fireEvent.change(screen.getByLabelText(/Jornada:/i), { target: { value: '1' } });
            fireEvent.change(screen.getByLabelText('Equipo local:'), { target: { value: 'Team A' } });
            fireEvent.change(screen.getByLabelText(/Goles del equipo local:/i), { target: { value: '2' } });
            fireEvent.change(screen.getByLabelText('Equipo visitante:'), { target: { value: 'Team B' } });
            fireEvent.change(screen.getByLabelText(/Goles del equipo visitante:/i), { target: { value: '1' } });
            fireEvent.change(screen.getByLabelText(/Fecha:/i), { target: { value: '2024-07-20' } });
            fireEvent.change(screen.getByLabelText(/Hora:/i), { target: { value: '19:00' } });
            fireEvent.change(screen.getByLabelText(/Lugar:/i), { target: { value: 'Campo X' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            console.log('screen:', screen.debug());

            await waitFor(() => {
                expect(screen.getByText(/Error añadiendo el resultado/i)).toBeInTheDocument();
            });
        });

        // it.only("shows generic error message if updateResult fails with rejection", async () => {
        //     mockAuthContext.user = { _id: "123", email: "admin@test.com", role: "admin" };
        //     mockTeamsAndResultsContext.updateResult.mockRejectedValue(new Error("Update failed"));
        //     render(
        //         <AdminModalResults
        //             closeModal={mockCloseModal}
        //             isNewResult={false}
        //             popupData={{
        //                 _id: 'someResultId',
        //                 sport: 'Fútbol-7',
        //                 jornada: 1,
        //                 equipo_local: 'Team A',
        //                 goles_local: 1,
        //                 equipo_visitante: 'Team B',
        //                 goles_visitante: 0,
        //                 fecha: '2024-07-20',
        //                 hora: '18:00',
        //                 lugar: 'Old Camp'
        //             }}
        //         />
        //     );
        //     fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

        //     await waitFor(() => {
        //         expect(screen.getByText(/Error actualizando el resultado/i)).toBeInTheDocument();
        //     });
        // });
        */

        it("shows error message if updateResult fails", async () => {
            mockAuthContext.user = { _id: "123", email: "admin@test.com", role: "admin" };
            mockTeamsAndResultsContext.updateResult.mockResolvedValue({ ok: false });
            render(
                <AdminModalResults
                    closeModal={mockCloseModal}
                    isNewResult={false}
                    popupData={{
                        _id: 'someResultId',
                        sport: 'Fútbol-7',
                        jornada: 1,
                        equipo_local: 'Team A',
                        goles_local: 1,
                        equipo_visitante: 'Team B',
                        goles_visitante: 0,
                        fecha: '2024-07-20',
                        hora: '18:00',
                        lugar: 'Old Camp'
                    }}
                />
            );

            fireEvent.change(screen.getByLabelText(/Goles del equipo local:/i), { target: { value: '3' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(screen.getByText(/Error actualizando el resultado/i)).toBeInTheDocument();
            });
        });
    });

    describe("Modal Close Functionality", () => {
        it("calls closeModal function when close button is clicked", () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.click(document.querySelector('#close-menu'));
            expect(mockCloseModal).toHaveBeenCalledTimes(1);
        });
    });

    describe("Sport selection and team filtering", () => {
        it("filters teams based on selected sport", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Básket 3x3' } });
            await waitFor(() => {
                expect(screen.getByLabelText('Equipo local:')).toHaveValue('');
                expect(screen.getByLabelText('Equipo visitante:')).toHaveValue('');
            });
            const localTeamOptions = await screen.findAllByRole('option', { name: /Team C/i });
            expect(localTeamOptions.length).toBeGreaterThanOrEqual(1);

            const localTeamOptions_football = await screen.queryAllByRole('option', { name: /Team A/i });
            expect(localTeamOptions_football.length).toBe(0);

            fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
            await waitFor(() => {
                expect(screen.getByLabelText('Equipo local:')).toHaveValue('');
                expect(screen.getByLabelText('Equipo visitante:')).toHaveValue('');
            });
            const localTeamOptionsFootball7 = await screen.findAllByRole('option', { name: /Team A/i });
            expect(localTeamOptionsFootball7.length).toBeGreaterThanOrEqual(1);

            const localTeamOptions_basket = await screen.queryAllByRole('option', { name: /Team C/i });
            expect(localTeamOptions_basket.length).toBe(0);
        });
    });

    describe("Initial sport selection in edit mode", () => {
        it("filters teams based on initial sport in edit mode", async () => {
            render(
                <AdminModalResults
                    closeModal={mockCloseModal}
                    isNewResult={false}
                    popupData={{ sport: 'Básket 3x3' }}
                />
            );
            await waitFor(() => {
                expect(screen.getByLabelText(/Deporte:/i)).toHaveValue('Básket 3x3');
            });
            const localTeamOptions = await screen.findAllByRole('option', { name: /Team C/i });
            expect(localTeamOptions.length).toBeGreaterThanOrEqual(1);

            const localTeamOptions_football = await screen.queryAllByRole('option', { name: /Team A/i });
            expect(localTeamOptions_football.length).toBe(0); // Should not show football teams
        });
    });
});