import {
    render,
    screen,
    fireEvent,
    waitFor,
    within
} from "@testing-library/react";
import MySubscriptions from "./MySubscriptions";
import { useAuth } from "../../../context/AuthContext";
import { mockAuthContext } from "../../../utils/mocks";
import { BrowserRouter } from "react-router-dom";
import { toast } from "sonner";
jest.mock("../../../utils/user", () => ({
    isSubscriptionExpired: jest.fn()
  }));
import { mockIsSubscriptionExpired } from "../../../utils/testUtils";

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

describe("MySubscriptions Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuthContext.user = {
            _id: "123",
            name: "Test User",
            registration: {
                gym: { isActive: true, initDate: "2024-01-01", endDate: "2024-12-31" },
                athletics: { isActive: true, initDate: "2024-02-01", endDate: "2024-12-31" }
            },
            subscription: {
                gym: { isActive: true, initDate: "2024-03-01", endDate: "2024-04-01" },
                athletics: { isActive: false, initDate: null, endDate: null }
            }
        };
        mockAuthContext.updateUser = jest.fn().mockResolvedValue({ status: 200 });
        useAuth.mockReturnValue(mockAuthContext);

        mockIsSubscriptionExpired(false, false);

    });

    it("displays message if user is not logged in", () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MySubscriptions /></BrowserRouter>);
        expect(screen.getByText("Debes iniciar sesión para acceder a tus abonos")).toBeInTheDocument();
    });

    it("renders both gym and athletics cards", () => {
        render(<BrowserRouter><MySubscriptions /></BrowserRouter>);
        expect(screen.getByText("GIMNASIO MENSUAL")).toBeInTheDocument();
        expect(screen.getByText("ATLETISMO MENSUAL")).toBeInTheDocument();
    });

    it("displays active subscription information and unsubscribe button for gym", () => {
        render(<BrowserRouter><MySubscriptions /></BrowserRouter>);
        const gimnasioCard = screen.getByText("GIMNASIO MENSUAL").closest(".card-no-hover");
        expect(within(gimnasioCard).getByText("Abono activo")).toBeInTheDocument();
        expect(within(gimnasioCard).getByRole("button", { name: /Darme de baja/i })).toBeInTheDocument();
    });

    it("displays 'Abono inactivo' if there is no subscription in athletics", () => {
        render(<BrowserRouter><MySubscriptions /></BrowserRouter>);
        const atletismoCard = screen.getByText("ATLETISMO MENSUAL").closest(".card-no-hover");
        expect(within(atletismoCard).getByText("Abono inactivo")).toBeInTheDocument();
    });

    it("shows corresponding discharge message on both cards", () => {
        render(<BrowserRouter><MySubscriptions /></BrowserRouter>);
        expect(screen.getByText((content) =>
            content.includes("Fecha alta:") && content.includes("1 de enero de 2024")
        )).toBeInTheDocument();
    
        expect(screen.getByText((content) =>
            content.includes("Fecha de alta:") && content.includes("1 de febrero de 2024")
        )).toBeInTheDocument();
    });
    
    it("displays 'No estás dado de alta' message if registration is false", () => {
        mockAuthContext.user.registration.gym.isActive = false;
        mockAuthContext.user.registration.athletics.isActive = false;
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MySubscriptions /></BrowserRouter>);
        expect(screen.getAllByText(/No estás dado de alta/)).toHaveLength(2);
    });

    it("calls updateUser and shows success in unsubscribing from gym", async () => {
        render(<BrowserRouter><MySubscriptions /></BrowserRouter>);
        const btn = screen.getByRole("button", { name: /Darme de baja/i });
        fireEvent.click(btn);

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith("123", expect.objectContaining({
                subscription: expect.objectContaining({
                    gym: {
                        isActive: false,
                        initDate: null,
                        endDate: null
                    }
                })
            }));
            expect(toast.success).toHaveBeenCalledWith("Baja completada con éxito!");
        });
    });

    it("calls updateUser and shows success in unsubscribing from athletics", async () => {
        mockAuthContext.user.subscription.athletics.isActive = true;
        mockAuthContext.user.subscription.athletics.initDate = "2025-01-01";
        mockAuthContext.user.subscription.athletics.endDate = "2029-01-01";
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MySubscriptions /></BrowserRouter>);
        const btn = screen.getAllByRole("button", { name: /Darme de baja/i })[1];
        fireEvent.click(btn);

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith("123", expect.objectContaining({
                subscription: expect.objectContaining({
                    athletics: {
                        isActive: false,
                        initDate: null,
                        endDate: null
                    }
                })
            }));
            expect(toast.success).toHaveBeenCalledWith("Baja completada con éxito!");
        });
    });

    it("show error message if updateUser fails for gym", async () => {
        mockAuthContext.updateUser = jest.fn().mockRejectedValue({ status: 500 });
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MySubscriptions /></BrowserRouter>);
        const btn = screen.getByRole("button", { name: /Darme de baja/i });
        fireEvent.click(btn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Se ha producido un error al dar de baja. Inténtalo de nuevo más tarde.");
        });
    });

    it("show error message if updateUser fails for athletics", async () => {
        mockAuthContext.user.subscription.athletics.isActive = true;
        mockAuthContext.user.subscription.athletics.initDate = "2025-01-01";
        mockAuthContext.user.subscription.athletics.endDate = "2029-01-01";
        mockAuthContext.updateUser = jest.fn().mockRejectedValue({ status: 500 });
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MySubscriptions /></BrowserRouter>);
        const btn = screen.getAllByRole("button", { name: /Darme de baja/i })[1];
        fireEvent.click(btn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Se ha producido un error al dar de baja. Inténtalo de nuevo más tarde.");
        });
    });

    it("render subscription dates correctly", () => {
        render(<BrowserRouter><MySubscriptions /></BrowserRouter>);

        const gymCard = screen.getByText("GIMNASIO MENSUAL").closest(".card-no-hover");
        expect(within(gymCard).getByText((text) =>
            text.includes("Fecha alta:") && text.includes("1 de marzo de 2024")
        )).toBeInTheDocument();
          
          expect(within(gymCard).getByText((text) =>
            text.includes("Fecha caducidad:") && text.includes("1 de abril de 2024")
        )).toBeInTheDocument();
    });

    it("renders correctly 'Abono inactivo' in athletics", () => {
        mockAuthContext.user.subscription.gym.isActive = false;

        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MySubscriptions /></BrowserRouter>);
    
        const gymCard = screen.getByText("GIMNASIO MENSUAL").closest(".card-no-hover");
        expect(within(gymCard).getByText("Abono inactivo")).toBeInTheDocument();
    });

    it("show 'Abono caducado' for gym if end date is past", () => {
        mockIsSubscriptionExpired(true, false);
    
        mockAuthContext.user.subscription.gym = {
            isActive: false,
            initDate: "2025-01-01",
            endDate: "2025-02-01",
        };
    
        useAuth.mockReturnValue(mockAuthContext);
        render(<BrowserRouter><MySubscriptions /></BrowserRouter>);
    
        const gimnasioCard = screen.getByText("GIMNASIO MENSUAL").closest(".card-no-hover");
        expect(within(gimnasioCard).getByText("Abono caducado")).toBeInTheDocument();
    });
    
    it("show 'Abono caducado' for athletics if end date is past", () => {
        mockIsSubscriptionExpired(false, true);
    
        mockAuthContext.user.subscription.athletics = {
            isActive: false,
            initDate: "2025-01-01",
            endDate: "2025-02-01",
        };
    
        render(<BrowserRouter><MySubscriptions /></BrowserRouter>);
    
        const atletismoCard = screen.getByText("ATLETISMO MENSUAL").closest(".card-no-hover");
        expect(within(atletismoCard).getByText("Abono caducado")).toBeInTheDocument();
    });
});
