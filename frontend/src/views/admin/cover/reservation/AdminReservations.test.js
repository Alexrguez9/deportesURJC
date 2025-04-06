import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminReservations from "./AdminReservations";
import { useAuth } from "../../../../context/AuthContext";
import { useFacilitiesAndReservations } from "../../../../context/FacilitiesAndReservationsContext";
import { mockAuthContext, mockFacilitiesAndReservationsContext } from "../../../../utils/mocks";
import { toast } from 'sonner';

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
        mockAuthContext.user = { name: "Juan Pérez" };
        mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([
            { _id: "instalacion1", name: "Pista 1" },
            { _id: "instalacion2", name: "Pista 2" },
        ]);
        
        mockAuthContext.getAllUsers.mockResolvedValue([
            { _id: "user1", name: "Juan Pérez" },
            { _id: "user2", name: "Laura Gómez" },
        ]);
        mockFacilitiesAndReservationsContext.getAllReservations.mockClear();
        mockFacilitiesAndReservationsContext.deleteReservation.mockClear();
        toast.success.mockClear();
        toast.error.mockClear();

        const mockReservationsData = [
            {
                _id: "001",
                userId: "user1",
                facilityId: "instalacion1",
                initDate: '2024-01-01T10:00:00.000Z',
                endDate: '2024-01-01T11:00:00.000Z',
                totalPrice: 50,
                isPaid: true,
            },
            {
                _id: "002",
                userId: "user2",
                facilityId: "instalacion2",
                initDate: '2024-01-02T13:00:00.000Z',
                endDate: '2024-01-02T14:00:00.000Z',
                totalPrice: 100,
                isPaid: false,
            },
        ];
        mockFacilitiesAndReservationsContext.getAllReservations.mockResolvedValue(mockReservationsData);
    });

    it("renders correctly and fetches reservations on admin login", async () => {
        render(<AdminReservations />);

        expect(screen.getByText("Reservas")).toBeInTheDocument();
        expect(mockFacilitiesAndReservationsContext.getAllReservations).toHaveBeenCalled();
        await waitFor(() => expect(screen.getByText("Juan Pérez")).toBeInTheDocument());
        expect(screen.getByText("Pista 1")).toBeInTheDocument();
    });

    it("shows loading spinner while fetching reservations", async () => {
        mockFacilitiesAndReservationsContext.getAllReservations.mockImplementationOnce(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(mockFacilitiesAndReservationsContext.reservations);
                }, 50);
            });
        });

        render(<AdminReservations />);
        await waitFor(() => expect(document.querySelector(".spinner")).toBeInTheDocument());
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

        await waitFor(() => expect(screen.getByText("Juan Pérez")).toBeInTheDocument());
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
        await waitFor(() => expect(screen.getByText("Juan Pérez")).toBeInTheDocument());
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
        await waitFor(() => expect(screen.getByText("Juan Pérez")).toBeInTheDocument());
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
        await waitFor(() => expect(screen.getByText("Juan Pérez")).toBeInTheDocument());
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
        await waitFor(() => expect(screen.getByText("Juan Pérez")).toBeInTheDocument());
        expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
        expect(screen.getByText("Pista 1")).toBeInTheDocument();
        expect(screen.getByText("1 de enero de 2024, 11:00")).toBeInTheDocument(); // Date in Spanish format
        expect(screen.getByText("1 de enero de 2024, 12:00")).toBeInTheDocument(); // Date in Spanish format
        expect(screen.getByText("50 €")).toBeInTheDocument();

        expect(screen.getByText("Laura Gómez")).toBeInTheDocument();
        expect(screen.getByText("Pista 2")).toBeInTheDocument();
        expect(screen.getByText("2 de enero de 2024, 14:00")).toBeInTheDocument(); // Date in Spanish format
        expect(screen.getByText("2 de enero de 2024, 15:00")).toBeInTheDocument(); // Date in Spanish format
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
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error al cargar datos:", expect.any(Error));
        });
        consoleErrorSpy.mockRestore();
    });

    describe("Pagination", () => {
        beforeEach(() => {
            const manyReservations = Array.from({ length: 12 }, (_, i) => ({
                _id: `${i + 1}`,
                userId: `user${i + 1}`,
                facilityId: `instalacion${i + 1}`,
                initDate: '2024-01-01T10:00:00.000Z',
                endDate: '2024-01-01T11:00:00.000Z',
                totalPrice: 50 + i,
                isPaid: i % 2 === 0,
            }));
            mockFacilitiesAndReservationsContext.getAllReservations.mockResolvedValue(manyReservations);
            mockAuthContext.getAllUsers.mockResolvedValue(
                Array.from({ length: 12 }, (_, i) => ({
                    _id: `user${i + 1}`,
                    name: `Usuario ${i + 1}`
                }))
            );
            
            mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue(
                Array.from({ length: 12 }, (_, i) => ({
                    _id: `instalacion${i + 1}`,
                    name: `Instalación ${i + 1}`
                }))
            );
            
        });

        it("renders pagination when there are more reservations than per page", async () => {
            render(<AdminReservations />);
            await waitFor(() => {
                const paginationDiv = document.querySelector(".pagination");
                expect(paginationDiv).toBeInTheDocument();
            });
        });

        it("renders correct number of page buttons", async () => {
            render(<AdminReservations />);
            await waitFor(() => {
                const pageButtons = Array.from(document.querySelectorAll(".pagination button"))
                    .filter(btn => /^\d+$/.test(btn.textContent)); // solo botones numéricos
                expect(pageButtons.length).toBeGreaterThan(1); // debería haber más de una página
            });
        });

        it("navigates to the second page", async () => {
            render(<AdminReservations />);
            await waitFor(() => {
                expect(screen.getByText("Usuario 1")).toBeInTheDocument();
            });

            const pageTwoBtn = Array.from(document.querySelectorAll(".pagination button"))
                .find(btn => btn.textContent === "2");

            fireEvent.click(pageTwoBtn);

            await waitFor(() => {
                expect(screen.getByText("Usuario 11")).toBeInTheDocument();
            });
        });

        it("disables previous button on first page", async () => {
            render(<AdminReservations />);
            await waitFor(() => {
                const prevBtn = Array.from(document.querySelectorAll(".pagination button"))
                    .find(btn => btn.textContent === "Anterior");
                expect(prevBtn).toBeDisabled();
            });
        });

        it("disables next button on last page", async () => {
            render(<AdminReservations />);
            await waitFor(() => {
              const nextBtn = Array.from(document.querySelectorAll(".pagination button"))
                .find(btn => btn.textContent === "Siguiente");
          
              const lastPageBtn = Array.from(document.querySelectorAll(".pagination button"))
                .find(btn => btn.textContent === "2"); // Ajusta según el total de páginas en el mock
          
              fireEvent.click(lastPageBtn);
            });
          
            await waitFor(() => {
              const nextBtn = Array.from(document.querySelectorAll(".pagination button"))
                .find(btn => btn.textContent === "Siguiente");
              expect(nextBtn).toBeDisabled();
            });
        });
    });
});