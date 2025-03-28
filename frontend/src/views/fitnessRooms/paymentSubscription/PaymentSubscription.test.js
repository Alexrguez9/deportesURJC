import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PaymentSubscription from "./PaymentSubscription";
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

describe("PaymentSubscription Component", () => {
    let mockNavigate;

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);

        const mockDateRange = { startDate: '2024-08-03T09:00', endDate: '2029-08-03T09:00' };
        jest.spyOn(require("../../../utils/dates"), "getMonthlyDateRange").mockResolvedValue(mockDateRange);


        mockAuthContext.user = {
            _id: '123',
            name: 'Test User',
            email: 'test@example.com',
            registration: {
                gym: { isActive: true, initDate: new Date('2024-08-03T09:00'), endDate: new Date('2024-08-03T09:00') },
                athletics: { isActive: false, initDate: null, endDate: null }
            },
            subscription: {
                gym: { isActive: true, initDate: new Date('2025-03-01T09:00'), endDate: new Date('2025-04-01T09:00') },
                athletics: { isActive: false, initDate: null, endDate: null }
            }
        };
        mockAuthContext.updateUser = jest.fn().mockResolvedValue({ status: 200 });
        mockAuthContext.isStudent = jest.fn().mockReturnValue(true);
        mockAuthContext.isAdmin = jest.fn().mockReturnValue(false);

        mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);
    });

    it("render current subscription dates and Renovar gratis button", () => {
        render(<BrowserRouter><PaymentSubscription /></BrowserRouter>);
        expect(screen.getByText(/Inicio abono:/)).toHaveTextContent("Inicio abono: 2025-03-01");
        expect(screen.getByText(/Expiración abono:/)).toHaveTextContent("Expiración abono: 2025-04-01");
        expect(screen.getByRole("button", { name: /Renovar gratis/i })).toBeInTheDocument();
    });

    it("render error message on if there is no registration", async () => {
        render(<BrowserRouter><PaymentSubscription /></BrowserRouter>);
        fireEvent.change(screen.getByRole("combobox"), { target: { value: 'Atletismo' } });
        expect(screen.getByText("No estás dado de alta en Atletismo")).toBeInTheDocument();
    });

    it("render error message on Gym if there is no registration", async () => {
        mockAuthContext.user = {
            ...mockAuthContext.user,
            registration: {
                gym: { isActive: false, initDate: null, endDate: null },
                athletics: { isActive: true, initDate: new Date('2024-08-03T09:00'), endDate: new Date('2027-08-03T09:00') }
            },
            subscription: {
                gym: { isActive: false, initDate: null, endDate: null },
                athletics: { isActive: false, initDate: null, endDate: null }
            }
        };
        render(<BrowserRouter><PaymentSubscription /></BrowserRouter>);
        fireEvent.change(screen.getByRole("combobox"), { target: { value: 'Gimnasio' } });
        expect(screen.getByText("No estás dado de alta en Gimnasio")).toBeInTheDocument();
    });

    it("displays error message if getMonthlyDateRange fails", async () => {
        const mockDateRange = { startDate: null, endDate: null };
        jest.spyOn(require("../../../utils/dates"), "getMonthlyDateRange").mockReturnValue(mockDateRange);

        render(<BrowserRouter><PaymentSubscription /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /Renovar gratis/i }));
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("No se pudo calcular la fecha de renovación. Por favor verifica los datos.");
        });
    });

    it("calls updateUser and sendEmail on success", async () => {
        jest.useFakeTimers();
        const mockDateRange = { startDate: '2024-08-03T09:00', endDate: '2029-08-03T09:00' };
        jest.spyOn(require("../../../utils/dates"), "getMonthlyDateRange").mockReturnValue(mockDateRange);

        render(<BrowserRouter><PaymentSubscription /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /Renovar gratis/i }));
    
        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalled();
        });
    
        jest.runAllTimers(); // permite que el setTimeout se ejecute
    
        await waitFor(() => {
            expect(mailUtils.sendEmail).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith("Pago completado con éxito!");
        });
    
        jest.useRealTimers();
    });

    it("render PaymentForm if you are not a student or admin", () => {
        mockAuthContext.isStudent = jest.fn().mockReturnValue(false);
        mockAuthContext.isAdmin = jest.fn().mockReturnValue(false);
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><PaymentSubscription /></BrowserRouter>);
        expect(document.querySelector(".payment-container")).toBeInTheDocument();
    });

    it("render Obtener gratis button if you do not have an active subscription", () => {
        mockAuthContext.user = {
            ...mockAuthContext.user,
            registration: {
                gym: { isActive: true, initDate: "2025-03-01", endDate: "2025-04-01" },
                athletics: { isActive: false, initDate: null, endDate: null }
            },
            subscription: {
                gym: { isActive: false, initDate: null, endDate: null },
                athletics: { isActive: false, initDate: null, endDate: null }
            }
        };
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><PaymentSubscription /></BrowserRouter>);
        expect(screen.getByRole("button", { name: /Obtener gratis/i })).toBeInTheDocument();
    });

    it("renders 'Debes iniciar sesión' message if no user is present", () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><PaymentSubscription /></BrowserRouter>);
        expect(screen.getByText(/Debes iniciar sesión/)).toBeInTheDocument();
    });

    it("render discharge message required if there is no registration on any installation", () => {
        mockAuthContext.user.registration.gym.isActive = false;
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><PaymentSubscription /></BrowserRouter>);
        expect(screen.getByText(/No estás dado de alta en ninguna instalación/)).toBeInTheDocument();
    });

    it("redirects to registration if you press the registration button", () => {
        mockAuthContext.user.registration.gym.isActive = false;
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><PaymentSubscription /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /Alta de usuarios/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/salas-preparacion/alta');
    });
});
