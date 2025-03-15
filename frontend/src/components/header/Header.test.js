import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

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

    test("muestra el botón de iniciar sesión si el usuario no está autenticado", () => {
        useAuth.mockReturnValue({ user: null, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByText("Iniciar sesión")).toBeInTheDocument();
    });

    test("muestra el nombre del usuario si está autenticado", () => {
        useAuth.mockReturnValue({ user: { name: "Juan" }, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    test("cierra sesión y redirige al usuario al hacer clic en Cerrar sesión", () => {
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

    test("muestra el enlace al panel de administración si el usuario es admin", () => {
        useAuth.mockReturnValue({ user: { name: "Admin" }, logout: mockLogout, isAdmin: () => true });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByText("Panel Admin")).toBeInTheDocument();
    });

    test("muestra todos los enlaces principales", () => {
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
    
    test("muestra los enlaces del dropdown al hacer clic en el nombre del usuario", () => {
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
        expect(screen.getByText("Configuración")).toBeInTheDocument();
    });
    
    test("verifica la correcta ruta de los links", () => {
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
    
    test("verifica el link del logo", () => {
        useAuth.mockReturnValue({ user: null, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByRole('img', { name: 'Logo URJC Deportes' }).closest('a')).toHaveAttribute('href', '/');
    });
    
    test("verifica que el logo se renderiza", () => {
        useAuth.mockReturnValue({ user: null, logout: mockLogout, isAdmin: () => false });
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByAltText('Logo URJC Deportes')).toBeInTheDocument();
    });
});
