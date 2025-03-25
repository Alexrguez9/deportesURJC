import { render, screen, waitFor } from "@testing-library/react";
import UserDetail from "./UserDetail";
import { useAuth } from "../../../../context/AuthContext";
import { useParams, BrowserRouter } from "react-router-dom";
import { mockAuthContext } from "../../../../utils/mocks";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn(),
}));

jest.mock("../../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

describe("UserDetail Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
    });

    it("renders loading spinner initially", async () => {
        useParams.mockReturnValue({ id: '1' });
        mockAuthContext.getAllUsers.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50)));
        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );
        await waitFor(() => {
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    it("fetches and displays full user details correctly including subscriptions", async () => {
        useParams.mockReturnValue({ id: '1' });
        const mockUser = {
            _id: "1",
            name: "Test User",
            email: "test@user.com",
            role: "user",
            registration: {
                gym: { isActive: true, initDate: "2024-01-01", endDate: "2024-12-31" },
                athletics: { isActive: false }
            },
            subscription: {
                gym: { isActive: true, initDate: "2024-01-01", endDate: "2025-01-01" },
                athletics: { isActive: false }
            },
            balance: 42
        };
        mockAuthContext.getAllUsers.mockResolvedValue([mockUser]);

        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Detalles del Usuario")).toBeInTheDocument();
        
            expect(screen.getByText("ID:").nextElementSibling).toHaveTextContent(mockUser._id);
            expect(screen.getByText("Nombre:").nextElementSibling).toHaveTextContent(mockUser.name);
            expect(screen.getByText("Email:").nextElementSibling).toHaveTextContent(mockUser.email);
            expect(screen.getByText("Rol:").nextElementSibling).toHaveTextContent(mockUser.role);
        
            expect(screen.getByText("Alta GYM:").nextElementSibling).toHaveTextContent("Sí");

            const allInicioGYM = screen.getAllByText("Inicio GYM:");
            expect(allInicioGYM[0].nextElementSibling).toHaveTextContent(mockUser.registration.gym.initDate);
            expect(allInicioGYM[1].nextElementSibling).toHaveTextContent(mockUser.subscription.gym.initDate);

            expect(screen.getByText("Alta Atletismo:").nextElementSibling).toHaveTextContent("No");

            const allFinGYM = screen.getAllByText("Fin GYM:");
            expect(allFinGYM[0].nextElementSibling).toHaveTextContent(mockUser.registration.gym.endDate);
            expect(allFinGYM[1].nextElementSibling).toHaveTextContent(mockUser.subscription.gym.endDate);
        
            expect(screen.getByText("Saldo:").nextElementSibling).toHaveTextContent(`${mockUser.balance} €`);
        });
        
    });

    it("does not show subscription dates if isActive is false", async () => {
        useParams.mockReturnValue({ id: '1' });
        const mockUser = {
            _id: "1",
            name: "Test User",
            email: "test@user.com",
            role: "user",
            subscription: {
                gym: { isActive: false },
                athletics: { isActive: false }
            },
            balance: 50
        };
        mockAuthContext.getAllUsers.mockResolvedValue([mockUser]);

        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Suscripción GYM:")).toBeInTheDocument();
            expect(screen.queryByText("Inicio GYM:")).not.toBeInTheDocument();
            expect(screen.queryByText("Fin GYM:")).not.toBeInTheDocument();

            expect(screen.getByText("Suscripción Atletismo:")).toBeInTheDocument();
            expect(screen.queryByText("Inicio Atletismo:")).not.toBeInTheDocument();
            expect(screen.queryByText("Fin Atletismo:")).not.toBeInTheDocument();
        });
    });

    it("displays 'Usuario no encontrado.' when user is not found", async () => {
        useParams.mockReturnValue({ id: 'non-existent' });
        mockAuthContext.getAllUsers.mockResolvedValue([]);

        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Usuario no encontrado.")).toBeInTheDocument();
        });
    });

    // Ya existentes pero siguen siendo válidos:
    it("displays 'No' when registration.gym.isActive is false", async () => {
        useParams.mockReturnValue({ id: '1' });
        const mockUser = { _id: "1", name: "Test", email: "test@user.com", role: "user", registration: { gym: { isActive: false } }, balance: 10 };
        mockAuthContext.getAllUsers.mockResolvedValue([mockUser]);

        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );

        await waitFor(() => {
            const label = screen.getByText("Alta GYM:");
            expect(label.nextElementSibling).toHaveTextContent("No");
        });
    });

    it("does not display GYM start/end dates if registration.gym.isActive is false", async () => {
        useParams.mockReturnValue({ id: '1' });
        const mockUser = { _id: "1", name: "Test", email: "test@user.com", role: "user", registration: { gym: { isActive: false } }, balance: 10 };
        mockAuthContext.getAllUsers.mockResolvedValue([mockUser]);

        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText("Inicio GYM:")).not.toBeInTheDocument();
            expect(screen.queryByText("Fin GYM:")).not.toBeInTheDocument();
        });
    });

    it('displays "Sí" when subscription.athletics.isActive is true', async () => {
        useParams.mockReturnValue({ id: '1' });
        const mockUser = [{
            _id: "1",
            name: "Test",
            email: "test@user.com",
            role: "user",
            registration: { gym: { isActive: false }, athletics: { isActive: true, initDate: "2024-01-01", endDate: "2024-12-31" } },
            subscription: { athletics: { isActive: true, initDate: "2024-01-01", endDate: "2025-01-01" } },
            balance: 10
        }];
        mockAuthContext.getAllUsers.mockResolvedValue(mockUser);

        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );

        await waitFor(() => {
            const label = screen.getByText("Alta Atletismo:");
            expect(label.nextElementSibling).toHaveTextContent("Sí");
        });
    });
});
