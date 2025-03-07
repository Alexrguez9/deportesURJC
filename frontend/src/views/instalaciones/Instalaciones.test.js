import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Instalaciones from "./Instalaciones";
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

describe("Instalaciones Component", () => {
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
            render(<Instalaciones />);
            expect(screen.getByText(/Debes iniciar sesión para reservar/i)).toBeInTheDocument();
        });

        it("does not render reservation form for non-logged in users", () => {
            useAuth.mockReturnValue({ ...mockAuthContext, user: null });
            render(<Instalaciones />);
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
                render(<Instalaciones />);
                expect(screen.getByRole('heading', { name: /Instalaciones/i })).toBeInTheDocument();
            });

            it("displays facilities after successful API call", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1' }, { _id: '2', nombre: 'Pista 2' }]);
                render(<Instalaciones />);
                await waitFor(() => {
                    expect(screen.getByRole('option', { name: /Pista 1/i })).toBeInTheDocument();
                    expect(screen.getByRole('option', { name: /Pista 2/i })).toBeInTheDocument();
                });
            });

            it("displays message for non-logged in users", () => {
                useAuth.mockReturnValue({ ...mockAuthContext, user: null });
                render(<Instalaciones />);
                expect(screen.getByText(/Debes iniciar sesión para reservar/i)).toBeInTheDocument();
            });

            it("does not render reservation form for non-logged in users", () => {
                useAuth.mockReturnValue({ ...mockAuthContext, user: null });
                render(<Instalaciones />);
                expect(screen.queryByRole('form', { className: 'form-reservar' })).not.toBeInTheDocument();
            });

            it("renders reservation form for logged in users", () => {
                render(<Instalaciones />);
                expect(document.querySelector('.form-reservar')).toBeInTheDocument();
            });

            it("displays price per media hora when an instalacion is selected", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1', precioPorMediaHora: 20 }]);
                mockFacilitiesAndReservationsContext.getInstalacion.mockResolvedValue({ _id: '1', nombre: 'Pista 1', precioPorMediaHora: 20, capacidad: 5 });
    
                render(<Instalaciones />);
                await waitFor(() => {
                    fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
                    expect(screen.getByText(/Precio por media hora: 20€./i)).toBeInTheDocument();
                });
            });

            it("displays capacity per reserva when an instalacion is selected", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1', capacidad: 5 }]);
                mockFacilitiesAndReservationsContext.getInstalacion.mockResolvedValue({ _id: '1', nombre: 'Pista 1', precioPorMediaHora: 20, capacidad: 5 });

                render(<Instalaciones />);
                await waitFor(() => {
                    fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
                });
                await waitFor(() => {
                    expect(screen.getByText(/Capacidad por reserva para Pista 1: 5/i)).toBeInTheDocument();
                });
            });

            it("renders DatePicker and Reservar button when instalacion is selected", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1', precioPorMediaHora: 20 }]);
                mockFacilitiesAndReservationsContext.getInstalacion.mockResolvedValue({ _id: '1', nombre: 'Pista 1', horario: { horarioInicio: new Date('2023-08-03T09:00'), horarioFin: new Date('2023-08-03T19:00')}, precioPorMediaHora: 20, capacidad: 5 });
   
               render(<Instalaciones />);
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
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1' }]);
                render(<Instalaciones />);

                await waitFor(() => {
                    fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
                });
            });

            it("calls obtenerInstalacionCompleta  when facility is selected", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1' }]);
                render(<Instalaciones />);
    
                await waitFor(async () => {
                    fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
                    await new Promise(resolve => setTimeout(resolve, 0));
                    expect(mockFacilitiesAndReservationsContext.getInstalacion).toHaveBeenCalled();
                });
            });
    
            it("updates startDate state on date change in DatePicker", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1', precioPorMediaHora: 20 }]);
                mockFacilitiesAndReservationsContext.getInstalacion.mockResolvedValue({ _id: '1', nombre: 'Pista 1', horario: { horarioInicio: new Date('2023-08-03T09:00'), horarioFin: new Date('2023-08-03T19:00')}, precioPorMediaHora: 20, capacidad: 5 });
                render(<Instalaciones />);
    
                await waitFor(() => {
                    fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
                    const datePicker = screen.getByRole('textbox');
                    fireEvent.change(datePicker, { target: { value: new Date('2024-08-05T10:30') } });
                    expect(datePicker).toHaveValue('Mon Aug 05 2024 10:30:00 GMT+0200 (hora de verano de Europa central)');
                });
            });

            it("calls handleReservation on valid form submit", async () => {
                mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{
                    _id: "1",
                    nombre: "Fútbol sala",
                    precioPorMediaHora: 20,
                    capacidad: 5,
                    descripcion: "Pista de fútbol sala",
                    horario: { horarioInicio: new Date("2023-08-03T09:00"), horarioFin: new Date("2023-08-03T19:00") },
                    isInternSport: true,
                }]);
                mockFacilitiesAndReservationsContext.getInstalacion.mockResolvedValue({
                    _id: "1",
                    nombre: "Fútbol sala",
                    precioPorMediaHora: 20,
                    capacidad: 5,
                    descripcion: "Pista de fútbol sala",
                    horario: { horarioInicio: new Date("2023-08-03T09:00"), horarioFin: new Date("2023-08-03T19:30") },
                    isInternSport: true,
                });
                mockFacilitiesAndReservationsContext.contarReservasPorFranjaHoraria.mockResolvedValue(0);
                mockFacilitiesAndReservationsContext.addReservation.mockResolvedValue({ ok: true, data: { precioTotal: 20 } });
                mockFacilitiesAndReservationsContext.getMinTime.mockResolvedValue(new Date(new Date().setHours(9, 0, 0)));
                mockFacilitiesAndReservationsContext.getMaxTime.mockResolvedValue(new Date(new Date().setHours(19, 30, 0)));
            
                render(<Instalaciones />);

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
            

            // it("shows success message on successful reservation", async () => {
            //     mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1', precioPorMediaHora: 20, capacidad: 5 }]);
            //     mockFacilitiesAndReservationsContext.getInstalacion.mockResolvedValue({ _id: '1', _id:'1', nombre: 'Pista 1', horario: { horarioInicio: new Date('2023-08-03T09:00'), horarioFin: new Date('2023-08-03T19:00')}, precioPorMediaHora: 20, capacidad: 5 });
            //     mockFacilitiesAndReservationsContext.contarReservasPorFranjaHoraria.mockResolvedValue(0);
            //     mockFacilitiesAndReservationsContext.addReservation.mockResolvedValue({ ok: true });
            
            //     render(<Instalaciones />);
            //     await waitFor(() => {
            //         fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
            //         expect(screen.getByText(/Precio por media hora: 20€./i)).toBeInTheDocument();
            //     });
            //     await waitFor(() => {
            //         expect(screen.getByRole("textbox")).toBeInTheDocument();
            //     });
            
            //     fireEvent.change(screen.getByRole('textbox'), { target: { value: new Date("2024-08-05T10:00") } });
            //     fireEvent.click(screen.getByRole('button', { name: /Reservar/i }));
            
            //     await new Promise(resolve => setTimeout(resolve, 0));
            //     await waitFor(async () => {
            //         expect(screen.getByText(/Reserva realizada con éxito./i)).toBeInTheDocument();
            //     });
            // });

            // it("shows error message on failed reservation", async () => {
            //     mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1', precioPorMediaHora: 20, capacidad: 5 }]);
            //     mockFacilitiesAndReservationsContext.getInstalacion.mockResolvedValue({ _id: '1', _id:'1', nombre: 'Pista 1', horario: { horarioInicio: new Date('2023-08-03T09:00'), horarioFin: new Date('2023-08-03T19:00')}, precioPorMediaHora: 20, capacidad: 5 });
            //     mockFacilitiesAndReservationsContext.contarReservasPorFranjaHoraria.mockResolvedValue(0);
            //     mockFacilitiesAndReservationsContext.addReservation.mockResolvedValue({ ok: false });

            //     render(<Instalaciones />);
            //     await waitFor(() => {
            //         fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
            //     });
            //     fireEvent.change(screen.getByRole('textbox'), { target: { value: new Date("2024-08-05T10:00") } });
            //     fireEvent.click(screen.getByRole('button', { name: /Reservar/i }));

            //     await waitFor(() => {
            //         expect(screen.getByText(/Hubo un problema al realizar la reserva. Inténtalo de nuevo./i)).toBeInTheDocument();
            //     });
            // });

            // it("calls contarReservasPorFranjaHoraria before addReservation", async () => {
            //     mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1', precioPorMediaHora: 20, capacidad: 5 }]);
            //     mockFacilitiesAndReservationsContext.getInstalacion.mockResolvedValue({ _id: '1', _id:'1', nombre: 'Pista 1', horario: { horarioInicio: new Date('2023-08-03T09:00'), horarioFin: new Date('2023-08-03T19:00')}, precioPorMediaHora: 20, capacidad: 5 });
            //     mockFacilitiesAndReservationsContext.contarReservasPorFranjaHoraria.mockResolvedValue(0);
            //     mockFacilitiesAndReservationsContext.addReservation.mockResolvedValue({ ok: true });

            //     render(<Instalaciones />);
            //     await waitFor(() => {
            //         fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
            //     });
            //     fireEvent.change(screen.getByRole('textbox'), { target: { value: new Date("2024-08-05T10:00") } });
            //     fireEvent.click(screen.getByRole('button', { name: /Reservar/i }));

            //     await waitFor(() => {
            //         expect(mockFacilitiesAndReservationsContext.contarReservasPorFranjaHoraria).toHaveBeenCalledTimes(1);
            //     });
            //     await waitFor(() => {
            //         expect(mockFacilitiesAndReservationsContext.addReservation).toHaveBeenCalledTimes(1);
            //     });
            // });

            // it("shows error message if facility is fully booked", async () => {
            //     mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1', precioPorMediaHora: 20, capacidad: 1 }]); // Capacity 1 for easy full booking
            //     mockFacilitiesAndReservationsContext.getInstalacion.mockResolvedValue({ _id: '1', _id:'1', nombre: 'Pista 1', horario: { horarioInicio: new Date('2023-08-03T09:00'), horarioFin: new Date('2023-08-03T19:00')}, precioPorMediaHora: 20, capacidad: 1 });
            //     mockFacilitiesAndReservationsContext.contarReservasPorFranjaHoraria.mockResolvedValue(1); // Already 1 reservation, so fully booked

            //     render(<Instalaciones />);
            //     await waitFor(() => {
            //         fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
            //     });
            //     fireEvent.change(screen.getByRole('textbox'), { target: { value: new Date("2024-08-05T10:00") } });
            //     fireEvent.click(screen.getByRole('button', { name: /Reservar/i }));

            //     await waitFor(() => {
            //         expect(screen.getByText(/Actualmente ya hay 1 reservas para esa hora. Por favor, selecciona otra hora./i)).toBeInTheDocument();
            //     });
            // });
            // it("updates startDate state on date change in DatePicker", async () => {
            //     mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1', precioPorMediaHora: 20 }]);
            //     mockFacilitiesAndReservationsContext.getInstalacion.mockResolvedValue({ _id: '1', nombre: 'Pista 1', horario: { horarioInicio: new Date('2023-08-03T09:00'), horarioFin: new Date('2023-08-03T19:00')}, precioPorMediaHora: 20, capacidad: 5 });
            //     render(<Instalaciones />);

            //     await waitFor(() => {
            //         fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
            //     });

            //     const datePicker = screen.getByRole("textbox");
            //     fireEvent.change(datePicker, { target: { value: "2024-08-05T10:00" } });
            //     expect(datePicker).toHaveValue("2024-08-05T10:00");

            //     const newDate = new Date('2024-08-06T15:30');
            //     fireEvent.change(datePicker, { target: { value: newDate } });

            //     expect(datePicker).toHaveValue(newDate);
            // });
        });

        // describe("Error Handling and Messages when user is logged in", () => {
        //     beforeEach(() => {
        //         mockAuthContext.user = { _id: '1', email: 'test@test.com', role: 'user' };
        //     });
        //     it("shows error message if getAllFacilities API call fails", async () => {
        //         mockFacilitiesAndReservationsContext.getAllFacilities.mockRejectedValue(new Error("API error"));
        //         render(<Instalaciones />);
        //         await waitFor(() => {
        //             expect(screen.getByText(/Error al obtener las instalaciones:/i)).toBeVisible();
        //         });
        //     });

        //     it("shows alert if user is not logged in when trying to reserve", async () => {
        //         useAuth.mockReturnValue({ ...mockAuthContext, user: null });
        //         mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1', precioPorMediaHora: 20, capacidad: 5 }]);
        //         mockFacilitiesAndReservationsContext.getInstalacion.mockResolvedValue({ _id: '1', _id:'1', nombre: 'Pista 1', horario: { horarioInicio: new Date('2023-08-03T09:00'), horarioFin: new Date('2023-08-03T19:00')}, precioPorMediaHora: 20, capacidad: 5 });
        //         render(<Instalaciones />);

        //         await waitFor(() => {
        //             fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
        //         });
        //         fireEvent.change(screen.getByRole('textbox'), { target: { value: new Date() } });
        //         fireEvent.click(screen.getByRole('button', { name: /Reservar/i }));

        //         await waitFor(() => {
        //             expect(window.alert).toHaveBeenCalledWith("Debes iniciar sesión para reservar");
        //         });
        //     });

        //     it("shows alert if no facility is selected when trying to reserve", async () => {
        //         render(<Instalaciones />);

        //         fireEvent.click(screen.getByRole('button', { name: /Reservar/i }));

        //         await waitFor(() => {
        //             expect(window.alert).toHaveBeenCalledWith("Debes escoger una instalación.");
        //         });
        //     });

        //     it("shows console error if instalacion has no valid horario", async () => {
        //         const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Spy on console.error to check if it's called
        //         mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1' }]);
        //         mockFacilitiesAndReservationsContext.getInstalacion.mockResolvedValue({ _id: '1', nombre: 'Pista 1', horario: null }); // Invalid horario

        //         render(<Instalaciones />);

        //         await waitFor(() => {
        //             fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
        //         });

        //         expect(consoleErrorSpy).toHaveBeenCalledWith( "Error: Instalación sin horario válido", { _id: '1', nombre: 'Pista 1', horario: null });
        //         consoleErrorSpy.mockRestore(); // Restore console.error
        //     });

        //     it("shows alert error if addReservation API call fails", async () => {
        //         mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue([{ _id: '1', nombre: 'Pista 1', precioPorMediaHora: 20, capacidad: 5 }]);
        //         mockFacilitiesAndReservationsContext.getInstalacion.mockResolvedValue({ _id: '1', _id:'1', nombre: 'Pista 1', horario: { horarioInicio: new Date('2023-08-03T09:00'), horarioFin: new Date('2023-08-03T19:00')}, precioPorMediaHora: 20, capacidad: 5 });
        //         mockFacilitiesAndReservationsContext.contarReservasPorFranjaHoraria.mockResolvedValue(0);
        //         mockFacilitiesAndReservationsContext.addReservation.mockRejectedValue(new Error("API addReservation error"));

        //         render(<Instalaciones />);
        //         await waitFor(() => {
        //             fireEvent.change(screen.getByRole('combobox', { name: /instalación/i }), { target: { value: '1' } });
        //         });
        //         fireEvent.change(screen.getByRole('textbox'), { target: { value: new Date() } });
        //         fireEvent.click(screen.getByRole('button', { name: /Reservar/i }));

        //         await waitFor(() => {
        //             expect(window.alert).toHaveBeenCalledWith("Hubo un problema al realizar la reserva. Inténtalo de nuevo.");
        //         });
        //     });
        // });
    });
});