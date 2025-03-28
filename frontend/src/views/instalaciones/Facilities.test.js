import {
    render,
    screen,
    fireEvent,
    waitFor
} from "@testing-library/react";
import Facilities from "./Facilities";
import { useAuth } from "../../context/AuthContext";
import { useFacilitiesAndReservations } from "../../context/FacilitiesAndReservationsContext";
import { mockAuthContext, mockFacilitiesAndReservationsContext } from "../../utils/mocks";

jest.mock('../../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

jest.mock('../../context/FacilitiesAndReservationsContext', () => ({
    useFacilitiesAndReservations: jest.fn()
}));

jest.mock('../../utils/mails', () => ({
    sendEmail: jest.fn()
}));

describe("Facilities Component", () => {
    beforeEach(() => {
        useAuth.mockReturnValue(mockAuthContext);
        useFacilitiesAndReservations.mockReturnValue(mockFacilitiesAndReservationsContext);
        jest.clearAllMocks();
    });

    describe("Rendering when user is not logged in", () => {
        beforeEach(() => {
            useAuth.mockReturnValue({ ...mockAuthContext, user: null });
        });
        it("renders message for non-logged in users", () => {
            useAuth.mockReturnValue({ ...mockAuthContext, user: null });
            render(<Facilities />);
            expect(screen.getByText(/Debes iniciar sesión para reservar/i)).toBeInTheDocument();
        });

        it("does not render reservation form for non-logged in users", () => {
            useAuth.mockReturnValue({ ...mockAuthContext, user: null });
            render(<Facilities />);
            expect(screen.queryByRole('form', { className: 'form-reservar' })).not.toBeInTheDocument();
        });
    });

    describe("User logged in", () => {
        beforeEach(() => {
            mockAuthContext.user = { _id: '1', email: 'test@test.com', role: 'user' };
        });

        describe("Rendering and Initial Display", () => {
            beforeEach(() => {
                mockAuthContext.user = { _id: '1', email: 'test@test.com', role: 'user' };
            });
            it("renders the component and title", () => {
                render(<Facilities />);
                expect(screen.getByRole('heading', { name: /Instalaciones/i })).toBeInTheDocument();
            });

            it("displays facilities after successful API call", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', name: 'Pista 1' }, { _id: '2', name: 'Pista 2' }]);
                render(<Facilities />);
                await waitFor(() => {
                    expect(screen.getByRole('option', { name: /Pista 1/i })).toBeInTheDocument();
                    expect(screen.getByRole('option', { name: /Pista 2/i })).toBeInTheDocument();
                });
            });

            it("displays message for non-logged in users", () => {
                useAuth.mockReturnValue({ ...mockAuthContext, user: null });
                render(<Facilities />);
                expect(screen.getByText(/Debes iniciar sesión para reservar/i)).toBeInTheDocument();
            });

            it("does not render reservation form for non-logged in users", () => {
                useAuth.mockReturnValue({ ...mockAuthContext, user: null });
                render(<Facilities />);
                expect(screen.queryByRole('form', { className: 'form-reservar' })).not.toBeInTheDocument();
            });

            it("renders reservation form for logged in users", () => {
                render(<Facilities />);
                expect(document.querySelector('.form-reservar')).toBeInTheDocument();
            });

            it("displays price per media hora when a facility is selected", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', name: 'Pista 1', priceForHalfHour: 20 }]);
                mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue({ _id: '1', name: 'Pista 1', priceForHalfHour: 20, capacity: 5 });
    
                render(<Facilities />);
                await waitFor(() => {
                    fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
                    expect(screen.getByText(/Precio por media hora: 20€./i)).toBeInTheDocument();
                });
            });

            it("displays capacity per reserva when a facility is selected", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', name: 'Pista 1', capacity: 5 }]);
                mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue({ _id: '1', name: 'Pista 1', priceForHalfHour: 20, capacity: 5 });

                render(<Facilities />);
                await waitFor(() => {
                    fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
                });
                await waitFor(() => {
                    expect(screen.getByText(/Capacidad por reserva para Pista 1: 5/i)).toBeInTheDocument();
                });
            });

            it("renders DatePicker and Reservar button when facility is selected", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', name: 'Pista 1', priceForHalfHour: 20 }]);
                mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue({ _id: '1', name: 'Pista 1', schedule: { initialHour: new Date('2023-08-03T09:00'), endHour: new Date('2023-08-03T19:00')}, priceForHalfHour: 20, capacity: 5 });
   
               render(<Facilities />);
               await waitFor(() => {
                   fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
                   expect(screen.getByRole('textbox')).toBeInTheDocument(); // DatePicker
                   expect(screen.getByRole('button', { name: /Reservar/i })).toBeInTheDocument();
               });
           });
        });

        // TODO: completar tests desde aquí
        describe("Functionality", () => {
            beforeEach(() => {
                mockAuthContext.user = { _id: '1', email: 'test@test.com', role: 'user' };
            });
            it("updates selectedInstalacionId state on facility selection", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', name: 'Pista 1' }]);
                render(<Facilities />);

                await waitFor(() => {
                    fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
                });
            });

            it("calls obtenerInstalacionCompleta  when facility is selected", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', name: 'Pista 1' }]);
                render(<Facilities />);
    
                await waitFor(async () => {
                    fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
                    await new Promise(resolve => setTimeout(resolve, 0));
                    expect(mockFacilitiesAndReservationsContext.getFacility).toHaveBeenCalled();
                });
            });
    
            it("updates startDate state on date change in DatePicker", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', name: 'Pista 1', priceForHalfHour: 20 }]);
                mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue({ _id: '1', name: 'Pista 1', schedule: { initialHour: new Date('2023-08-03T09:00'), endHour: new Date('2023-08-03T19:00')}, priceForHalfHour: 20, capacity: 5 });
                render(<Facilities />);
    
                await waitFor(() => {
                    fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
                    const datePicker = screen.getByRole('textbox');
                    fireEvent.change(datePicker, { target: { value: new Date('2024-08-05T10:30') } });
                    expect(datePicker.value).toMatch(/^Mon Aug 05 2024 10:30:00 GMT\+0200/);
                });
            });

            it("calls handleReservation on valid form submit", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{
                    _id: "1",
                    name: "Fútbol sala",
                    priceForHalfHour: 20,
                    capacity: 5,
                    description: "Pista de fútbol sala",
                    schedule: { initialHour: new Date("2023-08-03T09:00"), endHour: new Date("2023-08-03T19:00") },
                    isInternSport: true,
                }]);
                mockFacilitiesAndReservationsContext.getFacility.mockResolvedValue({
                    _id: "1",
                    name: "Fútbol sala",
                    priceForHalfHour: 20,
                    capacity: 5,
                    description: "Pista de fútbol sala",
                    schedule: { initialHour: new Date("2023-08-03T09:00"), endHour: new Date("2023-08-03T19:30") },
                    isInternSport: true,
                });
                mockFacilitiesAndReservationsContext.countReservationsByTimeSlot.mockResolvedValue(0);
                mockFacilitiesAndReservationsContext.addReservation.mockResolvedValue({ ok: true, data: { totalPrice: 20 } });
                mockFacilitiesAndReservationsContext.getMinTime.mockResolvedValue(new Date(new Date().setHours(9, 0, 0)));
                mockFacilitiesAndReservationsContext.getMaxTime.mockResolvedValue(new Date(new Date().setHours(19, 30, 0)));
            
                render(<Facilities />);

                await waitFor(() => {
                    fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
                    expect(screen.getByText(/Precio por media hora: 20€./i)).toBeInTheDocument();
                });
            
                await waitFor(() => {
                    expect(screen.getByText(/Capacidad por reserva para Fútbol sala:/i)).toBeInTheDocument();
                });
            
                await waitFor(() => {
                    expect(screen.getByRole("textbox")).toBeInTheDocument();
                });
            
                const datePicker = screen.getByRole("textbox");
                fireEvent.change(datePicker, { target: { value: "2024-08-05T10:00" } });
            
                await waitFor(() => {
                    const submitButton = screen.getByRole("button", { name: /Reservar/i });
                    expect(submitButton).not.toBeDisabled();
                    fireEvent.click(submitButton);
                });
            
                // await waitFor(() => {
                //     expect(mockFacilitiesAndReservationsContext.addReservation).toHaveBeenCalledTimes(1);
                // });
            });
            
        });
    });
});