import React from 'react';
import { render, screen } from "@testing-library/react";
import ContentAdminPanel from "./ContentAdminPanel";
import { useAuth } from '../../context/AuthContext';
import { mockAuthContext } from "../../utils/mocks";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    Link: ({ to, children, className }) => <a href={to} className={className}>{children}</a>, // Mock Link for testing purposes
}));

jest.mock('../../components/backButton/BackButton', () => () => <button>Volver</button>);

jest.mock('../../context/AuthContext', () => ({
    useAuth: jest.fn()
}));
describe("ContentAdminPanel Component", () => {
    beforeEach(() => {
        useAuth.mockReturnValue(mockAuthContext);
        // Ensure user is also mocked with a truthy value for admin tests
        mockAuthContext.user = { name: 'Test User' }; // Add a mock user object
    });

    it("renders the component without errors", () => {
        mockAuthContext.isAdmin.mockReturnValue(true);
        render(<ContentAdminPanel />);
        expect(screen.getByRole('heading', { name: /Panel de administrador/i })).toBeInTheDocument();
    });

    it("displays the correct heading for admin users", () => {
        mockAuthContext.isAdmin.mockReturnValue(true);
        render(<ContentAdminPanel />);
        expect(screen.getByRole('heading', { name: /Panel de administrador/i })).toBeInTheDocument();
    });

    it("displays the introductory paragraph for admin users", () => {
        mockAuthContext.isAdmin.mockReturnValue(true);
        render(<ContentAdminPanel />);
        expect(screen.getByText(/Bienvenido a la portada de administrador de la Liga Interna de URJC Deportes./i)).toBeInTheDocument();
    });

    it("renders AccessDenied component when user is not an admin", () => {
        mockAuthContext.isAdmin.mockReturnValue(false);
        render(<ContentAdminPanel />);
        expect(screen.getByRole('heading', { name: /Acceso denegado/i })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: /Panel de administrador/i })).not.toBeInTheDocument();
    });

    it("renders BackButton component for admin users", () => {
        mockAuthContext.isAdmin.mockReturnValue(true);
        render(<ContentAdminPanel />);
        expect(screen.getByRole('button', { name: /Volver/i })).toBeInTheDocument();
    });

    it("renders all admin Links with correct 'to' and text for admin users", () => {
        mockAuthContext.isAdmin.mockReturnValue(true);
        render(<ContentAdminPanel />);
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(5);

        const expectedLinks = [
            { to: "/ligas-internas/encuentros", text: "Editar resultados" },
            { to: "/admin-panel/admin-equipos", text: "Editar equipos" },
            { to: "/admin-panel/admin-usuarios", text: "Editar usuarios" },
            { to: "/admin-panel/admin-reservas", text: "Editar reservas" },
            { to: "/admin-panel/admin-instalaciones", text: "Editar instalaciones" },
        ];

        expectedLinks.forEach((expectedLink, index) => {
            expect(links[index]).toHaveAttribute('href', expectedLink.to);
            expect(links[index]).toHaveTextContent(expectedLink.text);
        });
    });

    it("does not render admin Links when user is not admin", () => {
        mockAuthContext.isAdmin.mockReturnValue(false);
        render(<ContentAdminPanel />);
        const links = screen.queryAllByRole('link');
        expect(links).toHaveLength(0);
    });
});