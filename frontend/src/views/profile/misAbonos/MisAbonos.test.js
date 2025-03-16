import {
    render,
    screen,
    fireEvent,
    waitFor,
    within
} from "@testing-library/react";
import MisAbonos from "./MisAbonos";
import { useAuth } from '../../../context/AuthContext';
import { mockAuthContext } from "../../../utils/mocks";
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';

jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn()
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

describe("MisAbonos Component", () => {
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

    it("should display 'Debes iniciar sesión' if user is not logged in", () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <MisAbonos />
            </BrowserRouter>
        );
        expect(screen.getByText('Debes iniciar sesión para acceder a tus abonos')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Darme de baja/i })).not.toBeInTheDocument();
    });

    it("should display both subscription cards when user is logged in", () => {
        render(
            <BrowserRouter>
                <MisAbonos />
            </BrowserRouter>
        );
        expect(screen.getByText('GIMNASIO MENSUAL')).toBeInTheDocument();
        expect(screen.getByText('ATLETISMO MENSUAL')).toBeInTheDocument();
    });

    it("should display 'Abono activo' and 'Darme de baja' button when subscribed to Gimnasio", () => {
        mockAuthContext.user.alta.gimnasio.estado = true;
        mockAuthContext.user.alta.gimnasio.fechaInicio = new Date('2025-02-22T10:00:00.000Z').toISOString();
        mockAuthContext.user.alta.gimnasio.fechaFin = new Date('2025-02-22T10:30:00.000Z').toISOString();
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <MisAbonos />
            </BrowserRouter>
        );
        expect(screen.getByText('GIMNASIO MENSUAL')).toBeInTheDocument();
        expect(screen.getByText('Abono activo')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Darme de baja/i, container: screen.getByText('GIMNASIO MENSUAL').closest('.card-no-hover') })).toBeInTheDocument();
    });

    it("should display 'Abono inactivo' when not subscribed to Gimnasio", () => {
        render(
            <BrowserRouter>
                <MisAbonos />
            </BrowserRouter>
        );
        expect(screen.getByText('GIMNASIO MENSUAL')).toBeInTheDocument();
        const gimnasioCard = screen.getByText('GIMNASIO MENSUAL').closest('.card-no-hover');
        expect(within(gimnasioCard).getByText('Abono inactivo')).toBeInTheDocument();
    });

    it("should display 'Abono activo' and 'Darme de baja' button when subscribed to Atletismo", () => {
        mockAuthContext.user.alta.atletismo.estado = true;
        mockAuthContext.user.alta.atletismo.fechaInicio = new Date('2025-02-22T10:00:00.000Z').toISOString();
        mockAuthContext.user.alta.atletismo.fechaFin = new Date('2025-02-22T10:30:00.000Z').toISOString();
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <MisAbonos />
            </BrowserRouter>
        );
        expect(screen.getByText('ATLETISMO MENSUAL')).toBeInTheDocument();
        expect(screen.getByText('Abono activo', { container: screen.getByText('ATLETISMO MENSUAL').closest('.card-no-hover') })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Darme de baja/i, container: screen.getByText('ATLETISMO MENSUAL').closest('.card-no-hover') })).toBeInTheDocument();
    });

    it("should display 'Abono inactivo' when not subscribed to Atletismo", () => {
        render(
            <BrowserRouter>
                <MisAbonos />
            </BrowserRouter>
        );
        expect(screen.getByText('ATLETISMO MENSUAL')).toBeInTheDocument();
        const atletismoCard = screen.getByText('ATLETISMO MENSUAL').closest('.card-no-hover');
        expect(within(atletismoCard).getByText('Abono inactivo')).toBeInTheDocument();
    });

    it("should call updateUser and show success message when 'Darme de baja' button for Gimnasio is clicked", async () => {
        mockAuthContext.user.alta.gimnasio.estado = true;
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <MisAbonos />
            </BrowserRouter>
        );
        const bajaButtonGimnasio = screen.getByRole('button', { name: /Darme de baja/i, container: screen.getByText('GIMNASIO MENSUAL').closest('.card-no-hover') });
        fireEvent.click(bajaButtonGimnasio);

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledTimes(1);
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith(
                '123',
                expect.objectContaining({
                    alta: expect.objectContaining({
                        gimnasio: { estado: false, fechaInicio: null, fechaFin: null },
                    }),
                })
            );
            expect(toast.promise).toHaveBeenCalledTimes(1);
            expect(toast.success).toHaveBeenCalledWith('Baja completada con éxito!');
        });
    });

    it("should call updateUser and show success message when 'Darme de baja' button for Atletismo is clicked", async () => {
        mockAuthContext.user.alta.atletismo.estado = true;
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <MisAbonos />
            </BrowserRouter>
        );
        const bajaButtonAtletismo = screen.getByRole('button', { name: /Darme de baja/i, container: screen.getByText('ATLETISMO MENSUAL').closest('.card-no-hover') });
        fireEvent.click(bajaButtonAtletismo);

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledTimes(1);
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith(
                '123',
                expect.objectContaining({
                    alta: expect.objectContaining({
                        atletismo: { estado: false, fechaInicio: null, fechaFin: null },
                    }),
                })
            );
            expect(toast.promise).toHaveBeenCalledTimes(1);
            expect(toast.success).toHaveBeenCalledWith('Baja completada con éxito!');
        });
    });

    it("should show error message when updateUser fails for Gimnasio baja", async () => {
        mockAuthContext.user.alta.gimnasio.estado = true;
        mockAuthContext.updateUser = jest.fn().mockRejectedValue({ status: 500, error: 'Update failed' });
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <MisAbonos />
            </BrowserRouter>
        );
        const bajaButtonGimnasio = screen.getByRole('button', { name: /Darme de baja/i, container: screen.getByText('GIMNASIO MENSUAL').closest('.card-no-hover') });
        fireEvent.click(bajaButtonGimnasio);

        await waitFor(() => {
            expect(toast.promise).toHaveBeenCalledTimes(1);
            expect(toast.error).toHaveBeenCalledWith('Se ha producido un error al dar de baja. Inténtalo de nuevo más tarde.');
        });
    });

    it("should show error message when updateUser fails for Atletismo baja", async () => {
        mockAuthContext.user.alta.atletismo.estado = true;
        mockAuthContext.updateUser = jest.fn().mockRejectedValue({ status: 500, error: 'Update failed' });
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <MisAbonos />
            </BrowserRouter>
        );
        const bajaButtonAtletismo = screen.getByRole('button', { name: /Darme de baja/i, container: screen.getByText('ATLETISMO MENSUAL').closest('.card-no-hover') });
        fireEvent.click(bajaButtonAtletismo);

        await waitFor(() => {
            expect(toast.promise).toHaveBeenCalledTimes(1);
            expect(toast.error).toHaveBeenCalledWith('Se ha producido un error al dar de baja. Inténtalo de nuevo más tarde.');
        });
    });
});