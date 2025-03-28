import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";
import Registration from "./Registration";
import { useAuth } from '../../../context/AuthContext';
import { mockAuthContext } from "../../../utils/mocks";
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';

const startDate = "2025-03-01T00:00:00.000Z";
const infinityDate = "9999-12-31T23:59:59.999Z";

jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

jest.mock("../../../utils/dates", () => ({
    getMonthlyDateRange: jest.fn(() => ({ startDate, endDate: "2025-04-01T00:00:00.000Z" })),
    infinityDate,
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

describe("Registration Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuthContext.user = {
            _id: '123',
            name: 'Test User',
            registration: {
                gym: { isActive: false, initDate: null, endDate: null },
                athletics: { isActive: false, initDate: null, endDate: null }
            }
        };
        mockAuthContext.updateUser = jest.fn().mockResolvedValue({ ok: true });
        useAuth.mockReturnValue(mockAuthContext);
    });

    it("does not show button if user is not logged in", () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><Registration /></BrowserRouter>);
        expect(screen.queryByRole("button", { name: /darme de alta/i })).not.toBeInTheDocument();
        expect(screen.getByText(/Debes iniciar sesión/i)).toBeInTheDocument();
    });

    it("call updateUser correctly for gym", async () => {
        render(<BrowserRouter><Registration /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith(
                '123',
                expect.objectContaining({
                    registration: expect.objectContaining({
                        gym: {
                            isActive: true,
                            initDate: startDate,
                            endDate: infinityDate
                        }
                    })
                })
            );
        });
        expect(toast.success).toHaveBeenCalledWith("Alta completada con éxito!");
    });

    it("call updateUser correctly for athletics", async () => {
        render(<BrowserRouter><Registration /></BrowserRouter>);
        fireEvent.change(screen.getByRole("combobox"), { target: { value: 'Atletismo' } });
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith(
                '123',
                expect.objectContaining({
                    registration: expect.objectContaining({
                        athletics: {
                            isActive: true,
                            initDate: startDate,
                            endDate: infinityDate
                        }
                    })
                })
            );
        });
    });

    it("error if updateUser returns false", async () => {
        mockAuthContext.updateUser = jest.fn().mockResolvedValue({ ok: false });
        render(<BrowserRouter><Registration /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Se ha producido un error al dar de alta. Inténtalo de nuevo más tarde.");
        });
    });

    it("error if updateUser throws exception", async () => {
        mockAuthContext.updateUser = jest.fn().mockRejectedValue({});
        render(<BrowserRouter><Registration /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Se ha producido un error al dar de alta. Inténtalo de nuevo más tarde.");
        });
    });

    it("shows error if you are already registered for both", async () => {
        mockAuthContext.user.registration.gym.isActive = true;
        mockAuthContext.user.registration.athletics.isActive = true;
        render(<BrowserRouter><Registration /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Ya estás dado de alta en las dos instalaciones.");
        });
    });

    it("shows error if you are already registered in gym", async () => {
        mockAuthContext.user.registration.gym.isActive = true;
        render(<BrowserRouter><Registration /></BrowserRouter>);
        fireEvent.change(screen.getByRole("combobox"), { target: { value: 'Gimnasio' } });
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Ya estás dado de alta en gimnasio");
        });
    });

    it("shows error if you are already registered in athletics", async () => {
        mockAuthContext.user.registration.athletics.isActive = true;
        render(<BrowserRouter><Registration /></BrowserRouter>);
        fireEvent.change(screen.getByRole("combobox"), { target: { value: 'Atletismo' } });
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Ya estás dado de alta en athletics");
        });
    });

    it("displays error if an invalid option is selected", async () => {
        render(<BrowserRouter><Registration /></BrowserRouter>);
        fireEvent.change(screen.getByRole("combobox"), { target: { value: 'Invalido' } });
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Escoja una opción válida por favor.");
        });
    });
});
