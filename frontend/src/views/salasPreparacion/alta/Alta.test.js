import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";
import Alta from "./Alta";
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

describe("Alta Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuthContext.user = {
            _id: '123',
            name: 'Test User',
            alta: {
                gimnasio: { estado: false, fechaInicio: null, fechaFin: null },
                atletismo: { estado: false, fechaInicio: null, fechaFin: null }
            }
        };
        mockAuthContext.updateUser = jest.fn().mockResolvedValue({ ok: true });
        useAuth.mockReturnValue(mockAuthContext);
    });

    it("no muestra el botón si el usuario no está logueado", () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><Alta /></BrowserRouter>);
        expect(screen.queryByRole("button", { name: /darme de alta/i })).not.toBeInTheDocument();
        expect(screen.getByText(/Debes iniciar sesión/i)).toBeInTheDocument();
    });

    it("llama a updateUser correctamente para gimnasio", async () => {
        render(<BrowserRouter><Alta /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith(
                '123',
                expect.objectContaining({
                    alta: expect.objectContaining({
                        gimnasio: {
                            estado: true,
                            fechaInicio: startDate,
                            fechaFin: infinityDate
                        }
                    })
                })
            );
            expect(toast.success).toHaveBeenCalledWith("Alta completada con éxito!");
        });
    });

    it("llama a updateUser correctamente para atletismo", async () => {
        render(<BrowserRouter><Alta /></BrowserRouter>);
        fireEvent.change(screen.getByRole("combobox"), { target: { value: 'Atletismo' } });
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith(
                '123',
                expect.objectContaining({
                    alta: expect.objectContaining({
                        atletismo: {
                            estado: true,
                            fechaInicio: startDate,
                            fechaFin: infinityDate
                        }
                    })
                })
            );
        });
    });

    it("muestra error si updateUser devuelve ok: false", async () => {
        mockAuthContext.updateUser = jest.fn().mockResolvedValue({ ok: false });
        render(<BrowserRouter><Alta /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Se ha producido un error al dar de alta. Inténtalo de nuevo más tarde.");
        });
    });

    it("muestra error si updateUser lanza excepción", async () => {
        mockAuthContext.updateUser = jest.fn().mockRejectedValue({});
        render(<BrowserRouter><Alta /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Se ha producido un error al dar de alta. Inténtalo de nuevo más tarde.");
        });
    });

    it("muestra error si ya está dado de alta en ambos", async () => {
        mockAuthContext.user.alta.gimnasio.estado = true;
        mockAuthContext.user.alta.atletismo.estado = true;
        render(<BrowserRouter><Alta /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Ya estás dado de alta en las dos instalaciones.");
        });
    });

    it("muestra error si ya está dado de alta en gimnasio", async () => {
        mockAuthContext.user.alta.gimnasio.estado = true;
        render(<BrowserRouter><Alta /></BrowserRouter>);
        fireEvent.change(screen.getByRole("combobox"), { target: { value: 'Gimnasio' } });
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Ya estás dado de alta en gimnasio");
        });
    });

    it("muestra error si ya está dado de alta en atletismo", async () => {
        mockAuthContext.user.alta.atletismo.estado = true;
        render(<BrowserRouter><Alta /></BrowserRouter>);
        fireEvent.change(screen.getByRole("combobox"), { target: { value: 'Atletismo' } });
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Ya estás dado de alta en atletismo");
        });
    });

    it("muestra error si se selecciona una opción inválida", async () => {
        render(<BrowserRouter><Alta /></BrowserRouter>);
        fireEvent.change(screen.getByRole("combobox"), { target: { value: 'Invalido' } });
        fireEvent.click(screen.getByRole("button", { name: /darme de alta/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Escoja una opción válida por favor.");
        });
    });
});
