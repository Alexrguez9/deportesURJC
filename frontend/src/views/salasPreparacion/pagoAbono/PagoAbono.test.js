import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PagoAbono from "./PagoAbono";
import { useAuth } from '../../../context/AuthContext';
import { mockAuthContext } from "../../../utils/mocks";
import { BrowserRouter, useNavigate } from 'react-router-dom';
import * as mailUtils from '../../../utils/mails';
import { toast } from 'sonner';

jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

jest.mock('../../../utils/mails', () => ({
    sendEmail: jest.fn()
}));

jest.mock('sonner', () => {
    const mockToast = {
        success: jest.fn(),
        error: jest.fn(),
        promise: jest.fn((promiseFn, { loading, success, error }) => {
            return promiseFn()
                .then(result => {
                    mockToast.success(success);
                    return Promise.resolve(result);
                })
                .catch(err => {
                    mockToast.error(error(err));
                    return Promise.resolve();
                });
        }),
    };
    return { toast: mockToast };
});

describe("PagoAbono Component", () => {
    let mockNavigate;
    let originalAlert;

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
        mockAuthContext.user = {
            _id: '123',
            name: 'Test User',
            email: 'test@example.com',
            alta: {
                gimnasio: { estado: true, fechaInicio: new Date(), fechaFin: new Date() },
                atletismo: { estado: false, fechaInicio: null, fechaFin: null }
            }
        };
        mockAuthContext.updateUser = jest.fn().mockResolvedValue({ status: 200, data: {} });
        mockAuthContext.isStudent = jest.fn().mockReturnValue(true);
        mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        // Mock window.alert for tests that might use alert
        originalAlert = window.alert;
        window.alert = jest.fn();
    });

    afterEach(() => {
        window.alert = originalAlert; // Restore original alert after tests
    });

    it("renders component elements correctly when user is logged in and has alta in at least one sport", async () => {
        render(
            <BrowserRouter>
                <PagoAbono />
            </BrowserRouter>
        );

        expect(screen.getByRole("heading", { level: 1, name: /pago abono/i })).toBeInTheDocument();
        expect(screen.getByText(/Bienvenido a la página de pago del abono de atletismo o gimnasio de la URJC./i)).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toHaveValue('Gimnasio');
        expect(screen.getByRole("button", { name: /renovar gratis/i })).toBeInTheDocument();
        expect(screen.queryByText(/Debes iniciar sesión para poder pagar o renovar tu abono/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/No estás dado de alta en ninguna instalación de preparación física/i)).not.toBeInTheDocument();
    });

    it("renders 'Debes iniciar sesión...' message when user is not logged in", async () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);

        render(
            <BrowserRouter>
                <PagoAbono />
            </BrowserRouter>
        );

        expect(screen.getByText(/Debes iniciar sesión para poder pagar o renovar tu abono/i)).toBeInTheDocument();
        expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /renovar gratis/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /pagar/i })).not.toBeInTheDocument();
        expect(screen.queryByText(/No estás dado de alta en ninguna instalación de preparación física/i)).not.toBeInTheDocument();
    });

    it("renders 'No estás dado de alta...' message and alta button when user is logged in but has no alta", async () => {
        mockAuthContext.user.alta = {
            gimnasio: { estado: false, fechaInicio: null, fechaFin: null },
            atletismo: { estado: false, fechaInicio: null, fechaFin: null }
        };
        render(
            <BrowserRouter>
                <PagoAbono />
            </BrowserRouter>
        );

        expect(screen.getByText(/No estás dado de alta en ninguna instalación de preparación física/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /alta de usuarios/i })).toBeInTheDocument();
        expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /renova gratisr/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /pagar/i })).not.toBeInTheDocument();
        expect(screen.queryByText(/Debes iniciar sesión para poder pagar o renovar tu abono/i)).not.toBeInTheDocument();
    });

    it("updates sport filter when dropdown value changes", async () => {
        render(
            <BrowserRouter>
                <PagoAbono />
            </BrowserRouter>
        );

        const sportSelect = screen.getByRole("combobox");
        fireEvent.change(sportSelect, { target: { value: 'Atletismo' } });
        await waitFor(() => {
            expect(sportSelect).toHaveValue('Atletismo');
        });
    });

    it("calls updateUser with correct parameters and shows success message for student paying Gimnasio", async () => {
        render(
            <BrowserRouter>
                <PagoAbono />
            </BrowserRouter>
        );

        const pagarButton = screen.getByRole("button", { name: /renovar gratis/i });
        fireEvent.click(pagarButton);

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledTimes(1);
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith('123', expect.objectContaining({
                alta: expect.objectContaining({
                    gimnasio: expect.objectContaining({ estado: true, fechaInicio: expect.any(Date), fechaFin: expect.any(Date) }), // Changed to Date
                    atletismo: expect.objectContaining({ estado: false })
                })
            }));
        });

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Pago completado con éxito!');
        });
    });

    it("calls updateUser with correct parameters and shows success message for student renovating Atletismo", async () => {
        mockAuthContext.user.alta.gimnasio.estado = false;
        mockAuthContext.user.alta.atletismo.estado = true;
        mockAuthContext.isStudent = jest.fn().mockReturnValue(true);
        render(
            <BrowserRouter>
                <PagoAbono />
            </BrowserRouter>
        );
        const sportSelect = screen.getByRole("combobox");
        fireEvent.change(sportSelect, { target: { value: 'Atletismo' } });

        const pagarButton = screen.getByRole("button", { name: /renovar gratis/i });
        fireEvent.click(pagarButton);

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledTimes(1);
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith('123', expect.objectContaining({
                alta: expect.objectContaining({
                    atletismo: expect.objectContaining({ estado: true, fechaInicio: expect.any(Date), fechaFin: expect.any(Date) }), // Changed to Date
                    gimnasio: expect.objectContaining({ estado: false })
                }),
                email: 'test@example.com',
                name: 'Test User',
            }));
            expect(toast.success).toHaveBeenCalledWith('Pago completado con éxito!');
        });
    });

    it("renders error message when updateUser fails", async () => {
        mockAuthContext.updateUser = jest.fn().mockRejectedValue(new Error("Update error"));

        render(
            <BrowserRouter>
                <PagoAbono />
            </BrowserRouter>
        );

        const pagarButton = screen.getByRole("button", { name: /renovar gratis/i });
        fireEvent.click(pagarButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Se ha producido un error al dar de alta. Inténtalo de nuevo.');
        });
    });

    it("shows error message if user has no alta in both instalations", async () => {
        mockAuthContext.user.alta.gimnasio.estado = false;
        mockAuthContext.user.alta.atletismo.estado = false;
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <PagoAbono />
            </BrowserRouter>
        );

        expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /renovar gratis/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /pagar/i })).not.toBeInTheDocument();
        expect(screen.getByText(/No estás dado de alta en ninguna instalación de preparación física/i)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /alta de usuarios/i })).toBeInTheDocument();
    });

    it("navigates to '/salas-preparacion/alta' when 'Alta de usuarios' button is clicked", async () => {
        mockAuthContext.user.alta = {
            gimnasio: { estado: false, fechaInicio: null, fechaFin: null },
            atletismo: { estado: false, fechaInicio: null, fechaFin: null }
        };
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <PagoAbono />
            </BrowserRouter>
        );

        const altaButton = screen.getByRole("button", { name: /alta de usuarios/i });
        fireEvent.click(altaButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/salas-preparacion/alta');
        });
    });

    it("renders PaymentForm for external users and not renders free payment button", () => {
        mockAuthContext.isStudent = jest.fn().mockReturnValue(false);
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <PagoAbono />
            </BrowserRouter>
        );
        const paymentContainer = document.querySelector(".payment-container");
        expect(paymentContainer).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /renovar gratis/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /pagar gratis/i })).not.toBeInTheDocument();
    });

    it("calls sendEmail after successful payment", async () => {
        render(
            <BrowserRouter>
                <PagoAbono />
            </BrowserRouter>
        );

        const pagarButton = screen.getByRole("button", { name: /renovar gratis/i });
        fireEvent.click(pagarButton);

        await waitFor(() => {
            expect(mailUtils.sendEmail).toHaveBeenCalledTimes(1);
            expect(mailUtils.sendEmail).toHaveBeenCalledWith(
                mockAuthContext.user.email,
                'DeportesURJC - Confirmación de Pago de abono',
                expect.stringContaining(`Hola ${mockAuthContext.user.name},\n\nTu pago del Abono de Gimnasio ha sido completado con éxito.`)
            );
        });
    });

    it("renders spinner while loading", async () => {
        mockAuthContext.updateUser = jest.fn(() => new Promise(resolve => setTimeout(() => resolve({ status: 200, data: {} }), 500)));

        render(
            <BrowserRouter>
                <PagoAbono />
            </BrowserRouter>
        );

        const pagarButton = screen.getByRole("button", { name: /renovar gratis/i });
        fireEvent.click(pagarButton);

        expect(document.querySelector(".spinner")).toBeInTheDocument();

        await waitFor(() => {
            expect(document.querySelector(".spinner")).not.toBeInTheDocument();
        }, { timeout: 1000 });
    });

    it("shows error message if user tries to pay for Atletismo without atletismo alta, but yes gym alta", async () => {
        mockAuthContext.user.alta.gimnasio.estado = true;
        mockAuthContext.user.alta.atletismo.estado = false;

        render(
            <BrowserRouter>
                <PagoAbono />
            </BrowserRouter>
        );
        const sportSelect = screen.getByRole("combobox");
        fireEvent.change(sportSelect, { target: { value: 'Atletismo' } });
        const pagarButton = screen.getByRole("button", { name: /obtener gratis/i });
        fireEvent.click(pagarButton);


        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('No estás dado de alta en el atletismo.');
        });
    });

    it("shows error message if user tries to pay for Gym without gym alta, but yes atletismo alta", async () => {
        mockAuthContext.user.alta.gimnasio.estado = false;
        mockAuthContext.user.alta.atletismo.estado = true;

        render(
            <BrowserRouter>
                <PagoAbono />
            </BrowserRouter>
        );
        const sportSelect = screen.getByRole("combobox");
        fireEvent.change(sportSelect, { target: { value: 'Gimnasio' } });
        const pagarButton = screen.getByRole("button", { name: /obtener gratis/i });
        fireEvent.click(pagarButton);

        expect(toast.error).toHaveBeenCalledWith('No estás dado de alta en el gimnasio.');
    });
});
