import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { mockAuthContext } from "../../utils/mocks";

jest.mock("../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn()
}));

describe("Header Component", () => {
    let mockLogout, mockNavigate;

    beforeEach(() => {
        mockLogout = jest.fn();
        mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);
    });

    test("displays the login button if the user is not authenticated", () => {
        useAuth.mockReturnValue({ user: null, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByText("Iniciar sesión")).toBeInTheDocument();
    });

    test("displays the user's name if authenticated", () => {
        useAuth.mockReturnValue({ user: { name: "Juan" }, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    test("logs out and redirects the user by clicking on Logout button", () => {
        useAuth.mockReturnValue({ user: { name: "Juan" }, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        
        fireEvent.click(screen.getByText("Cerrar sesión"));
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    test("displays the link to the admin panel if the user is admin", () => {
        useAuth.mockReturnValue({ user: { name: "Admin" }, logout: mockLogout, isAdmin: () => true });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByText("Panel Admin")).toBeInTheDocument();
    });

    test("shows all main links", () => {
        useAuth.mockReturnValue({ user: null, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByText("Inicio")).toBeInTheDocument();
        expect(screen.getByText("Ligas Internas")).toBeInTheDocument();
        expect(screen.getByText("Salas y gimnasio")).toBeInTheDocument();
        expect(screen.getByText("Instalaciones")).toBeInTheDocument();
        expect(screen.getByText("Recargar monedero")).toBeInTheDocument();
    });
    
    test("displays the dropdown links when clicking on the user's name", () => {
        useAuth.mockReturnValue({ user: { name: "Juan" }, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        fireEvent.click(screen.getByText("Juan"));
        expect(screen.getByText("Mi cuenta")).toBeInTheDocument();
        expect(screen.getByText("Mis reservas")).toBeInTheDocument();
        expect(screen.getByText("Mis abonos")).toBeInTheDocument();
    });

    test("verify the correct path of the links", () => {
        useAuth.mockReturnValue({ user: null, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
        expect(screen.getByRole('link', { name: 'Ligas Internas' })).toHaveAttribute('href', '/ligas-internas');
        expect(screen.getByRole('link', { name: 'Salas y gimnasio' })).toHaveAttribute('href', '/salas-preparacion');
        expect(screen.getByRole('link', { name: 'Instalaciones' })).toHaveAttribute('href', '/instalaciones');
        expect(screen.getByRole('link', { name: 'Recargar monedero' })).toHaveAttribute('href', '/monedero');
    });
    
    test("verify the logo link", () => {
        useAuth.mockReturnValue({ user: null, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByRole('img', { name: 'Logo URJC Deportes' }).closest('a')).toHaveAttribute('href', '/');
    });
    
    test("verifies that the logo is rendered", () => {
        useAuth.mockReturnValue({ user: null, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByAltText('Logo URJC Deportes')).toBeInTheDocument();
    });

    test("opens and closes the hamburger menu on mobile devices", async () => {
        useAuth.mockReturnValue({ user: { name: "Juan" }, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        window.innerWidth = 500;
        
        expect(document.querySelector('.nav-links').classList.contains('open')).toBe(false);

        await waitFor(() => fireEvent.click(document.querySelector('.hamburger-menu-icon')));
        expect(document.querySelector('.nav-links').classList.contains('open')).toBe(true);
        await waitFor(() => fireEvent.click(document.querySelector('.close-icon')));
        expect(document.querySelector('.nav-links').classList.contains('open')).toBe(false);
    });

    test("disables body scrolling when the menu is open", async () => {
        useAuth.mockReturnValue({ user: { name: "Juan" }, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        window.innerWidth = 500;

        fireEvent.click(document.querySelector('.hamburger-menu-icon'));
        await waitFor(() => {
            expect(document.body.style.overflow).toBe('hidden');
        });
    });

    test("restores the body scroll when the menu is closedo", async () => {
        useAuth.mockReturnValue({ user: { name: "Juan" }, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );

        window.innerWidth = 500;

        fireEvent.click(document.querySelector('.hamburger-menu-icon'));
        fireEvent.click(document.querySelector('.close-icon'));
        await waitFor(() => {
            expect(document.body.style.overflow).toBe('auto');
        });
    });

    test("calls toggleMenu (within handleClick) on mobile when a link is clicked in the menu", async () => {
        useAuth.mockReturnValue({ user: { name: "Juan" }, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        window.innerWidth = 500;

        fireEvent.click(document.querySelector('.hamburger-menu-icon'));
        expect(document.querySelector('.nav-links').classList.contains('open')).toBe(true);
        fireEvent.click(screen.getByText("Instalaciones"));

        await waitFor(() => {
            expect(document.querySelector('.nav-links').classList.contains('open')).toBe(false);
        });
    });

    test("displays the link to the administration panel and calls toggleMenu when clicked", async () => {
        useAuth.mockReturnValue({ user: { name: "Admin" }, logout: mockLogout, isAdmin: () => true });
        mockAuthContext.user = { name: "Admin" , role: "admin" };
        mockAuthContext.isAdmin = jest.fn(() => true);
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );

        expect(screen.getByText("Panel Admin")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Panel Admin"));
        await waitFor(() => {
            expect(document.querySelector('.nav-links').classList.contains('open')).toBe(false);
        });
    });

    test("does not display the link to the administration panel when the user is not admin", () => {
        useAuth.mockReturnValue({ user: { name: "Juan", role: "user" }, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.queryByText("Panel Admin")).toBeNull();
    });

    test("does not display the link to the administration panel when the user is not admin", () => {
        useAuth.mockReturnValue({ user: { name: "Juan", role: "user" }, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
    
        expect(screen.queryByText("Panel Admin")).toBeNull();
    });
});
