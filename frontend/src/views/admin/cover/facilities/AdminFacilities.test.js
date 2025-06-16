import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminFacilities from "./AdminFacilities";
import { useAuth } from "../../../../context/AuthContext";
import { useFacilitiesAndReservations } from "../../../../context/FacilitiesAndReservationsContext";
import { mockAuthContext, mockFacilitiesAndReservationsContext } from "../../../../utils/mocks";
import * as sonner from 'sonner';

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

jest.mock("../../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

jest.mock("../../../../context/FacilitiesAndReservationsContext", () => ({
    useFacilitiesAndReservations: jest.fn()
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe("AdminFacilities Component", () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
        useFacilitiesAndReservations.mockReturnValue(mockFacilitiesAndReservationsContext);
        require("react-router-dom").useNavigate.mockReturnValue(mockNavigate);

        mockAuthContext.isAdmin.mockReturnValue(true);
        mockAuthContext.user = { name: "Admin" };
        mockFacilitiesAndReservationsContext.getAllFacilities.mockClear();
        mockFacilitiesAndReservationsContext.deleteFacility.mockClear();
        sonner.toast.success.mockClear();
        sonner.toast.error.mockClear();

        const mockFacilitiesData = [
            {
                _id: "facility001",
                name: "Facility 1",
                description: "Description 1",
                capacity: 10,
                priceForHalfHour: 25,
                schedule: {
                    initialHour: "2024-07-15T08:00:00.000Z",
                    endHour: "2024-07-15T22:00:00.000Z"
                }
            },
            {
                _id: "facility002",
                name: "Facility 2",
                description: "Description 2",
                capacity: 20,
                priceForHalfHour: 50,
                schedule: {
                    initialHour: "2024-07-16T07:00:00.000Z",
                    endHour: "2024-07-16T21:00:00.000Z"
                }
            },
        ];
        mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue(mockFacilitiesData);
    });

    it("renders correctly and fetches facilities on admin login", async () => {
        render(<AdminFacilities />);

        expect(screen.getByText("Instalaciones")).toBeInTheDocument();
        expect(mockFacilitiesAndReservationsContext.getAllFacilities).toHaveBeenCalled();
        await waitFor(() => expect(screen.getByText("Facility 1")).toBeInTheDocument());
        expect(screen.getByText("Description 1")).toBeInTheDocument();
        expect(screen.getByText("Horario inicio")).toBeInTheDocument();
        expect(screen.getByText("Horario fin")).toBeInTheDocument();
    });

    it("shows loading spinner while fetching facilities", async () => {
        mockFacilitiesAndReservationsContext.getAllFacilities.mockImplementationOnce(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(mockFacilitiesAndReservationsContext.facilities);
                }, 800);
            });
        });

        render(<AdminFacilities />);
        await waitFor(() => expect(document.querySelector(".spinner")).toBeInTheDocument());
        await waitFor(() => expect(document.querySelector(".spinner")).not.toBeInTheDocument(), { timeout: 1000 });
        expect(screen.getByText("Instalaciones")).toBeInTheDocument();
    });

    it("opens modal to add a new facility", () => {
        render(<AdminFacilities />);
        const addButton = document.querySelector(".iconPlus");
        fireEvent.click(addButton);

        expect(screen.getByText("Nueva instalación")).toBeInTheDocument();
    });

    it("opens modal to edit a facility", async () => {
        render(<AdminFacilities />);

        await waitFor(() => expect(screen.getByText("Facility 1")).toBeInTheDocument());
        const editButton = document.querySelector(".editPencil");
        fireEvent.click(editButton);
        expect(screen.getByText("Editar instalación")).toBeInTheDocument();
    });

    it("closes modal and refetches facilities", async () => {
        render(<AdminFacilities />);
        fireEvent.click(document.querySelector(".iconPlus"));

        expect(screen.getByText("Nueva instalación")).toBeInTheDocument();

        const closeButton = document.querySelector("#close-menu");
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText("Nueva instalación")).not.toBeInTheDocument();
            expect(mockFacilitiesAndReservationsContext.getAllFacilities).toHaveBeenCalledTimes(2);
        });
    });

    it("deletes a facility and refetches facilities and shows success toast", async () => {
        mockFacilitiesAndReservationsContext.deleteFacility.mockResolvedValue({ ok: true });
        render(<AdminFacilities />);
        await waitFor(() => expect(screen.getByText("Facility 1")).toBeInTheDocument());
        const deleteButtons = document.querySelectorAll(".deleteTrash");
        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);

        expect(mockFacilitiesAndReservationsContext.deleteFacility).toHaveBeenCalledWith("facility001");
        await waitFor(() => expect(mockFacilitiesAndReservationsContext.getAllFacilities).toHaveBeenCalledTimes(2)); // Initial fetch + fetch on delete
        await waitFor(() => {
            expect(sonner.toast.success).toHaveBeenCalledWith("Instalación eliminada correctamente");
        });
    });

    it("shows error toast if deleteFacility fails", async () => {
        mockFacilitiesAndReservationsContext.deleteFacility.mockRejectedValue(new Error("Delete facility failed"));
        render(<AdminFacilities />);
        await waitFor(() => expect(screen.getByText("Facility 1")).toBeInTheDocument());
        const deleteButtons = document.querySelectorAll(".deleteTrash");
        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(sonner.toast.error).toHaveBeenCalledWith("Error al eliminar la instalación.");
        });
    });


    it("shows AccessDenied if user is not an admin", () => {
        mockAuthContext.isAdmin.mockReturnValue(false);
        useAuth.mockReturnValue(mockAuthContext);

        render(<AdminFacilities />);
        const heading = screen.getByRole("heading", { level: 1, name: "Acceso denegado" });

        expect(heading).toBeInTheDocument();
        expect(screen.queryByText("Instalaciones")).not.toBeInTheDocument();
    });

    it("renders BackButton component", () => {
        render(<AdminFacilities />);
        expect(screen.getByRole('button', { name: /Volver/i })).toBeInTheDocument();
    });

    it("displays facility data in table rows", async () => {
        render(<AdminFacilities />);
        await waitFor(() => expect(screen.getByText("Facility 1")).toBeInTheDocument());

        expect(screen.getByText("Facility 1")).toBeInTheDocument();
        expect(screen.getByText("Description 1")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("08:00")).toBeInTheDocument(); // Local time in Spain
        expect(screen.getByText("22:00")).toBeInTheDocument();  // Local time in Spain
        expect(screen.getByText("25 €")).toBeInTheDocument();

        expect(screen.getByText("Facility 2")).toBeInTheDocument();
        expect(screen.getByText("Description 2")).toBeInTheDocument();
        expect(screen.getByText("20")).toBeInTheDocument();
        expect(screen.getByText("07:00")).toBeInTheDocument(); // Local time in Spain
        expect(screen.getByText("21:00")).toBeInTheDocument(); // Local time in Spain
        expect(screen.getByText("50 €")).toBeInTheDocument();
    });

    it("calls fetchFacilities only once on initial render for admin users", () => {
        render(<AdminFacilities />);
        expect(mockFacilitiesAndReservationsContext.getAllFacilities).toHaveBeenCalledTimes(1);
    });

    it("does not fetch facilities if user is not admin", () => {
        mockAuthContext.isAdmin.mockReturnValue(false);
        useAuth.mockReturnValue(mockAuthContext);
        render(<AdminFacilities />);
        expect(mockFacilitiesAndReservationsContext.getAllFacilities).not.toHaveBeenCalled();
    });

    it("renders the paragraph about prices being per half hour", () => {
        render(<AdminFacilities />);
        expect(screen.getByText(/Aquí puedes administrar las instalaciones disponibles en la web\./i)).toBeInTheDocument();
        // expect(screen.getByText((content) => content.includes("Aquí puedes administrar las instalaciones disponibles en la web."))).toBeInTheDocument();
        expect(screen.getByText(/Los precios son por media hora\./i)).toBeInTheDocument();
    });
});