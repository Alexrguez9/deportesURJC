import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminModalReservations from "./AdminModalReservations";
import { useFacilitiesAndReservations } from "../../../context/FacilitiesAndReservationsContext";
import { mockFacilitiesAndReservationsContext } from "../../../utils/mocks";

jest.mock('../../../context/FacilitiesAndReservationsContext', () => ({
    useFacilitiesAndReservations: jest.fn()
}));

const mockCloseModal = jest.fn();

describe("AdminModalReservations Component", () => {
    beforeEach(() => {
        useFacilitiesAndReservations.mockReturnValue(mockFacilitiesAndReservationsContext);
        jest.clearAllMocks();
    });

    describe("Rendering and Initial Display", () => {
        it("renders the component in 'Nueva reserva' mode", () => {
            render(<AdminModalReservations closeModal={mockCloseModal} />);
            expect(screen.getByRole('heading', { name: /Nueva reserva/i })).toBeInTheDocument();
        });

        it("renders the component in 'Editar reserva' mode", () => {
            render(<AdminModalReservations closeModal={mockCloseModal} popupData={{ _id: '1', userId: 'user1', instalacionId: 'instalacion1' }} />);
            expect(screen.getByRole('heading', { name: /Editar reserva/i })).toBeInTheDocument();
        });

        it("renders all form fields", () => {
            render(<AdminModalReservations closeModal={mockCloseModal} />);
            expect(screen.getByLabelText(/Usuario ID:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Instalación ID:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Fecha inicio:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Fecha fin:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Precio total:/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
        });

        it("fills in initial values when in 'Editar reserva' mode", () => {
            const popupData = {
                _id: '1',
                userId: 'user1',
                instalacionId: 'instalacion1',
                fechaInicio: new Date('2024-08-01T10:00'),
                fechaFin: new Date('2024-08-01T12:00'),
                precioTotal: 50,
            };
            render(<AdminModalReservations closeModal={mockCloseModal} popupData={popupData} />);
            expect(screen.getByLabelText(/Usuario ID:/i)).toHaveValue(popupData.userId);
            expect(screen.getByLabelText(/Instalación ID:/i)).toHaveValue(popupData.instalacionId);
            expect(screen.getByLabelText(/Fecha inicio:/i)).toHaveValue(popupData.fechaInicio.toISOString().slice(0, 16));
            expect(screen.getByLabelText(/Fecha fin:/i)).toHaveValue(popupData.fechaFin.toISOString().slice(0, 16));
            expect(screen.getByLabelText(/Precio total:/i)).toHaveValue(popupData.precioTotal);
        });
    });

    describe("Input Validation and Error Messages", () => {
        it("shows error message for empty Usuario ID field", async () => {
            render(<AdminModalReservations closeModal={mockCloseModal} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));
            await waitFor(() => {
                expect(screen.getByText(/Introduce un ID de usuario válido/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty Instalación ID field", async () => {
            render(<AdminModalReservations closeModal={mockCloseModal} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));
            await waitFor(() => {
                expect(screen.getByText(/Introduce un ID de instalación válido/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty Fecha inicio field", async () => {
            render(<AdminModalReservations closeModal={mockCloseModal} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));
            await waitFor(() => {
                expect(screen.getByText(/Introduce una fecha de inicio/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty Fecha fin field", async () => {
            render(<AdminModalReservations closeModal={mockCloseModal} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));
            await waitFor(() => {
                expect(screen.getByText(/Introduce una fecha de fin/i)).toBeInTheDocument();
            });
        });

        it("shows error message for negative Precio total", async () => {
            render(<AdminModalReservations closeModal={mockCloseModal} />);
            fireEvent.change(screen.getByLabelText(/Precio total:/i), { target: { value: '-10' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));
            await waitFor(() => {
                expect(screen.getByText(/El precio no puede ser negativo/i)).toBeInTheDocument();
            });
        });
    });

    describe("Form Submission and API Calls", () => {
        it("calls addReservation on valid submit and shows success message", async () => {
            mockFacilitiesAndReservationsContext.addReservation.mockResolvedValue({ ok: true });
            render(<AdminModalReservations closeModal={mockCloseModal} />);

            fireEvent.change(screen.getByLabelText(/Usuario ID:/i), { target: { value: 'user123' } });
            fireEvent.change(screen.getByLabelText(/Instalación ID:/i), { target: { value: 'instalacion456' } });
            fireEvent.change(screen.getByLabelText(/Fecha inicio:/i), { target: { value: '2024-08-02T10:00' } });
            fireEvent.change(screen.getByLabelText(/Fecha fin:/i), { target: { value: '2024-08-02T12:00' } });
            fireEvent.change(screen.getByLabelText(/Precio total:/i), { target: { value: '60' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));

            await waitFor(() => {
                expect(mockFacilitiesAndReservationsContext.addReservation).toHaveBeenCalledTimes(1);
            });
             await waitFor(() => {
                expect(mockCloseModal).toHaveBeenCalledTimes(1);
            });
        });

        it("calls updateReservation on valid submit when popupData is provided", async () => {
            mockFacilitiesAndReservationsContext.updateReservation.mockResolvedValue({ ok: true });
            render(<AdminModalReservations closeModal={mockCloseModal} popupData={{ _id: '1' }} />);

            fireEvent.change(screen.getByLabelText(/Usuario ID:/i), { target: { value: 'user123' } });
            fireEvent.change(screen.getByLabelText(/Instalación ID:/i), { target: { value: 'instalacion456' } });
            fireEvent.change(screen.getByLabelText(/Fecha inicio:/i), { target: { value: '2024-08-02T10:00' } });
            fireEvent.change(screen.getByLabelText(/Fecha fin:/i), { target: { value: '2024-08-02T12:00' } });
            fireEvent.change(screen.getByLabelText(/Precio total:/i), { target: { value: '60' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));

            await waitFor(() => {
                expect(mockFacilitiesAndReservationsContext.updateReservation).toHaveBeenCalledTimes(1);
            });
            await waitFor(() => {
                expect(mockCloseModal).toHaveBeenCalledTimes(1);
            });
        });

        it("shows error message if addReservation fails", async () => {
            mockFacilitiesAndReservationsContext.addReservation.mockRejectedValue(new Error("Add reservation failed"));
            render(<AdminModalReservations closeModal={mockCloseModal} />);

            fireEvent.change(screen.getByLabelText(/Usuario ID:/i), { target: { value: 'user123' } });
            fireEvent.change(screen.getByLabelText(/Instalación ID:/i), { target: { value: 'instalacion456' } });
            fireEvent.change(screen.getByLabelText(/Fecha inicio:/i), { target: { value: '2024-08-02T10:00' } });
            fireEvent.change(screen.getByLabelText(/Fecha fin:/i), { target: { value: '2024-08-02T12:00' } });
            fireEvent.change(screen.getByLabelText(/Precio total:/i), { target: { value: '60' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));

            await waitFor(() => {
                expect(screen.getByText(/Error al guardar la reserva./i)).toBeInTheDocument();
            });
        });

        it("shows error message if updateReservation fails", async () => {
            mockFacilitiesAndReservationsContext.updateReservation.mockRejectedValue(new Error("Update reservation failed"));
            render(<AdminModalReservations closeModal={mockCloseModal} popupData={{ _id: '1' }} />);

            fireEvent.change(screen.getByLabelText(/Usuario ID:/i), { target: { value: 'user123' } });
            fireEvent.change(screen.getByLabelText(/Instalación ID:/i), { target: { value: 'instalacion456' } });
            fireEvent.change(screen.getByLabelText(/Fecha inicio:/i), { target: { value: '2024-08-02T10:00' } });
            fireEvent.change(screen.getByLabelText(/Fecha fin:/i), { target: { value: '2024-08-02T12:00' } });
            fireEvent.change(screen.getByLabelText(/Precio total:/i), { target: { value: '60' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));

            await waitFor(() => {
                expect(screen.getByText(/Error al guardar la reserva./i)).toBeInTheDocument();
            });
        });
    });

    describe("Modal Close Functionality", () => {
        it("calls closeModal function when close button is clicked", () => {
            render(<AdminModalReservations closeModal={mockCloseModal} />);
            fireEvent.click(document.querySelector('#close-menu'));
            expect(mockCloseModal).toHaveBeenCalledTimes(1);
        });
    });
});