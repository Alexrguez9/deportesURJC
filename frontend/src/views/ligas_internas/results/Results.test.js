import {
    render,
    screen,
    waitFor,
    fireEvent
} from "@testing-library/react";
import Results from "./Results";
import { BrowserRouter } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useTeamsAndResults } from "../../../context/TeamsAndResultsContext";
import { mockAuthContext, mockTeamsAndResultsContext } from "../../../utils/mocks";
import * as sonner from 'sonner';

jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

jest.mock("../../../context/TeamsAndResultsContext", () => ({
    useTeamsAndResults: jest.fn()
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe("Results Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
        sonner.toast.success.mockClear();
        sonner.toast.error.mockClear();
    });

    it("renders Results component", () => {
        render(
            <BrowserRouter>
                <Results />
            </BrowserRouter>
        );
        expect(screen.getByRole('heading', { name: /encuentros/i })).toBeInTheDocument();
    });

    it("displays welcome message for non-admin users", () => {
        mockAuthContext.isAdmin.mockReturnValue(false);
        render(
            <BrowserRouter>
                <Results />
            </BrowserRouter>
        );
        expect(screen.getByText(/Bienvenido a la página de Encuentros/i)).toBeInTheDocument();
    });

    it("displays admin instructions for admin users", () => {
        mockAuthContext.isAdmin.mockReturnValue(true);
        render(
            <BrowserRouter>
                <Results />
            </BrowserRouter>
        );
        expect(screen.getByText(/Aquí puedes administrar los Encuentros/i)).toBeInTheDocument();
    });

    it('renders the th Acciones for admin users', () => {
        mockAuthContext.isAdmin.mockReturnValue(true);
        render(
            <BrowserRouter>
                <Results />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Fútbol-7' } });
        expect(screen.getByRole('columnheader', { name: /acciones/i })).toBeInTheDocument();
    });

    it("renders the 'add' button for admin users", () => {
        mockAuthContext.user = { _id: "123", email: "test@admin.es", role: "admin" };
        mockAuthContext.isAdmin.mockReturnValue(true);
        render(
            <BrowserRouter>
                <Results />
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
                <Results />
            </BrowserRouter>
        );
        const topButtonsContent = document.querySelector('.top-buttons-content');
        const addButton = topButtonsContent.querySelector('.iconPlus');
        expect(addButton).not.toBeInTheDocument();
    });

    it("shows message to select a sport when none is selected", () => {
        render(
            <BrowserRouter>
                <Results />
            </BrowserRouter>
        );
        expect(screen.getByText(/Selecciona un deporte para ver sus resultados/i)).toBeInTheDocument();
    });

    it("renders correct options in select", () => {
        render(
            <BrowserRouter>
                <Results />
            </BrowserRouter>
        );
        const select = screen.getByRole("combobox");
        const options = screen.getAllByRole("option").map(o => o.textContent);
        expect(options).toEqual([
            "Elige un deporte",
            "Fútbol-7",
            "Fútbol-sala",
            "Básket 3x3",
            "Voleibol"
        ]);
    });

    it("renders no results message when sport is selected but no results exist", async () => {
        mockTeamsAndResultsContext.results = [];
        render(
            <BrowserRouter>
                <Results />
            </BrowserRouter>
        );
        const select = screen.getByRole("combobox");
        fireEvent.change(select, { target: { value: "Fútbol-7" } });
    
        await waitFor(() => {
            expect(screen.getByText(/No hay resultados de Fútbol-7 para mostrar/i)).toBeInTheDocument();
        });
    });
//
    it("renders results table when results are available", async () => {
        mockTeamsAndResultsContext.results = [
            { _id: '1', round: 1, localGoals: 2, visitorGoals: 1, sport: 'Fútbol-sala', localTeam: 'Local Team', visitorTeam: 'Visitor Team' },
            { _id: '1', round: 1, localGoals: 2, visitorGoals: 1, sport: 'Fútbol-7', localTeam: 'F7 local', visitorTeam: 'F7 visitor' },
        ];
        render(
            <BrowserRouter>
                <Results />
            </BrowserRouter>
        );
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Fútbol-7' } });

        await waitFor(() => {
            expect(screen.getByRole('table')).toBeInTheDocument();
        });
    });

    it("filters results by sport", async () => {
        mockTeamsAndResultsContext.results = [
            { _id: '1', round: 1, localGoals: 2, visitorGoals: 1, sport: 'Fútbol-sala', localTeam: 'Local Team', visitorTeam: 'Visitor Team' },
            { _id: '1', round: 1, localGoals: 2, visitorGoals: 1, sport: 'Fútbol-7', localTeam: 'F7 local', visitorTeam: 'F7 visitor' },
        ];
        mockTeamsAndResultsContext.fetchResults.mockResolvedValue(mockTeamsAndResultsContext.results);
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
        render(
            <BrowserRouter>
                <Results />
            </BrowserRouter>
        );
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Fútbol-sala' } });
        await waitFor(() => {
            expect(screen.getByText('Local Team')).toBeInTheDocument();
            expect(screen.queryByText('F7 local')).not.toBeInTheDocument();
        });
    });

    it("displays results sorted by round", async () => {
        mockTeamsAndResultsContext.results = [
            { _id: '1', round: 2, sport: 'Fútbol-7', localGoals: 1, visitorGoals: 1, localTeam: 'A', visitorTeam: 'B', date: new Date(), place: 'Cancha 1' },
            { _id: '2', round: 1, sport: 'Fútbol-7', localGoals: 3, visitorGoals: 2, localTeam: 'C', visitorTeam: 'D', date: new Date(), place: 'Cancha 2' },
        ];
        render(
            <BrowserRouter>
                <Results />
            </BrowserRouter>
        );
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "Fútbol-7" } });
    
        await waitFor(() => {
            const rows = screen.getAllByRole("row").slice(1); // skip header
            const rounds = rows.map(row => row.firstChild.textContent);
            expect(rounds).toEqual(['1', '2']);
        });
    });

    it("opens the modal when 'add' button is clicked by admin", async () => {
        mockAuthContext.isAdmin.mockReturnValue(true);
        mockTeamsAndResultsContext.results = [{ _id: '1', round: 1, localGoals: 2, visitorGoals: 1, sport: 'Fútbol-7', localTeam: 'Local Team', visitorTeam: 'Visitor Team' }]; // Added team names
        mockTeamsAndResultsContext.fetchResults.mockResolvedValue(mockTeamsAndResultsContext.results);
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <Results />
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
        mockTeamsAndResultsContext.results = [{ _id: '1', round: 1, localGoals: 2, visitorGoals: 1, sport: 'Fútbol-7', localTeam: 'Local Team', visitorTeam: 'Visitor Team' }];
        mockTeamsAndResultsContext.fetchResults.mockResolvedValue(mockTeamsAndResultsContext.results);
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <Results />
            </BrowserRouter>
        );
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Fútbol-7' } });

        await waitFor(() => {
        const editButton = document.querySelector('.editPencil');
        fireEvent.click(editButton);
        });
        await waitFor(() => {
            expect(mockTeamsAndResultsContext.fetchResults).toHaveBeenCalledTimes(1);
        });
    });

    describe("Delete Result Functionality", () => {
        it("calls deleteResult function and shows success toast on successful deletion", async () => {
            mockAuthContext.isAdmin.mockReturnValue(true);
            mockTeamsAndResultsContext.deleteResult.mockResolvedValue({ ok: true });
            mockTeamsAndResultsContext.results = [{ _id: '1', round: 1, localGoals: 2, visitorGoals: 1, sport: 'Fútbol-7', localTeam: 'Local Team', visitorTeam: 'Visitor Team' }];
            mockTeamsAndResultsContext.fetchResults.mockResolvedValue(mockTeamsAndResultsContext.results);
            useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
            useAuth.mockReturnValue(mockAuthContext);

            render(
                <BrowserRouter>
                    <Results />
                </BrowserRouter>
            );
            fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Fútbol-7' } });

            await waitFor(() => expect(screen.getByText('Local Team')).toBeInTheDocument());
            const deleteButton = document.querySelector('.deleteTrash');
            fireEvent.click(deleteButton);

            await waitFor(async () => {
                expect(mockTeamsAndResultsContext.deleteResult).toHaveBeenCalledTimes(1);
                expect(mockTeamsAndResultsContext.deleteResult).toHaveBeenCalledWith('1');
            });
            await waitFor(() => {
                expect(sonner.toast.success).toHaveBeenCalledWith("Resultado eliminado correctamente");
            });
        });

        it("shows error toast if deleteResult API call fails", async () => {
            mockAuthContext.isAdmin.mockReturnValue(true);
            mockTeamsAndResultsContext.deleteResult.mockResolvedValue({ ok: false });
            mockTeamsAndResultsContext.results = [{ _id: '1', round: 1, localGoals: 2, visitorGoals: 1, sport: 'Fútbol-7', localTeam: 'Local Team', visitorTeam: 'Visitor Team' }];
            mockTeamsAndResultsContext.fetchResults.mockResolvedValue(mockTeamsAndResultsContext.results);
            useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
            useAuth.mockReturnValue(mockAuthContext);

            render(
                <BrowserRouter>
                    <Results />
                </BrowserRouter>
            );

            fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Fútbol-7' } });

            await waitFor(() => expect(screen.getByText('Local Team')).toBeInTheDocument());
            const deleteButton = document.querySelector('.deleteTrash');
            fireEvent.click(deleteButton);

            await waitFor(async () => {
                expect(mockTeamsAndResultsContext.deleteResult).toHaveBeenCalledTimes(1);
                expect(mockTeamsAndResultsContext.deleteResult).toHaveBeenCalledWith('1');
            });
            await waitFor(() => {
                expect(sonner.toast.error).toHaveBeenCalledWith("Error al eliminar el resultado.");
            });
        });

        it("shows generic error toast if deleteResult throws error", async () => {
            mockAuthContext.isAdmin.mockReturnValue(true);
            mockTeamsAndResultsContext.deleteResult.mockRejectedValue(new Error("Delete failed"));
            mockTeamsAndResultsContext.results = [{ _id: '1', round: 1, localGoals: 2, visitorGoals: 1, sport: 'Fútbol-7', localTeam: 'Local Team', visitorTeam: 'Visitor Team' }];
            mockTeamsAndResultsContext.fetchResults.mockResolvedValue(mockTeamsAndResultsContext.results);
            useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);
            useAuth.mockReturnValue(mockAuthContext);

            render(
                <BrowserRouter>
                    <Results />
                </BrowserRouter>
            );

            fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Fútbol-7' } });

            await waitFor(() => {
                expect(screen.getByText('Local Team')).toBeInTheDocument();
            });
            const deleteButton = document.querySelector('.deleteTrash');
            fireEvent.click(deleteButton);

            await waitFor(async () => {
                expect(mockTeamsAndResultsContext.deleteResult).toHaveBeenCalledTimes(1);
                expect(mockTeamsAndResultsContext.deleteResult).toHaveBeenCalledWith('1');
            });
            await waitFor(() => {
                expect(sonner.toast.error).toHaveBeenCalledWith("Error al eliminar el resultado.");
            });
        });
    });
});