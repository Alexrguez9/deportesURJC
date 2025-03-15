import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminModalFacilities from "./AdminModalFacilities";
import { useFacilitiesAndReservations } from "../../../context/FacilitiesAndReservationsContext";
import { mockFacilitiesAndReservationsContext } from "../../../utils/mocks";
import * as sonner from 'sonner';

jest.mock('../../../context/FacilitiesAndReservationsContext', () => ({
    useFacilitiesAndReservations: jest.fn()
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const mockCloseModal = jest.fn();

describe("AdminModalFacilities Component", () => {
    beforeEach(() => {
        useFacilitiesAndReservations.mockReturnValue(mockFacilitiesAndReservationsContext);
        jest.clearAllMocks();
        sonner.toast.success.mockClear();
        sonner.toast.error.mockClear();
    });

    describe("Rendering and Initial Display", () => {
        it("renders the component in 'Nueva instalación' mode", () => {
            render(<AdminModalFacilities closeModal={mockCloseModal} />);
            expect(screen.getByRole('heading', { name: /Nueva instalación/i })).toBeInTheDocument();
        });

        it("renders the component in 'Editar instalación' mode", () => {
            render(<AdminModalFacilities closeModal={mockCloseModal} popupData={{ nombre: 'Pista 1', descripcion: 'Descripción de Pista 1' }} />);
            expect(screen.getByRole('heading', { name: /Editar instalación/i })).toBeInTheDocument();
        });

        it("renders all form fields", () => {
            render(<AdminModalFacilities closeModal={mockCloseModal} />);
            expect(screen.getByLabelText(/Nombre:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Descripción:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Capacidad:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Precio por 30 minutos:/i)).toBeInTheDocument();
            expect(screen.getByLabelText("¿Deporte interno?:")).toBeInTheDocument();
            expect(screen.getByLabelText(/Horario de Inicio:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Horario de Fin:/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
        });

        it("fills in initial values when in 'Editar instalación' mode", () => {
            const popupData = {
                _id: '1',
                nombre: 'Pista Test',
                descripcion: 'Descripción prueba',
                capacidad: 10,
                precioPorMediaHora: 25,
                isInternSport: true,
                horario: {
                    horarioInicio: new Date('2024-08-03T09:00'),
                    horarioFin: new Date('2024-08-03T21:00')
                }
            };
            render(<AdminModalFacilities closeModal={mockCloseModal} popupData={popupData} />);
            expect(screen.getByLabelText(/Nombre:/i)).toHaveValue(popupData.nombre);
            expect(screen.getByLabelText(/Descripción:/i)).toHaveValue(popupData.descripcion);
            expect(screen.getByLabelText(/Capacidad:/i)).toHaveValue(popupData.capacidad);
            expect(screen.getByLabelText(/Precio por 30 minutos:/i)).toHaveValue(popupData.precioPorMediaHora);
            expect(screen.getByLabelText("¿Deporte interno?:")).toHaveValue(String(popupData.isInternSport));
            expect(screen.getByLabelText(/Horario de Inicio:/i)).toHaveValue(popupData.horario.horarioInicio.toISOString().slice(0, 16));
            expect(screen.getByLabelText(/Horario de Fin:/i)).toHaveValue(popupData.horario.horarioFin.toISOString().slice(0, 16));
        });
    });

    describe("Input Validation and Error Messages", () => {
        it("shows error message for empty Nombre field", async () => {
            render(<AdminModalFacilities closeModal={mockCloseModal} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));
            await waitFor(() => {
                expect(screen.getByText(/Introduce un nombre válido/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty Descripción field", async () => {
            render(<AdminModalFacilities closeModal={mockCloseModal} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));
            await waitFor(() => {
                expect(screen.getByText(/Introduce una descripción válida/i)).toBeInTheDocument();
            });
        });

        it("shows error message for invalid Capacidad (less than 1)", async () => {
            render(<AdminModalFacilities closeModal={mockCloseModal} />);
            fireEvent.change(screen.getByLabelText(/Capacidad:/i), { target: { value: '0' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));
            await waitFor(() => {
                expect(screen.getByText(/La capacidad debe ser mayor a 0/i)).toBeInTheDocument();
            });
        });

        it("shows error message for invalid Precio por 30 minutos (negative)", async () => {
            render(<AdminModalFacilities closeModal={mockCloseModal} />);
            fireEvent.change(screen.getByLabelText(/Precio por 30 minutos:/i), { target: { value: '-10' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));
            await waitFor(() => {
                expect(screen.getByText(/El precio no puede ser negativo/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty Horario de Inicio field", async () => {
            render(<AdminModalFacilities closeModal={mockCloseModal} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));
            await waitFor(() => {
                expect(screen.getByText(/Selecciona un horario de inicio/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty Horario de Fin field", async () => {
            render(<AdminModalFacilities closeModal={mockCloseModal} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));
            await waitFor(() => {
                expect(screen.getByText(/Selecciona un horario de fin/i)).toBeInTheDocument();
            });
        });
    });

    describe("Form Submission and API Calls", () => {
        it("calls addFacility on valid submit and shows success toast", async () => {
            mockFacilitiesAndReservationsContext.addFacility.mockResolvedValue({ ok: true });
            render(<AdminModalFacilities closeModal={mockCloseModal} />);

            fireEvent.change(screen.getByLabelText(/Nombre:/i), { target: { value: 'Pista Nueva' } });
            fireEvent.change(screen.getByLabelText(/Descripción:/i), { target: { value: 'Descripción nueva' } });
            fireEvent.change(screen.getByLabelText(/Capacidad:/i), { target: { value: '5' } });
            fireEvent.change(screen.getByLabelText(/Precio por 30 minutos:/i), { target: { value: '30' } });
            fireEvent.change(screen.getByLabelText(/Horario de Inicio:/i), { target: { value: '2024-08-03T10:00' } });
            fireEvent.change(screen.getByLabelText(/Horario de Fin:/i), { target: { value: '2024-08-03T20:00' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));

            await waitFor(() => {
                expect(mockFacilitiesAndReservationsContext.addFacility).toHaveBeenCalledTimes(1);
            });
            await waitFor(() => {
                expect(mockCloseModal).toHaveBeenCalledTimes(1);
            });
            await waitFor(() => {
                expect(sonner.toast.success).toHaveBeenCalledWith("Instalación guardada correctamente");
            });
        });

        it("calls updateFacility on valid submit when popupData is provided and shows success toast", async () => {
            mockFacilitiesAndReservationsContext.updateFacility.mockResolvedValue({ ok: true });
            render(<AdminModalFacilities closeModal={mockCloseModal} popupData={{ _id: '1' }} />);

            fireEvent.change(screen.getByLabelText(/Nombre:/i), { target: { value: 'Pista Actualizada' } });
            fireEvent.change(screen.getByLabelText(/Descripción:/i), { target: { value: 'Descripción actualizada' } });
            fireEvent.change(screen.getByLabelText(/Capacidad:/i), { target: { value: '8' } });
            fireEvent.change(screen.getByLabelText(/Precio por 30 minutos:/i), { target: { value: '35' } });
            fireEvent.change(screen.getByLabelText(/Horario de Inicio:/i), { target: { value: '2024-08-03T11:00' } });
            fireEvent.change(screen.getByLabelText(/Horario de Fin:/i), { target: { value: '2024-08-03T21:00' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));

            await waitFor(() => {
                expect(mockFacilitiesAndReservationsContext.updateFacility).toHaveBeenCalledTimes(1);
            });
            await waitFor(() => {
                expect(mockCloseModal).toHaveBeenCalledTimes(1);
            });
            await waitFor(() => {
                expect(sonner.toast.success).toHaveBeenCalledWith("Instalación editada correctamente");
            });
        });

        it("shows error toast if addFacility fails", async () => {
            mockFacilitiesAndReservationsContext.addFacility.mockRejectedValue(new Error("Add facility failed"));
            render(<AdminModalFacilities closeModal={mockCloseModal} />);

            fireEvent.change(screen.getByLabelText(/Nombre:/i), { target: { value: 'Pista Nueva' } });
            fireEvent.change(screen.getByLabelText(/Descripción:/i), { target: { value: 'Descripción nueva' } });
            fireEvent.change(screen.getByLabelText(/Capacidad:/i), { target: { value: '5' } });
            fireEvent.change(screen.getByLabelText(/Precio por 30 minutos:/i), { target: { value: '30' } });
            fireEvent.change(screen.getByLabelText(/Horario de Inicio:/i), { target: { value: '2024-08-03T10:00' } });
            fireEvent.change(screen.getByLabelText(/Horario de Fin:/i), { target: { value: '2024-08-03T20:00' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));

            await waitFor(() => {
                expect(sonner.toast.error).toHaveBeenCalledWith("Error al procesar el formulario de instalaciones.");
            });
        });

        it("shows error toast if updateFacility fails", async () => {
            mockFacilitiesAndReservationsContext.updateFacility.mockRejectedValue(new Error("Update facility failed"));
            render(<AdminModalFacilities closeModal={mockCloseModal} popupData={{ _id: '1' }} />);

            fireEvent.change(screen.getByLabelText(/Nombre:/i), { target: { value: 'Pista Actualizada' } });
            fireEvent.change(screen.getByLabelText(/Descripción:/i), { target: { value: 'Descripción actualizada' } });
            fireEvent.change(screen.getByLabelText(/Capacidad:/i), { target: { value: '8' } });
            fireEvent.change(screen.getByLabelText(/Precio por 30 minutos:/i), { target: { value: '35' } });
            fireEvent.change(screen.getByLabelText(/Horario de Inicio:/i), { target: { value: '2024-08-03T11:00' } });
            fireEvent.change(screen.getByLabelText(/Horario de Fin:/i), { target: { value: '2024-08-03T21:00' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));

            await waitFor(() => {
                expect(sonner.toast.error).toHaveBeenCalledWith("Error al procesar el formulario de instalaciones.");
            });
        });
    });

    describe("Modal Close Functionality", () => {
        it("calls closeModal function when close button is clicked", () => {
            render(<AdminModalFacilities closeModal={mockCloseModal} />);
            fireEvent.click(document.querySelector('#close-menu'));
            expect(mockCloseModal).toHaveBeenCalledTimes(1);
        });
    });
});