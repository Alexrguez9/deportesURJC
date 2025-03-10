import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminReservations from "./AdminReservations";
import { useAuth } from "../../../../context/AuthContext";
import { useFacilitiesAndReservations } from "../../../../context/FacilitiesAndReservationsContext";
import { mockAuthContext, mockFacilitiesAndReservationsContext } from "../../../../utils/mocks";
import{ toast } from 'sonner';

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

describe("AdminReservations Component", () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
        useFacilitiesAndReservations.mockReturnValue(mockFacilitiesAndReservationsContext);
        require("react-router-dom").useNavigate.mockReturnValue(mockNavigate);

        mockAuthContext.isAdmin.mockReturnValue(true);
        mockAuthContext.user = { name: "Admin" };
        mockFacilitiesAndReservationsContext.getAllReservations.mockClear();
        mockFacilitiesAndReservationsContext.deleteReservation.mockClear();
        toast.success.mockClear();
        toast.error.mockClear();

        const mockReservationsData = [
            {
                _id: "001",
                userId: "user1",
                instalacionId: "instalacion1",
                fechaInicio: '2024-01-01T10:00:00.000Z',
                fechaFin: '2024-01-01T11:00:00.000Z',
                precioTotal: 50,
            },
            {
                _id: "002",
                userId: "user2",
                instalacionId: "instalacion2",
                fechaInicio: '2024-01-02T13:00:00.000Z',
                fechaFin: '2024-01-02T14:00:00.000Z',
                precioTotal: 100,
            },
        ];
        mockFacilitiesAndReservationsContext.getAllReservations.mockResolvedValue(mockReservationsData);
    });

    it("renders correctly and fetches reservations on admin login", async () => {
        render(<AdminReservations />);

        expect(screen.getByText("Reservas")).toBeInTheDocument();
        expect(mockFacilitiesAndReservationsContext.getAllReservations).toHaveBeenCalled();
        await waitFor(() => expect(screen.getByText("user1")).toBeInTheDocument());
        expect(screen.getByText("instalacion1")).toBeInTheDocument();
    });

    it("shows loading spinner while fetching reservations", async () => {
        mockFacilitiesAndReservationsContext.getAllReservations.mockImplementationOnce(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(mockFacilitiesAndReservationsContext.reservas);
                }, 50);
            });
        });

        render(<AdminReservations />);
        expect(document.querySelector(".spinner")).toBeInTheDocument();
        await waitFor(() => expect(document.querySelector(".spinner")).not.toBeInTheDocument(), { timeout: 100 });
        expect(screen.getByText("Reservas")).toBeInTheDocument();
    });


    it("opens modal to add a new reservation", () => {
        render(<AdminReservations />);
        const addButton = document.querySelector(".iconPlus");
        fireEvent.click(addButton);

        expect(screen.getByText("Nueva reserva")).toBeInTheDocument();
    });

    it("opens modal to edit a reservation", async () => {
        render(<AdminReservations />);

        await waitFor(() => expect(screen.getByText("user1")).toBeInTheDocument());
        const editButton = document.querySelector(".editPencil");
        fireEvent.click(editButton);
        expect(screen.getByText("Editar reserva")).toBeInTheDocument();
    });

    it("closes modal and refetches reservations", async () => {
        render(<AdminReservations />);
        fireEvent.click(document.querySelector(".iconPlus"));

        expect(screen.getByText("Nueva reserva")).toBeInTheDocument();

        const closeButton = document.querySelector("#close-menu");
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText("Nueva reserva")).not.toBeInTheDocument();
            expect(mockFacilitiesAndReservationsContext.getAllReservations).toHaveBeenCalledTimes(2);
        });
    });


    it("deletes a reservation and refetches reservations and shows success toast", async () => {
        mockFacilitiesAndReservationsContext.deleteReservation.mockResolvedValue({ ok: true });
        render(<AdminReservations />);
        await waitFor(() => expect(screen.getByText("user1")).toBeInTheDocument());
        const deleteButtons = document.querySelectorAll(".deleteTrash");
        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);

        expect(mockFacilitiesAndReservationsContext.deleteReservation).toHaveBeenCalledWith("001");
        await waitFor(() => expect(mockFacilitiesAndReservationsContext.getAllReservations).toHaveBeenCalledTimes(2)); // Initial fetch + fetch on delete
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith("Reserva eliminada correctamente");
        });
    });

    it("shows error toast when deleting a reservation fails", async () => {
        mockFacilitiesAndReservationsContext.deleteReservation.mockRejectedValue(new Error("Delete error"));
        render(<AdminReservations />);
        await waitFor(() => expect(screen.getByText("user1")).toBeInTheDocument());
        const deleteButtons = document.querySelectorAll(".deleteTrash");
        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);

        expect(mockFacilitiesAndReservationsContext.deleteReservation).toHaveBeenCalledWith("001");
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Error al eliminar reserva.");
        });
    });

    it("navigates to user profile when clicking user icon", async () => {
        render(<AdminReservations />);
        await waitFor(() => expect(screen.getByText("user1")).toBeInTheDocument());
        const userButtons = document.querySelectorAll(".infoButton");
        const userButton = userButtons[0];
        fireEvent.click(userButton);

        expect(mockNavigate).toHaveBeenCalledWith("/admin-panel/admin-usuarios/user1");
    });

    it("shows AccessDenied if user is not an admin", () => {
        mockAuthContext.isAdmin.mockReturnValue(false);
        useAuth.mockReturnValue(mockAuthContext);

        render(<AdminReservations />);
        const heading = screen.getByRole("heading", { level: 1, name: "Acceso denegado" });

        expect(heading).toBeInTheDocument();
        expect(screen.queryByText("Reservas")).not.toBeInTheDocument(); // Ensure reservations table is not rendered
    });

    it("renders BackButton component", () => {
        render(<AdminReservations />);
        expect(screen.getByRole('button', { name: /Volver/i })).toBeInTheDocument();
    });

    it("displays reservation data in table rows", async () => {
        render(<AdminReservations />);
        await waitFor(() => expect(screen.getByText("user1")).toBeInTheDocument());
        expect(screen.getByText("user1")).toBeInTheDocument();
        expect(screen.getByText("instalacion1")).toBeInTheDocument();
        expect(screen.getByText("2024-01-01 10:00")).toBeInTheDocument();
        expect(screen.getByText("2024-01-01 11:00")).toBeInTheDocument();
        expect(screen.getByText("50 €")).toBeInTheDocument();

        expect(screen.getByText("user2")).toBeInTheDocument();
        expect(screen.getByText("instalacion2")).toBeInTheDocument();
        expect(screen.getByText("2024-01-02 13:00")).toBeInTheDocument();
        expect(screen.getByText("2024-01-02 14:00")).toBeInTheDocument();
        expect(screen.getByText("100 €")).toBeInTheDocument();
    });

    it("calls fetchReservations only once on initial render for admin users", () => {
        render(<AdminReservations />);
        expect(mockFacilitiesAndReservationsContext.getAllReservations).toHaveBeenCalledTimes(1);
    });

    it("does not fetch reservations if user is not admin", () => {
        mockAuthContext.isAdmin.mockReturnValue(false);
        useAuth.mockReturnValue(mockAuthContext);
        render(<AdminReservations />);
        expect(mockFacilitiesAndReservationsContext.getAllReservations).not.toHaveBeenCalled();
    });

    it("handles error when fetching reservations fails", async () => {
        mockFacilitiesAndReservationsContext.getAllReservations.mockRejectedValue(new Error("Failed to fetch"));
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<AdminReservations />);
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error al obtener las reservas:", expect.any(Error));
        });
        consoleErrorSpy.mockRestore();
    });
});