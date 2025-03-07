import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminTeams from "./AdminTeams";
import { useAuth } from "../../../../context/AuthContext";
import { useTeamsAndResults } from "../../../../context/TeamsAndResultsContext";
import { mockAuthContext, mockTeamsAndResultsContext } from "../../../../utils/mocks";

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

describe("AdminTeams Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext); // Using mockAuthContext from mocks.js
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext); // Using mockTeamsAndResultsContext from mocks.js

        // Reset mocks to initial state for each test if needed.
        mockAuthContext.isAdmin.mockReturnValue(true); // Default to admin for most tests
        mockAuthContext.user = { name: "Admin" }; // Set a default user
        mockTeamsAndResultsContext.fetchTeams.mockClear(); // Clear call counts specifically if needed
        mockTeamsAndResultsContext.deleteTeam.mockClear();

        mockTeamsAndResultsContext.teams = [ // Define teams directly in mock context for each test if needed, or keep defaults.
            {
                _id: "001",
                sport: "Fútbol-7",
                name: "Equipo A",
                results: { partidos_ganados: 3, partidos_perdidos: 1, partidos_empatados: 2 },
                points: 11,
            },
            {
                _id: "002",
                sport: "Baloncesto",
                name: "Equipo B",
                results: { partidos_ganados: 2, partidos_perdidos: 2, partidos_empatados: 1 },
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

    it("deletes a team", () => {
        render(<AdminTeams />);

        const deleteButtons = document.querySelectorAll(".deleteTrash");
        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);

        expect(mockTeamsAndResultsContext.deleteTeam).toHaveBeenCalledWith("001");
    });


    it("shows AccessDenied if user is not an admin", () => {
        mockAuthContext.isAdmin.mockReturnValue(false);
        useAuth.mockReturnValue(mockAuthContext);

        render(<AdminTeams />);
        const heading = screen.getByRole("heading", { level: 1, name: "Acceso denegado" });

        expect(heading).toBeInTheDocument();
    });
});