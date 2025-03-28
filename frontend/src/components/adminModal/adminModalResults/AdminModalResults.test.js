import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminModalResults from "./AdminModalResults";
import { useTeamsAndResults } from "../../../context/TeamsAndResultsContext";
import { toast } from 'sonner';

jest.mock('../../../context/TeamsAndResultsContext', () => ({
    useTeamsAndResults: jest.fn()
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('../../../utils/dates.js', () => ({
    getDateWithoutTime: jest.fn().mockImplementation(date => date)
}));


const mockCloseModal = jest.fn();
const mockTeamsAndResultsContext = {
    teams: [
        { _id: 'team1', name: 'Team 1', sport: 'Fútbol-7' },
        { _id: 'team2', name: 'Team 2', sport: 'Fútbol-7' },
        { _id: 'team3', name: 'Team 3', sport: 'Fútbol-sala' },
        { _id: 'team4', name: 'Team 4', sport: 'Básket 3x3' },
        { _id: 'team5', name: 'Team 5', sport: 'Voleibol' },
    ],
    addResult: jest.fn(),
    updateResult: jest.fn(),
};

describe("AdminModalResults Component", () => {
    beforeEach(() => {
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
        jest.clearAllMocks();
        toast.success.mockClear();
        toast.error.mockClear();
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
            expect(screen.getByRole('combobox', { name: /Equipo local:/i })).toBeInTheDocument();
            expect(screen.getByLabelText(/Goles del equipo local:/i)).toBeInTheDocument();
            expect(screen.getByRole('combobox', { name: /Equipo visitante:/i })).toBeInTheDocument();
            expect(screen.getByLabelText(/Goles del equipo visitante:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Fecha:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Hora:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Lugar:/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument();
        });

        // it.only("fills in initial values when in Edit Result mode", async () => {
        //     const popupData = {
        //         sport: 'Fútbol-sala',
        //         round: 5, localTeam: 'Team 1',
        //         localGoals: 2,
        //         visitorTeam: 'Team 3',
        //         visitorGoals: 1,
        //         date: '2024-07-20',
        //         hour: '10:00',
        //         place: 'Campo A'
        //     };
        //     render(<AdminModalResults closeModal={mockCloseModal} isNewResult={false} popupData={popupData} />);
        //     await waitFor(() => {
        //         expect(screen.getByLabelText(/Deporte:/i)).toHaveValue(popupData.sport);
        //         expect(screen.getByLabelText(/Jornada:/i)).toHaveValue(Number(popupData.round));
        //     });
        //     fireEvent.blur(screen.getByLabelText(/Deporte:/i));

        //     await waitFor(() => {
        //         expect(screen.getByRole('combobox', { name: /Equipo local:/i })).toHaveValue(popupData.localTeam);
        //         expect(screen.getByLabelText(/Goles del equipo local:/i)).toHaveValue(Number(popupData.localGoals));
        //     });
        //     fireEvent.blur(screen.getByRole('combobox', { name: "Equipo local:" }));

        //     await waitFor(() => {
        //         expect(screen.getByRole('combobox', { name: /Equipo visitante:/i })).toHaveValue(popupData.visitorTeam);
        //         expect(screen.getByLabelText(/Goles del equipo visitante:/i)).toHaveValue(Number(popupData.visitorGoals));
        //     });
        //     fireEvent.blur(screen.getByRole('combobox', { name: "Equipo visitante:" }));

        //     expect(screen.getByLabelText(/Fecha:/i)).toHaveValue("2024-07-20");
        //     expect(screen.getByLabelText(/Hora:/i)).toHaveValue(popupData.hour);
        //     expect(screen.getByLabelText(/Lugar:/i)).toHaveValue(popupData.place);
        // });

        it("filters teams based on selected sport", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            const sportSelect = screen.getByLabelText(/Deporte:/i);
            fireEvent.change(sportSelect, { target: { value: 'Fútbol-7' } });

            await waitFor(() => {
                const localTeamOptions = screen.getByRole('combobox', { name: /Equipo local:/i }).querySelectorAll('option');
                const visitorTeamOptions = screen.getByRole('combobox', { name: /Equipo visitante:/i }).querySelectorAll('option');

                const localTeamNames = Array.from(localTeamOptions).map(option => option.textContent);
                const visitorTeamNames = Array.from(visitorTeamOptions).map(option => option.textContent);

                expect(localTeamNames).toContain('Team 1');
                expect(localTeamNames).toContain('Team 2');
                expect(localTeamNames).not.toContain('Team 3'); // Fútbol-sala team
                expect(visitorTeamNames).toContain('Team 1');
                expect(visitorTeamNames).toContain('Team 2');
                expect(visitorTeamNames).not.toContain('Team 3'); // Fútbol-sala team
            });

            fireEvent.change(sportSelect, { target: { value: 'Fútbol-sala' } });
            await waitFor(() => {
                const localTeamOptions = screen.getByRole('combobox', { name: /Equipo local:/i }).querySelectorAll('option');
                const visitorTeamOptions = screen.getByRole('combobox', { name: /Equipo visitante:/i }).querySelectorAll('option');

                const localTeamNames = Array.from(localTeamOptions).map(option => option.textContent);
                const visitorTeamNames = Array.from(visitorTeamOptions).map(option => option.textContent);

                expect(localTeamNames).not.toContain('Team 1'); // Fútbol-7 team
                expect(localTeamNames).toContain('Team 3'); // Fútbol-sala team
                expect(visitorTeamNames).not.toContain('Team 1'); // Fútbol-7 team
                expect(visitorTeamNames).toContain('Team 3'); // Fútbol-sala team
            });
        });
    });

    describe("Input Validation and Error Messages", () => {
        it("shows error message for empty sport field", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, selecciona un deporte/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty equipo local field", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, selecciona un equipo local/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty equipo visitante field", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, selecciona un equipo visitante/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty date field", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, introduce la fecha/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty hour field", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, introduce la hora/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty place field", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, introduce el place/i)).toBeInTheDocument();
            });
        });

        it("shows error message for negative goles local", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.change(screen.getByLabelText(/Goles del equipo local:/i), { target: { value: '-1' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Los goles no pueden ser negativos/i)).toBeInTheDocument();
            });
        });

        it("shows error message for negative goles visitante", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.change(screen.getByLabelText(/Goles del equipo visitante:/i), { target: { value: '-1' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Los goles no pueden ser negativos/i)).toBeInTheDocument();
            });
        });

        it("does not show error message if goles are zero", async () => {
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
            fireEvent.change(screen.getByLabelText(/Goles del equipo local:/i), { target: { value: '0' } });
            fireEvent.change(screen.getByLabelText(/Goles del equipo visitante:/i), { target: { value: '0' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.queryByText(/Los goles no pueden ser negativos/i)).not.toBeInTheDocument();
            });
        });
    });

    describe("Form Submission and API Calls", () => {
        it("calls addResult for new result creation on valid submit and shows success toast", async () => {
            mockTeamsAndResultsContext.addResult.mockResolvedValue({ ok: true });
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
        
            await waitFor(() => {
                fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
                expect(screen.getByLabelText(/Deporte:/i)).toHaveValue('Fútbol-7');
            });
            fireEvent.blur(screen.getByLabelText(/Deporte:/i));
        
            await waitFor(() => {
                fireEvent.change(screen.getByRole('combobox', { name: "Equipo local:" }), { target: { value: 'Team 1' } });
                expect(screen.getByRole('combobox', { name: "Equipo local:" })).toHaveValue('Team 1');
            });
            fireEvent.blur(screen.getByRole('combobox', { name: "Equipo local:" }));
        
            await waitFor(() => {
                fireEvent.change(screen.getByRole('combobox', { name: "Equipo visitante:" }), { target: { value: 'Team 2' } });
                expect(screen.getByRole('combobox', { name: "Equipo visitante:" })).toHaveValue('Team 2');
            });
            fireEvent.blur(screen.getByRole('combobox', { name: "Equipo visitante:" }));
        
            fireEvent.change(screen.getByLabelText(/Fecha:/i), { target: { value: '2024-07-21' } });
            fireEvent.change(screen.getByLabelText(/Hora:/i), { target: { value: '11:00' } });
            fireEvent.change(screen.getByLabelText(/Lugar:/i), { target: { value: 'Campo B' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
        
            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Resultado añadido correctamente');
            });
        });

        it("calls updateResult for existing result update on valid submit and shows success toast", async () => {
            mockTeamsAndResultsContext.updateResult.mockResolvedValue({ ok: true });
            render(<AdminModalResults
                closeModal={mockCloseModal}
                isNewResult={false}
                popupData={{
                    _id: 'someResultId',
                    sport: 'Fútbol-7',
                    round: 1,
                    localTeam: 'Team 1',
                    localGoals: 2,
                    visitorTeam: 'Team 2',
                    visitorGoals: 1,
                    date: '2024-07-21',
                    hour: '11:00',
                    place: 'Campo B'
                }}
            />);

            fireEvent.change(screen.getByLabelText(/Goles del equipo local:/i), { target: { value: '3' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(mockTeamsAndResultsContext.updateResult).toHaveBeenCalledTimes(1);
                expect(mockTeamsAndResultsContext.updateResult).toHaveBeenCalledWith('someResultId', expect.anything());
            });
            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Resultado actualizado correctamente');
            });
            await waitFor(() => {
                expect(mockCloseModal).toHaveBeenCalledTimes(1);
            });
        });

        it("shows error toast if addResult fails", async () => {
            mockTeamsAndResultsContext.addResult.mockResolvedValue({ ok: false });
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
        
            await waitFor(() => {
                fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
                expect(screen.getByLabelText(/Deporte:/i)).toHaveValue('Fútbol-7');
            });
            fireEvent.blur(screen.getByLabelText(/Deporte:/i));
        
            await waitFor(() => {
                fireEvent.change(screen.getByRole('combobox', { name: "Equipo local:" }), { target: { value: 'Team 1' } });
                expect(screen.getByRole('combobox', { name: "Equipo local:" })).toHaveValue('Team 1');
            });
            fireEvent.blur(screen.getByRole('combobox', { name: "Equipo local:" }));
        
            await waitFor(() => {
                fireEvent.change(screen.getByRole('combobox', { name: "Equipo visitante:" }), { target: { value: 'Team 2' } });
                expect(screen.getByRole('combobox', { name: "Equipo visitante:" })).toHaveValue('Team 2');
            });
            fireEvent.blur(screen.getByRole('combobox', { name: "Equipo visitante:" }));
        
            fireEvent.change(screen.getByLabelText(/Fecha:/i), { target: { value: '2024-07-21' } });
            fireEvent.change(screen.getByLabelText(/Hora:/i), { target: { value: '11:00' } });
            fireEvent.change(screen.getByLabelText(/Lugar:/i), { target: { value: 'Campo B' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Error añadiendo el resultado');
            });
        });

        it("shows error toast if updateResult fails", async () => {
            mockTeamsAndResultsContext.updateResult.mockResolvedValue({ ok: false });
            render(<AdminModalResults
                closeModal={mockCloseModal}
                isNewResult={false}
                popupData={{
                    _id: 'someResultId',
                    sport: 'Fútbol-7',
                    round: 1,
                    localTeam: 'Team 1',
                    localGoals: 2,
                    visitorTeam: 'Team 2',
                    visitorGoals: 1,
                    date: '2024-07-21',
                    hour: '11:00',
                    place: 'Campo B'
                }}
            />);

            fireEvent.change(screen.getByLabelText(/Goles del equipo local:/i), { target: { value: '3' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Error actualizando el resultado');
            });
        });

        it('Haciendo click en deporte, y después click en Equipo local, debería mostrar el Equipo local', async () => {
            mockTeamsAndResultsContext.addResult.mockResolvedValue({ ok: true });
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
        
            await waitFor(() => {
                fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
                expect(screen.getByLabelText(/Deporte:/i)).toHaveValue('Fútbol-7');
            });
            fireEvent.blur(screen.getByLabelText(/Deporte:/i));
        
            await waitFor(() => {
                fireEvent.change(screen.getByRole('combobox', { name: "Equipo local:" }), { target: { value: 'Team 1' } });
                expect(screen.getByRole('combobox', { name: "Equipo local:" })).toHaveValue('Team 1');
            });
            fireEvent.blur(screen.getByRole('combobox', { name: "Equipo local:" }));
        
            await waitFor(() => {
                fireEvent.change(screen.getByRole('combobox', { name: "Equipo visitante:" }), { target: { value: 'Team 2' } });
                expect(screen.getByRole('combobox', { name: "Equipo visitante:" })).toHaveValue('Team 2');
            });
            fireEvent.blur(screen.getByRole('combobox', { name: "Equipo visitante:" }));
        
            fireEvent.change(screen.getByLabelText(/Fecha:/i), { target: { value: '2024-07-21' } });
            fireEvent.change(screen.getByLabelText(/Hora:/i), { target: { value: '11:00' } });
            fireEvent.change(screen.getByLabelText(/Lugar:/i), { target: { value: 'Campo B' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
        
            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Resultado añadido correctamente');
            });
        });

        it("shows generic error toast if addResult throws error", async () => {
            mockTeamsAndResultsContext.addResult.mockRejectedValue(new Error("Add result failed"));
            render(<AdminModalResults closeModal={mockCloseModal} isNewResult={true} />);
        
            await waitFor(() => {
                fireEvent.change(screen.getByLabelText(/Deporte:/i), { target: { value: 'Fútbol-7' } });
                expect(screen.getByLabelText(/Deporte:/i)).toHaveValue('Fútbol-7');
            });
            fireEvent.blur(screen.getByLabelText(/Deporte:/i));
        
            await waitFor(() => {
                fireEvent.change(screen.getByRole('combobox', { name: "Equipo local:" }), { target: { value: 'Team 1' } });
                expect(screen.getByRole('combobox', { name: "Equipo local:" })).toHaveValue('Team 1');
            });
            fireEvent.blur(screen.getByRole('combobox', { name: "Equipo local:" }));
        
            await waitFor(() => {
                fireEvent.change(screen.getByRole('combobox', { name: "Equipo visitante:" }), { target: { value: 'Team 2' } });
                expect(screen.getByRole('combobox', { name: "Equipo visitante:" })).toHaveValue('Team 2');
            });
            fireEvent.blur(screen.getByRole('combobox', { name: "Equipo visitante:" }));
        
            fireEvent.change(screen.getByLabelText(/Fecha:/i), { target: { value: '2024-07-21' } });
            fireEvent.change(screen.getByLabelText(/Hora:/i), { target: { value: '11:00' } });
            fireEvent.change(screen.getByLabelText(/Lugar:/i), { target: { value: 'Campo B' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Ocurrió un error al procesar la solicitud.');
            });
        });

        it("shows generic error toast if updateResult throws error", async () => {
            mockTeamsAndResultsContext.updateResult.mockRejectedValue(new Error("Update result failed"));
            render(<AdminModalResults
                closeModal={mockCloseModal}
                isNewResult={false}
                popupData={{
                    _id: 'someResultId',
                    sport: 'Fútbol-7',
                    round: 1,
                    localTeam: 'Team 1',
                    localGoals: 2,
                    visitorTeam: 'Team 2',
                    visitorGoals: 1,
                    date: '2024-07-21',
                    hour: '11:00',
                    place: 'Campo B'
                }}
            />);

            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Ocurrió un error al procesar la solicitud.');
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
});