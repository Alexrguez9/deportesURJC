import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
import Login from "./Login";
import { useAuth } from "../../../context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { mockAuthContext } from "../../../utils/mocks";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

describe("Login Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
    });

    it("renders login and register forms", () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
        const loginForm = document.querySelector('#login-form');
        const registerForm = document.querySelector('#register-form');
        expect(loginForm).toBeInTheDocument();
        expect(registerForm).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /registrarse/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
    });

    it("handles successful login", async () => {
        const mockNavigate = jest.fn();
        jest.mock("react-router-dom", () => ({
            ...jest.requireActual("react-router-dom"),
            useNavigate: () => mockNavigate,
        }));
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
        const loginForm = document.querySelector('#login-form');
        const loginButton = within(loginForm).getByRole('button', { name: /Iniciar sesión/i });
        const emailInput = within(loginForm).getByLabelText(/email:/i, { selector: 'input' });
        const passwordInput = within(loginForm).getByLabelText(/contraseña:/i, { selector: 'input' });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        fireEvent.click(loginButton);

        await waitFor(async () => {
            expect(mockAuthContext.login).toHaveBeenCalled();
        });
    });

    it("handles failed login and displays error message", async () => {
        mockAuthContext.login.mockResolvedValue({ status: 401 });
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
        const loginForm = document.querySelector('#login-form');
        const loginButton = within(loginForm).getByRole('button', { name: /iniciar sesión/i });
        const emailInput = within(loginForm).getByLabelText(/email:/i, { selector: 'input' });
        const passwordInput = within(loginForm).getByLabelText(/contraseña:/i, { selector: 'input' });

        fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByText(/email o contraseña incorrectos/i)).toBeInTheDocument();
        });
    });

    it("handles registration error - email already in use", async () => {
        mockAuthContext.user = null;
        mockAuthContext.getAllUsers.mockResolvedValue([{ _id: "1", email: "user1@test.com"}]);
        mockAuthContext.addUser.mockResolvedValue({ ok: false, status: 500 });
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
        const registerForm = document.querySelector('#register-form');
        const registerButton = within(registerForm).getByRole('button', { name: /registrarse/i });
        const nameInput = within(registerForm).getByLabelText(/nombre:/i, { selector: 'input' });
        const emailInput = within(registerForm).getByLabelText(/email:/i, { selector: 'input' });
        const passwordInput = within(registerForm).getByLabelText(/^contraseña:/i, { selector: 'input' });
        const repeatPasswordInput = within(registerForm).getByLabelText(/repetir contraseña:/i, { selector: 'input' });

        fireEvent.change(nameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'user1@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(repeatPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(registerButton);

        await waitFor(() => {
            expect(screen.getByText(/email ya en uso/i)).toBeInTheDocument();
        });
    });

     it("handles generic registration error", async () => {
        mockAuthContext.addUser.mockResolvedValue({ ok: false, status: 400 }); // Simulate other error
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
        const registerForm = document.querySelector('#register-form');
        const registerButton = within(registerForm).getByRole('button', { name: /registrarse/i });
        const nameInput = within(registerForm).getByLabelText(/nombre:/i, { selector: 'input' });
        const emailInput = within(registerForm).getByLabelText(/email:/i, { selector: 'input' });
        const passwordInput = within(registerForm).getByLabelText(/^contraseña:/i, { selector: 'input' }); // Use ^ to specify start of line for password label
        const repeatPasswordInput = within(registerForm).getByLabelText(/repetir contraseña:/i, { selector: 'input' });

        fireEvent.change(nameInput, { target: { value: 'New User' } });
        fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(repeatPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(registerButton);

        await waitFor(() => {
            expect(screen.getByText(/se ha producido un error. por favor, inténtalo de nuevo./i)).toBeInTheDocument();
        });
    });

    it("displays email validation error on register form", async () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
        const registerForm = document.querySelector('#register-form');
        const emailInput = within(registerForm).getByLabelText(/email:/i, { selector: 'input'});
        fireEvent.focus(emailInput);
        fireEvent.blur(emailInput);
        expect(screen.getByText(/Por favor, introduce un email válido/i)).toBeInTheDocument();

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);
        await waitFor(() => {
            expect(screen.getByText(/Por favor, introduce un email válido/i)).toBeInTheDocument();
        });
    });

    it("displays password validation error on register form - password too short", async () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
        const registerForm = document.querySelector('#register-form');
        const passwordInput = within(registerForm).getByLabelText(/^contraseña:/i, { selector: 'input'});
        fireEvent.focus(passwordInput);
        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.blur(passwordInput);
        await waitFor(() => {
            expect(screen.getByText(/la contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
        });
    });
});
