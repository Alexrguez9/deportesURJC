import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ConsultarPerfil from "./ConsultarPerfil";
import { useAuth } from "../../../context/AuthContext";
import { useFacilitiesAndReservations } from "../../../context/FacilitiesAndReservationsContext";
import { mockAuthContext, mockFacilitiesAndReservationsContext } from "../../../utils/mocks";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn()
}));

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


describe("ConsultarPerfil Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
        useFacilitiesAndReservations.mockReturnValue(mockFacilitiesAndReservationsContext);
        mockAuthContext.user = { _id: "123", name: "Test User", email: "test@example.com", saldo: 10 };
        mockAuthContext.logout.mockResolvedValue(true);
        mockAuthContext.deleteUser.mockResolvedValue({ status: 200 });
        mockAuthContext.updateUser.mockResolvedValue({ status: 200, data: { message: 'Profile updated' } });
        mockFacilitiesAndReservationsContext.reservas = [];
        mockFacilitiesAndReservationsContext.deleteReservation.mockResolvedValue({ status: 200 });
    });

    it("renders component with user data", () => {
        render(<ConsultarPerfil />);
        expect(screen.getByRole("heading", { name: /mi cuenta/i })).toBeInTheDocument();
        expect(screen.getByText(/nombre: test user/i)).toBeInTheDocument();
        expect(screen.getByText(/email: test@example.com/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /editar perfil/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /eliminar cuenta/i })).toBeInTheDocument();
    });

    it("shows edit profile form when 'Editar perfil' button is clicked", () => {
        render(<ConsultarPerfil />);
        const editButton = screen.getByRole("button", { name: /editar perfil/i });
        fireEvent.click(editButton);
        expect(screen.getByLabelText(/nuevo nombre:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/nueva contraseña:/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /cancelar/i, exact: false })).toBeInTheDocument();
    });

    it("updates updatedName state on name input change in edit mode", async () => {
        render(<ConsultarPerfil />);
        const editButton = screen.getByRole("button", { name: /editar perfil/i });
        fireEvent.click(editButton);
        const nameInput = screen.getByLabelText(/nuevo nombre:/i);
        fireEvent.change(nameInput, { target: { value: 'New Name' } });
        expect(nameInput.value).toBe("New Name");
    });

    it("updates updatedPassword state on password input change in edit mode", async () => {
        render(<ConsultarPerfil />);
        const editButton = screen.getByRole("button", { name: /editar perfil/i });
        fireEvent.click(editButton);
        const passwordInput = screen.getByLabelText(/nueva contraseña:/i);
        fireEvent.change(passwordInput, { target: { value: 'newPass123' } });
        expect(passwordInput.value).toBe("newPass123");
    });

    it("calls updateUser and shows success message on valid edit form submission", async () => {
        render(<ConsultarPerfil />);
        const editButton = screen.getByRole("button", { name: /editar perfil/i });
        fireEvent.click(editButton);
        const nameInput = screen.getByLabelText(/nuevo nombre:/i);
        const passwordInput = screen.getByLabelText(/nueva contraseña:/i);
        fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
        fireEvent.change(passwordInput, { target: { value: 'updatedPass' } });
        const saveButton = screen.getByRole("button", { name: /guardar cambios/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith("123", { name: 'Updated Name', password: 'updatedPass' });
            expect(toast.success).toHaveBeenCalledWith("Perfil actualizado con éxito.");
        });
    });

    it("shows error message if name or password are empty on edit form submission", async () => {
        render(<ConsultarPerfil />);
        const editButton = screen.getByRole("button", { name: /editar perfil/i });
        fireEvent.click(editButton);
        const saveButton = screen.getByRole("button", { name: /guardar cambios/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("El nombre y la contraseña no pueden estar vacíos.");
            expect(mockAuthContext.updateUser).not.toHaveBeenCalled();
        });
    });

    it("shows error message on updateUser failure", async () => {
        mockAuthContext.updateUser.mockRejectedValue(new Error("Update error"));
        render(<ConsultarPerfil />);
        const editButton = screen.getByRole("button", { name: /editar perfil/i });
        fireEvent.click(editButton);
        const nameInput = screen.getByLabelText(/nuevo nombre:/i);
        const passwordInput = screen.getByLabelText(/nueva contraseña:/i);
        fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
        fireEvent.change(passwordInput, { target: { value: 'updatedPass' } });
        const saveButton = screen.getByRole("button", { name: /guardar cambios/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Hubo un error al actualizar tu perfil. Inténtalo de nuevo.");
        });
    });

    it("cancels edit mode and clears error message when 'Cancelar' button is clicked", async () => {
        render(<ConsultarPerfil />);
        const editButton = screen.getByRole("button", { name: /editar perfil/i });
        fireEvent.click(editButton);
        const nameInput = screen.getByLabelText(/nuevo nombre:/i);
        fireEvent.change(nameInput, { target: { value: '' } }); // Simulate error condition
        const cancelButton = screen.getByRole("button", { name: /cancelar/i, exact: false });
        fireEvent.click(cancelButton);

        expect(screen.queryByLabelText(/nuevo nombre:/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/nueva contraseña:/i)).not.toBeInTheDocument();
        expect(toast.error).not.toHaveBeenCalled();
    });

    it("calls logout and navigates to home page when 'Cerrar sesión' button is clicked", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);
        render(<ConsultarPerfil />);
        const logoutButton = screen.getByRole("button", { name: /cerrar sesión/i });
        fireEvent.click(logoutButton);

        expect(mockAuthContext.logout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("shows delete confirmation popup when 'Eliminar cuenta' button is clicked", () => {
        render(<ConsultarPerfil />);
        const deleteAccountButton = screen.getByRole("button", { name: /eliminar cuenta/i });
        fireEvent.click(deleteAccountButton);
        expect(screen.getByRole("heading", { name: /confirmar eliminación de cuenta/i })).toBeInTheDocument();
        expect(screen.getByText(/¿estás seguro de que quieres eliminar tu cuenta de forma permanente?/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /eliminar definitivamente/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /cancelar/i, exact: true })).toBeInTheDocument();
    });

    it("closes delete confirmation popup when 'Cancelar' button in popup is clicked", () => {
        render(<ConsultarPerfil />);
        const deleteAccountButton = screen.getByRole("button", { name: /eliminar cuenta/i });
        fireEvent.click(deleteAccountButton);
        const cancelButton = screen.getByRole("button", { name: /cancelar/i, exact: true });
        fireEvent.click(cancelButton);
        expect(screen.queryByRole("heading", { name: /confirmar eliminación de cuenta/i })).not.toBeInTheDocument();
    });

    it("calls deleteUser, deleteReservation for user's reservations and navigates to home page on confirm delete", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);
        mockFacilitiesAndReservationsContext.reservas = [{ _id: 'res1', userId: '123' }, { _id: 'res2', userId: '123' }];
        useFacilitiesAndReservations.mockReturnValue(mockFacilitiesAndReservationsContext);
        render(<ConsultarPerfil />);
        const deleteAccountButton = screen.getByRole("button", { name: /eliminar cuenta/i });
        fireEvent.click(deleteAccountButton);
        const confirmDeleteButton = screen.getByRole("button", { name: /eliminar definitivamente/i });
        fireEvent.click(confirmDeleteButton);

        await waitFor(() => {
            expect(mockFacilitiesAndReservationsContext.deleteReservation).toHaveBeenCalledTimes(2);
            expect(mockFacilitiesAndReservationsContext.deleteReservation).toHaveBeenCalledWith('res1');
            expect(mockFacilitiesAndReservationsContext.deleteReservation).toHaveBeenCalledWith('res2');
            expect(mockAuthContext.deleteUser).toHaveBeenCalledWith("123");
            expect(mockNavigate).toHaveBeenCalledWith("/");
            expect(toast.success).toHaveBeenCalledWith('Cuenta eliminada con éxito.');
        });
    });

    it("handles account deletion even if user has no reservations", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);
        mockFacilitiesAndReservationsContext.reservas = [];
        useFacilitiesAndReservations.mockReturnValue(mockFacilitiesAndReservationsContext);
        render(<ConsultarPerfil />);
        const deleteAccountButton = screen.getByRole("button", { name: /eliminar cuenta/i });
        fireEvent.click(deleteAccountButton);
        const confirmDeleteButton = screen.getByRole("button", { name: /eliminar definitivamente/i });
        fireEvent.click(confirmDeleteButton);

        await waitFor(() => {
            expect(mockFacilitiesAndReservationsContext.deleteReservation).not.toHaveBeenCalled();
            expect(mockAuthContext.deleteUser).toHaveBeenCalledWith("123");
            expect(mockNavigate).toHaveBeenCalledWith("/");
            expect(toast.success).toHaveBeenCalledWith('Cuenta eliminada con éxito.');
        });
    });

    it("renders component without user data if user is null", () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);
        render(<ConsultarPerfil />);
        expect(screen.queryByRole("heading", { name: /mi cuenta/i })).toBeInTheDocument();
        expect(screen.queryByText(/^Nombre:$/i)).toBeInTheDocument();
        expect(screen.queryByText(/^Email:$/i)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /editar perfil/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /cerrar sesión/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /eliminar cuenta/i })).not.toBeInTheDocument();
    });

    it("shows error message on deleteUser failure", async () => {
        mockAuthContext.deleteUser.mockResolvedValue({ status: 500 }); // Simula fallo en deleteUser
        render(<ConsultarPerfil />);
        const deleteAccountButton = screen.getByRole("button", { name: /eliminar cuenta/i });
        fireEvent.click(deleteAccountButton);
        const confirmDeleteButton = screen.getByRole("button", { name: /eliminar definitivamente/i });
        fireEvent.click(confirmDeleteButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Ha ocurrido un error al eliminar tu cuenta. Inténtalo de nuevo.');
        });
    });
});