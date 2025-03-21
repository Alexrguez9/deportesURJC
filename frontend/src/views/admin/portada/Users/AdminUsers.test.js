import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminUsers from "./AdminUsers";
import { useAuth } from "../../../../context/AuthContext";
import { mockAuthContext } from "../../../../utils/mocks";
import { useNavigate } from "react-router-dom";
import * as sonner from 'sonner'; // Import sonner to mock toast

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
    Outlet: () => <></> // Mock Outlet if used and not relevant for these tests
}));

jest.mock("../../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

jest.mock('sonner', () => ({ // Mock sonner module
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe("AdminUsers Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
        mockAuthContext.isAdmin.mockReturnValue(true); // Default to admin for most tests
        mockAuthContext.user = { name: "Admin" };
        mockAuthContext.getAllUsers.mockResolvedValue([ // Default user list
            { _id: "1", name: "User 1", email: "user1@test.com", role: "user", alta: {}, balance: 10 },
            { _id: "2", name: "Admin User", email: "admin@test.com", role: "admin", alta: {}, balance: 0 }
        ]);
        mockAuthContext.deleteUser.mockResolvedValue(true); // Mock successful delete by default
        sonner.toast.success.mockClear(); // Clear mock for success toast before each test
        sonner.toast.error.mockClear();   // Clear mock for error toast before each test
    });

    it("renders correctly for admin users and fetches users on mount", async () => {
        render(<AdminUsers />);

        expect(screen.getByRole("heading", { name: /usuarios/i })).toBeInTheDocument();
        expect(mockAuthContext.getAllUsers).toHaveBeenCalledTimes(1);
        await waitFor(() => {
            expect(screen.getByText("User 1")).toBeInTheDocument();
            expect(screen.getByText("Admin User")).toBeInTheDocument();
        });
    });

    it("displays loading spinner while fetching users", () => {
        mockAuthContext.getAllUsers.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50))); // Simulate loading
        render(<AdminUsers />);
        expect(document.querySelector(".spinner")).toBeInTheDocument();
    });

    it("opens modal to add a new user when iconPlus is clicked", () => {
        render(<AdminUsers />);
        const addButton = document.querySelector(".iconPlus");
        fireEvent.click(addButton);
        expect(screen.getByRole("heading", { name: /añadir usuario/i })).toBeInTheDocument(); // Assuming modal has this heading
    });

    it("opens modal to edit user when pencil icon is clicked", async () => {
        render(<AdminUsers />);
        await waitFor(() => {
            const editButton = document.querySelector(".editPencil");
            fireEvent.click(editButton);
            expect(screen.getByRole("heading", { name: /editar usuario/i })).toBeInTheDocument(); // Assuming modal has this heading
        });
    });

    it("calls deleteUser with correct id when delete icon is clicked", async () => {
        render(<AdminUsers />);
        await waitFor(() => {
            const deleteButtons = document.querySelectorAll(".deleteTrash");
            const deleteButton = deleteButtons[0];
            fireEvent.click(deleteButton);
            expect(mockAuthContext.deleteUser).toHaveBeenCalledWith("1");
        });
    });

    it("displays success message after successful user deletion", async () => {
        render(<AdminUsers />);
        await waitFor(() => {
            const deleteButtons = document.querySelectorAll(".deleteTrash");
            const deleteButton = deleteButtons[0];
            fireEvent.click(deleteButton);
        });
        await waitFor(() => {
            expect(sonner.toast.success).toHaveBeenCalledWith("Usuario eliminado correctamente");
        });
    });

    it("displays error message when deleteUser fails", async () => {
        mockAuthContext.deleteUser.mockRejectedValue(new Error("Delete error"));
        render(<AdminUsers />);
        await waitFor(() => {
            const deleteButtons = document.querySelectorAll(".deleteTrash");
            const deleteButton = deleteButtons[0];
            fireEvent.click(deleteButton);
        });
        await waitFor(() => {
            expect(sonner.toast.error).toHaveBeenCalledWith("Error al eliminar usuario");
        });
    });

    it("displays error message if non-admin user tries to delete", async () => {
        mockAuthContext.isAdmin.mockReturnValue(false);
        useAuth.mockReturnValue(mockAuthContext);
        render(<AdminUsers />);
        await waitFor(() => {
            const deleteButtons = document.querySelectorAll(".deleteTrash");
            expect(deleteButtons).toHaveLength(0);
        });
    });


    it("navigates to user detail page when info button is clicked", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);
        render(<AdminUsers />);

        await waitFor(() => {
            const infoButton = document.querySelector(".infoButton");
            fireEvent.click(infoButton);
            expect(mockNavigate).toHaveBeenCalledWith("/admin-panel/admin-usuarios/1");
        });
    });

    it("renders AccessDenied component if user is not admin", () => {
        mockAuthContext.isAdmin.mockReturnValue(false);
        useAuth.mockReturnValue(mockAuthContext);
        render(<AdminUsers />);
        expect(screen.getByRole("heading", { name: /acceso denegado/i })).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    describe('Altas column', () => {
        it("renders 'Sí' for gimnasio alta estado when true", async () => {
            mockAuthContext.getAllUsers.mockResolvedValue([
                { _id: "1", name: "User 1", email: "user1@test.com", role: "user", alta: { gimnasio: { estado: true } }, balance: 10 }
            ]);
            render(<AdminUsers />);
            await waitFor(() => {
                expect(screen.getByText("Sí")).toBeInTheDocument();
            });
        });

        it("renders 'No' for gimnasio alta estado when false or undefined", async () => {
            mockAuthContext.getAllUsers.mockResolvedValue([
                { _id: "1", name: "User 1", email: "user1@test.com", role: "user", alta: { gimnasio: { estado: false } }, balance: 10 },
                { _id: "2", name: "User 2", email: "user2@test.com", role: "user", alta: { gimnasio: {} }, balance: 10 },
                { _id: "3", name: "User 3", email: "user3@test.com", role: "user", alta: { gimnasio: null }, balance: 10 },
                { _id: "4", name: "User 4", email: "user4@test.com", role: "user", alta: {}, balance: 10 },
            ]);
            render(<AdminUsers />);
            await waitFor(() => {
                expect(screen.getAllByText("No").length).toBeGreaterThanOrEqual(4);
            });
        });

        it("renders 'Sí' for atletismo alta estado when true", async () => {
            mockAuthContext.getAllUsers.mockResolvedValue([
                { _id: "1", name: "User 1", email: "user1@test.com", role: "user", alta: { atletismo: { estado: true } }, balance: 10 }
            ]);
            render(<AdminUsers />);
            await waitFor(() => {
                expect(screen.getByText("Sí")).toBeInTheDocument();
            });
        });

        it("renders 'No' for atletismo alta estado when false or undefined", async () => {
            mockAuthContext.getAllUsers.mockResolvedValue([
                { _id: "1", name: "User 1", email: "user1@test.com", role: "user", alta: { atletismo: { estado: false } }, balance: 10 },
                { _id: "2", name: "User 2", email: "user2@test.com", role: "user", alta: { atletismo: {} }, balance: 10 },
                { _id: "3", name: "User 3", email: "user3@test.com", role: "user", alta: null, balance: 10 },
                { _id: "4", name: "User 4", email: "user4@test.com", role: "user", alta: {}, balance: 10 },
            ]);
            render(<AdminUsers />);
            await waitFor(() => {
                expect(screen.getAllByText("No").length).toBeGreaterThanOrEqual(4);
            });
        });
    });

    it("handles error when fetching users fails", async () => {
        const mockError = new Error("Failed to fetch users");
        mockAuthContext.getAllUsers.mockRejectedValue(mockError);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        render(<AdminUsers />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error al obtener la lista de usuarios:", mockError);
        });

        consoleErrorSpy.mockRestore();
    });
});