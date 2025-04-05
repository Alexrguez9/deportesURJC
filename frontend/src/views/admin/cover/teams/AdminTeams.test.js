import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminTeams from "./AdminTeams";
import { useAuth } from "../../../../context/AuthContext";
import { useTeamsAndResults } from "../../../../context/TeamsAndResultsContext";
import { mockAuthContext, mockTeamsAndResultsContext } from "../../../../utils/mocks";
import * as sonner from 'sonner';

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

jest.mock("../../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

jest.mock("../../../../context/TeamsAndResultsContext", () => ({
    useTeamsAndResults: jest.fn()
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe("AdminTeams Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext)
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);

        mockAuthContext.isAdmin.mockReturnValue(true);
        mockAuthContext.user = { name: "Admin" };
        mockTeamsAndResultsContext.fetchTeams.mockClear();
        mockTeamsAndResultsContext.deleteTeam.mockClear();
        sonner.toast.success.mockClear();
        sonner.toast.error.mockClear();

        mockTeamsAndResultsContext.teams = [
            {
                _id: "001",
                sport: "Fútbol-7",
                name: "Equipo A",
                results: { wins: 3, losses: 1, draws: 2 },
                points: 11,
            },
            {
                _id: "002",
                sport: "Baloncesto",
                name: "Equipo B",
                results: { wins: 2, losses: 2, draws: 1 },
                points: 7,
            },
        ];
    });

    it("renders correctly and fetches teams", () => {
        render(<AdminTeams />);

        expect(screen.getByText("Equipos")).toBeInTheDocument();
        expect(mockTeamsAndResultsContext.fetchTeams).toHaveBeenCalled();
    });

    it("filters teams by sport", () => {
        render(<AdminTeams />);

        const select = screen.getByRole("combobox");
        fireEvent.change(select, { target: { value: "Fútbol-7" } });

        expect(screen.getByText("Equipo A")).toBeInTheDocument();
        expect(screen.queryByText("Equipo B")).not.toBeInTheDocument();
    });

    it("opens modal to add a new team", () => {
        render(<AdminTeams />);

        const addButton = document.querySelector(".iconPlus");
        fireEvent.click(addButton);

        expect(screen.getByText("Añadir equipo")).toBeInTheDocument();
    });

    it("opens modal to edit a team", async () => {
        render(<AdminTeams />);

        const editButton = document.querySelector(".editPencil");
        fireEvent.click(editButton);

        await waitFor(() => expect(screen.getByText("Editar equipo")).toBeInTheDocument());
    });

    it("deletes a team and shows success toast", async () => {
        mockTeamsAndResultsContext.deleteTeam.mockResolvedValue({ ok: true });
        render(<AdminTeams />);

        const deleteButtons = document.querySelectorAll(".deleteTrash");
        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);

        expect(mockTeamsAndResultsContext.deleteTeam).toHaveBeenCalledWith("001");
        await waitFor(() => {
            expect(sonner.toast.success).toHaveBeenCalledWith("Equipo eliminado correctamente");
        });
    });

    it("shows error toast if deleteTeam fails", async () => {
        mockTeamsAndResultsContext.deleteTeam.mockRejectedValue(new Error("Delete team failed"));
        render(<AdminTeams />);

        const deleteButtons = document.querySelectorAll(".deleteTrash");
        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(sonner.toast.error).toHaveBeenCalledWith("Error al eliminar el equipo.");
        });
    });

    it("shows AccessDenied if user is not an admin", () => {
        mockAuthContext.isAdmin.mockReturnValue(false);
        useAuth.mockReturnValue(mockAuthContext);

        render(<AdminTeams />);
        const heading = screen.getByRole("heading", { level: 1, name: "Acceso denegado" });

        expect(heading).toBeInTheDocument();
    });
});