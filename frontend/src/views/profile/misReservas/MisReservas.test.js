import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MisReservas from "./MisReservas";
import { useAuth } from '../../../context/AuthContext';
import { useFacilitiesAndReservations } from '../../../context/FacilitiesAndReservationsContext';
import { mockAuthContext, mockFacilitiesAndReservationsContext } from "../../../utils/mocks";
import { toast } from 'sonner';

jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

jest.mock("../../../context/FacilitiesAndReservationsContext", () => ({
    useFacilitiesAndReservations: jest.fn()
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe("MisReservas Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
        useFacilitiesAndReservations.mockReturnValue(mockFacilitiesAndReservationsContext);
        mockAuthContext.user = { _id: '123', name: 'Test User' };
        mockFacilitiesAndReservationsContext.instalaciones = [{ _id: '1', nombre: 'Gimnasio' }, { _id: '2', nombre: 'Pista Atletismo' }];
        mockFacilitiesAndReservationsContext.getAllReservations.mockResolvedValue([
            { _id: 'res1', userId: '123', instalacionId: '1', fechaInicio: new Date('2024-07-15T10:00:00.000Z'), fechaFin: new Date('2024-07-15T11:00:00.000Z'), precioTotal: 15 },
            { _id: 'res2', userId: '123', instalacionId: '2', fechaInicio: new Date('2024-07-20T15:00:00.000Z'), fechaFin: new Date('2024-07-20T16:00:00.000Z'), precioTotal: 20 }
        ]);
        mockFacilitiesAndReservationsContext.deleteReservation = jest.fn().mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            return { status: 200 };
        });
    });

    it("renders component with reservations table when user is logged in and has reservations", async () => {
        render(<MisReservas />);
        await waitFor(() => {
            expect(screen.getByRole("heading", { name: /mis reservas/i })).toBeInTheDocument();
            expect(screen.getByRole("cell", { name: /gimnasio/i })).toBeInTheDocument();
            expect(screen.getByRole("cell", { name: /pista atletismo/i })).toBeInTheDocument();
            const deleteButtons = screen.getAllByRole("button", { name: /eliminar reserva/i });
            expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
            expect(deleteButtons[0]).toBeInTheDocument();
            expect(deleteButtons[1]).toBeInTheDocument();
        });
    });

    it("renders 'No tienes reservas.' message when user is logged in but has no reservations", async () => {
        mockFacilitiesAndReservationsContext.getAllReservations.mockResolvedValue([]);
        render(<MisReservas />);
        await waitFor(() => {
            expect(screen.getByText(/no tienes reservas./i)).toBeInTheDocument();
            expect(screen.queryByRole("table")).not.toBeInTheDocument();
        });
    });

    it("renders 'Inicia sesión para acceder a tus reservas' message when user is not logged in", async () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);
        render(<MisReservas />);
        await waitFor(() => {
            expect(screen.getByText(/inicia sesión para acceder a tus reservas/i)).toBeInTheDocument();
            expect(screen.queryByRole("table")).not.toBeInTheDocument();
            expect(screen.queryByText(/no tienes reservas./i)).not.toBeInTheDocument();
        });
    });

    it("calls deleteReservation and refetches reservations when 'Eliminar reserva' button is clicked", async () => {
        render(<MisReservas />);
        let deleteButtons;
        await waitFor(() => {
            deleteButtons = screen.getAllByRole("button", { name: /eliminar reserva/i });
            expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
        });

        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockFacilitiesAndReservationsContext.deleteReservation).toHaveBeenCalledWith('res1');
            expect(mockFacilitiesAndReservationsContext.getAllReservations).toHaveBeenCalledTimes(2);
        });
    });

    it("updates reservation list after successful deletion", async () => {
        mockFacilitiesAndReservationsContext.getAllReservations.mockResolvedValue([
            { _id: 'res2', userId: '123', instalacionId: '2', fechaInicio: new Date('2024-07-20T15:00:00.000Z'), fechaFin: new Date('2024-07-20T16:00:00.000Z'), precioTotal: 20 }
        ]);
        render(<MisReservas />);
        let deleteButtons;
        await waitFor(() => {
            deleteButtons = screen.getAllByRole("button", { name: /eliminar reserva/i });
            expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
        });

        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByRole("cell", { name: /gimnasio/i })).not.toBeInTheDocument();
            expect(screen.getByRole("cell", { name: /pista atletismo/i })).toBeInTheDocument();
        });
    });

    it("handles deleteReservation failure gracefully and shows error message", async () => {
        mockFacilitiesAndReservationsContext.deleteReservation.mockRejectedValue(new Error("Delete error"));
        render(<MisReservas />);
        let deleteButtons;
        await waitFor(() => {
            deleteButtons = screen.getAllByRole("button", { name: /eliminar reserva/i });
            expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
        });

        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockFacilitiesAndReservationsContext.deleteReservation).toHaveBeenCalledWith('res1');
            expect(toast.error).toHaveBeenCalledWith('Error al eliminar la reserva. Inténtalo de nuevo.');
        });
    });

    it("shows success message when reservation is successfully deleted", async () => {
        render(<MisReservas />);
        let deleteButtons;
        await waitFor(() => {
            deleteButtons = screen.getAllByRole("button", { name: /eliminar reserva/i });
            expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
        });

        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockFacilitiesAndReservationsContext.deleteReservation).toHaveBeenCalledWith('res1');
            expect(toast.success).toHaveBeenCalledWith('Reserva eliminada correctamente');
        });
    });

    it("shows error message when deleteReservation returns status other than 200", async () => {
        mockFacilitiesAndReservationsContext.deleteReservation = jest.fn().mockResolvedValue({ status: 400 }); // Mock fallo en deleteReservation
        render(<MisReservas />);
        let deleteButtons;
        await waitFor(() => {
            deleteButtons = screen.getAllByRole("button", { name: /eliminar reserva/i });
            expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
        });

        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockFacilitiesAndReservationsContext.deleteReservation).toHaveBeenCalledWith('res1');
            expect(toast.error).toHaveBeenCalledWith('Error al eliminar la reserva. Inténtalo de nuevo.'); // Verifica que se muestra el toast de error
        });
    });
});