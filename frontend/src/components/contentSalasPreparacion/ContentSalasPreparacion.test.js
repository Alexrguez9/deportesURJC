import React from 'react';
import { render, screen } from "@testing-library/react";
import ContentSalasPreparacion from "./ContentSalasPreparacion";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    Link: ({ to, children }) => <a href={to}>{children}</a>, // Mock Link for testing purposes
}));

describe("ContentSalasPreparacion Component", () => {
    beforeEach(() => {
        render(<ContentSalasPreparacion />);
        console.log("ContentSalasPreparacion rendered:", screen.debug());
    });

    it("renders the component without errors", () => {
        expect(screen.getByRole('heading', { name: /Salas y Gimnasio/i })).toBeInTheDocument();
    });

    it("displays the correct heading", () => {
        expect(screen.getByRole('heading', { name: /Salas y Gimnasio/i })).toBeInTheDocument();
    });

    it("displays the introductory paragraph with correct text", () => {
        expect(screen.getByText(/Bienvenido a la página de Salas y Gimnasio de URJC Deportes./i)).toBeInTheDocument();
        expect(screen.getByText(/Aquí podrás darte de alta en las salas de preparacion y hacer reservas en estas salas./i)).toBeInTheDocument();
        expect(screen.getByText(/Además, podrás recargar tu mensualidad./i)).toBeInTheDocument();
    });

    it("renders three Link components with correct 'to' props", () => {
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(3);

        expect(links[0]).toHaveAttribute('href', 'alta');
        expect(links[1]).toHaveAttribute('href', 'pago-abono');
        expect(links[2]).toHaveAttribute('href', 'reservas-preparacion');
    });

    it("renders three Card components with correct 'description' and 'className' props", () => {
        const cards = screen.getAllByRole('link').map(link => link.firstChild);
        expect(cards).toHaveLength(3);

        expect(cards[0]).toBeInTheDocument();
        expect(cards[0]).toHaveClass("encuentros-card");
        expect(screen.getByText("Alta de usuarios - Salas de preparación física", { container: cards[0] })).toBeInTheDocument();

        expect(cards[1]).toBeInTheDocument();
        expect(cards[1]).toHaveClass("home-card");
        expect(screen.getByText("Pago mensual Abono", { container: cards[1] })).toBeInTheDocument();

        expect(cards[2]).toBeInTheDocument();
        expect(cards[2]).toHaveClass("clasificaciones-card");
        expect(screen.getByText("Reserva de espacio - Salas de preparación física", { container: cards[2] })).toBeInTheDocument();
    });
});