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

jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

jest.mock("../../../utils/dates", () => ({
    getMonthlyDateRange: jest.fn(() => ["2025-03-01T00:00:00.000Z", "2025-04-01T00:00:00.000Z"])
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
        mockAuthContext.updateUser = jest.fn().mockResolvedValue({ status: 200, data: {} });
        useAuth.mockReturnValue(mockAuthContext);
    });

    it("calls updateUser and shows success message when 'Darme de alta' button is clicked", async () => {
        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );

        const altaButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(altaButton);

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledTimes(1);
            expect(toast.promise).toHaveBeenCalledTimes(1);
            expect(toast.promise).toHaveBeenCalledWith(expect.any(Function), {
                loading: 'Dando de alta...',
                success: 'Alta completada con éxito!',
                error: expect.any(Function),
            });
        });
    });

    it("shows error message when updateUser fails", async () => {
        mockAuthContext.updateUser = jest.fn().mockRejectedValue({ status: 500, error: 'Update failed' });

        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );

        const altaButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(altaButton);

        await waitFor(() => {
            expect(toast.promise).toHaveBeenCalledTimes(1);
            expect(toast.error).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith('Se ha producido un error al dar de alta. Inténtalo de nuevo más tarde.');
        });
    });

    it("shows error message if user is already registered in both facilities", async () => {
        mockAuthContext.user.alta = {
            gimnasio: { estado: true, fechaInicio: new Date(), fechaFin: new Date() },
            atletismo: { estado: true, fechaInicio: new Date(), fechaFin: new Date() }
        };
        useAuth.mockReturnValue(mockAuthContext);

        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );

        const altaButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(altaButton);

        await waitFor(() => {
            expect(toast.promise).toHaveBeenCalledTimes(1);
            expect(toast.error).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith('Ya estás dado de alta en las dos instalaciones.');
        });
    });

    it("shows error message if user is already registered in atletismo", async () => {
        mockAuthContext.user.alta.atletismo.estado = true;
        useAuth.mockReturnValue(mockAuthContext);

        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );
        const sportSelect = screen.getByRole("combobox");
        fireEvent.change(sportSelect, { target: { value: 'Atletismo' } });
        const altaButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(altaButton);

        await waitFor(() => {
            expect(toast.promise).toHaveBeenCalledTimes(1);
            expect(toast.error).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith('Ya estás dado de alta en atletismo');
        });
    });

    it("shows error message if user is already registered in gimnasio", async () => {
        mockAuthContext.user.alta.gimnasio.estado = true;
        useAuth.mockReturnValue(mockAuthContext);

        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );
        const sportSelect = screen.getByRole("combobox");
        fireEvent.change(sportSelect, { target: { value: 'Gimnasio' } });
        const altaButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(altaButton);

        await waitFor(() => {
            expect(toast.promise).toHaveBeenCalledTimes(1);
            expect(toast.error).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith('Ya estás dado de alta en gimnasio');
        });
    });

    it("shows error message if no sport option is selected (invalid option)", async () => {
        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );
        const sportSelect = screen.getByRole("combobox");
        fireEvent.change(sportSelect, { target: { value: '' } }); // Select invalid option - although UI prevent this
        const altaButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(altaButton);

        await waitFor(() => {
            expect(toast.promise).toHaveBeenCalledTimes(1);
            expect(toast.error).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith('Escoja una opción válida por favor.');
        });
    });

    it("shows error message if user is not logged in and alta button should not appear", async () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);

        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.queryByRole("button", { name: /darme de alta/i })).not.toBeInTheDocument();
            expect(toast.promise).toHaveBeenCalledTimes(0);
        });
    });

    it("calls updateUser with correct parameters for Gimnasio", async () => {
        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );

        const altaButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(altaButton);

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledTimes(1);
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith(
                '123',
                expect.objectContaining({
                    _id: '123',
                    alta: expect.objectContaining({
                        gimnasio: expect.objectContaining({
                            estado: true,
                            fechaInicio: "2025-03-01T00:00:00.000Z",
                            fechaFin: "2025-04-01T00:00:00.000Z"
                        }),
                        atletismo: expect.objectContaining({
                            estado: false,
                            fechaInicio: null,
                            fechaFin: null
                        }),
                    }),
                })
            );
        });
    });

    it("calls updateUser with correct parameters for Atletismo", async () => {
        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );
        const sportSelect = screen.getByRole("combobox");
        fireEvent.change(sportSelect, { target: { value: 'Atletismo' } });
        const altaButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(altaButton);

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledTimes(1);
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith(
                '123',
                expect.objectContaining({
                    _id: '123',
                    alta: expect.objectContaining({
                        atletismo: expect.objectContaining({
                            estado: true,
                            fechaInicio: "2025-03-01T00:00:00.000Z",
                            fechaFin: "2025-04-01T00:00:00.000Z"
                        }),
                        gimnasio: expect.objectContaining({
                            estado: false,
                            fechaInicio: null,
                            fechaFin: null
                        }),
                    }),
                })
            );
        });
    });
});