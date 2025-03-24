import {
    render,
    screen,
    fireEvent,
    waitFor,
    within
} from "@testing-library/react";
import MisAbonos from "./MisAbonos";
import { useAuth } from "../../../context/AuthContext";
import { mockAuthContext } from "../../../utils/mocks";
import { BrowserRouter } from "react-router-dom";
import { toast } from "sonner";

jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

jest.mock("sonner", () => {
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
        })
    };
    return { toast: mockToast };
});

describe("MisAbonos Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuthContext.user = {
            _id: "123",
            name: "Test User",
            alta: {
                gimnasio: { estado: true, fechaInicio: "2024-01-01", fechaFin: "2024-12-31" },
                atletismo: { estado: true, fechaInicio: "2024-02-01", fechaFin: "2024-12-31" }
            },
            subscription: {
                gimnasio: { estado: true, fechaInicio: "2025-03-01", fechaFin: "2025-03-30" },
                atletismo: { estado: false, fechaInicio: null, fechaFin: null }
            }
        };
        mockAuthContext.updateUser = jest.fn().mockResolvedValue({ status: 200 });
        useAuth.mockReturnValue(mockAuthContext);
    });

    it("muestra mensaje si el usuario no está logueado", () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MisAbonos /></BrowserRouter>);
        expect(screen.getByText("Debes iniciar sesión para acceder a tus abonos")).toBeInTheDocument();
    });

    it("renderiza ambas tarjetas de gimnasio y atletismo", () => {
        render(<BrowserRouter><MisAbonos /></BrowserRouter>);
        expect(screen.getByText("GIMNASIO MENSUAL")).toBeInTheDocument();
        expect(screen.getByText("ATLETISMO MENSUAL")).toBeInTheDocument();
    });

    it("muestra información de abono activo y botón de baja para gimnasio", () => {
        render(<BrowserRouter><MisAbonos /></BrowserRouter>);
        const gimnasioCard = screen.getByText("GIMNASIO MENSUAL").closest(".card-no-hover");
        expect(within(gimnasioCard).getByText("Abono activo")).toBeInTheDocument();
        expect(within(gimnasioCard).getByRole("button", { name: /Darme de baja/i })).toBeInTheDocument();
    });

    it("muestra 'Abono inactivo' si no hay suscripción en atletismo", () => {
        render(<BrowserRouter><MisAbonos /></BrowserRouter>);
        const atletismoCard = screen.getByText("ATLETISMO MENSUAL").closest(".card-no-hover");
        expect(within(atletismoCard).getByText("Abono inactivo")).toBeInTheDocument();
    });

    it("muestra mensaje de alta correspondiente en ambas tarjetas", () => {
        render(<BrowserRouter><MisAbonos /></BrowserRouter>);
        expect(screen.getByText((content) =>
            content.includes("Fecha alta:") && content.includes("1 de enero de 2024")
        )).toBeInTheDocument();
    
        expect(screen.getByText((content) =>
            content.includes("Fecha de alta:") && content.includes("1 de febrero de 2024")
        )).toBeInTheDocument();
    });
    
    it("muestra mensaje de 'No estás dado de alta' si el alta es false", () => {
        mockAuthContext.user.alta.gimnasio.estado = false;
        mockAuthContext.user.alta.atletismo.estado = false;
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MisAbonos /></BrowserRouter>);
        expect(screen.getAllByText(/No estás dado de alta/)).toHaveLength(2);
    });

    it("llama a updateUser y muestra éxito al dar de baja en gimnasio", async () => {
        render(<BrowserRouter><MisAbonos /></BrowserRouter>);
        const btn = screen.getByRole("button", { name: /Darme de baja/i });
        fireEvent.click(btn);

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith("123", expect.objectContaining({
                subscription: expect.objectContaining({
                    gimnasio: {
                        estado: false,
                        fechaInicio: null,
                        fechaFin: null
                    }
                })
            }));
            expect(toast.success).toHaveBeenCalledWith("Baja completada con éxito!");
        });
    });

    it("llama a updateUser y muestra éxito al dar de baja en atletismo", async () => {
        mockAuthContext.user.subscription.atletismo.estado = true;
        mockAuthContext.user.subscription.atletismo.fechaInicio = "2025-01-01";
        mockAuthContext.user.subscription.atletismo.fechaFin = "2029-01-01";
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MisAbonos /></BrowserRouter>);
        const btn = screen.getAllByRole("button", { name: /Darme de baja/i })[1];
        fireEvent.click(btn);

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith("123", expect.objectContaining({
                subscription: expect.objectContaining({
                    atletismo: {
                        estado: false,
                        fechaInicio: null,
                        fechaFin: null
                    }
                })
            }));
            expect(toast.success).toHaveBeenCalledWith("Baja completada con éxito!");
        });
    });

    it("show error message if updateUser fails for gimnasio", async () => {
        mockAuthContext.updateUser = jest.fn().mockRejectedValue({ status: 500 });
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MisAbonos /></BrowserRouter>);
        const btn = screen.getByRole("button", { name: /Darme de baja/i });
        fireEvent.click(btn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Se ha producido un error al dar de baja. Inténtalo de nuevo más tarde.");
        });
    });

    it("show error message if updateUser fails for atletismo", async () => {
        mockAuthContext.user.subscription.atletismo.estado = true;
        mockAuthContext.user.subscription.atletismo.fechaInicio = "2025-01-01";
        mockAuthContext.user.subscription.atletismo.fechaFin = "2029-01-01";
        mockAuthContext.updateUser = jest.fn().mockRejectedValue({ status: 500 });
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MisAbonos /></BrowserRouter>);
        const btn = screen.getAllByRole("button", { name: /Darme de baja/i })[1];
        fireEvent.click(btn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Se ha producido un error al dar de baja. Inténtalo de nuevo más tarde.");
        });
    });

    it("renderiza fechas de suscripción correctamente", () => {
        render(<BrowserRouter><MisAbonos /></BrowserRouter>);
        expect(screen.getByText((content) =>
            content.includes("Fecha alta:") && content.includes("1 de marzo de 2025")
        )).toBeInTheDocument();
    
        expect(screen.getByText((content) =>
            content.includes("Fecha caducidad:") && content.includes("30 de marzo de 2025")
        )).toBeInTheDocument();
    });

    it("renderiza correctamente el mensaje de 'Abono inactivo' en atletismo", () => {
        mockAuthContext.user.subscription.gimnasio.estado = false;
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MisAbonos /></BrowserRouter>);
    
        const atletismoCard = screen.getByText("GIMNASIO MENSUAL").closest(".card-no-hover");
        expect(within(atletismoCard).getByText("Abono inactivo")).toBeInTheDocument();
    });

    it("show 'Abono caducado' for gimnasio if end date is past", () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
    
        mockAuthContext.user.subscription.gimnasio = {
            estado: true,
            fechaInicio: "2025-01-01",
            fechaFin: "2025-01-31",
        };
    
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MisAbonos /></BrowserRouter>);
    
        const gimnasioCard = screen.getByText("GIMNASIO MENSUAL").closest(".card-no-hover");
        expect(within(gimnasioCard).getByText("Abono caducado")).toBeInTheDocument();
    });
    
    it("show 'Abono caducado' for atletismo if end date is past", () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
    
        mockAuthContext.user.subscription.atletismo = {
            estado: true,
            fechaInicio: "2025-01-01",
            fechaFin:  "2025-01-31",
        };
    
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MisAbonos /></BrowserRouter>);
    
        const atletismoCard = screen.getByText("ATLETISMO MENSUAL").closest(".card-no-hover");
        expect(within(atletismoCard).getByText("Abono caducado")).toBeInTheDocument();
    });
});
