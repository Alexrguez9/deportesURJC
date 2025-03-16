import { render, screen } from "@testing-library/react";
import Home from "./Home";
import { BrowserRouter } from 'react-router-dom';

describe("Home Component", () => {
    it("renders the component with all sections and titles", () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );
        expect(screen.getByRole("heading", { level: 1, name: /inicio/i })).toBeInTheDocument();
        expect(screen.getByText(/Bienvenido a la página de inicio de URJC Deportes/i)).toBeInTheDocument();

        expect(screen.getByRole("heading", { level: 2, name: /Ligas Internas/i })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 2, name: /Salas de preparación/i })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 2, name: /Instalaciones deportivas/i })).toBeInTheDocument();
    });

    it("renders 'Ligas Internas' section with correct links", () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );
        expect(screen.getByRole("heading", { level: 2, name: /Ligas Internas/i })).toBeInTheDocument();

        const encuentrosLink = screen.getByRole("link", { name: /encuentros/i });
        expect(encuentrosLink).toBeInTheDocument();
        expect(encuentrosLink.closest('a')).toHaveAttribute('href', '/ligas-internas/encuentros');

        const clasificacionesLink = screen.getByRole("link", { name: /clasificaciones/i });
        expect(clasificacionesLink).toBeInTheDocument();
        expect(clasificacionesLink.closest('a')).toHaveAttribute('href', '/ligas-internas/clasificaciones');
    });

    it("renders 'Salas de preparación y gimnasio' section with correct links", () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );
        expect(screen.getByRole("heading", { level: 2, name: /Salas de preparación/i })).toBeInTheDocument();

        const altaUsuariosLink = screen.getByRole("link", { name: /Altas en salas de preparación/i });
        expect(altaUsuariosLink).toBeInTheDocument();
        expect(altaUsuariosLink.closest('a')).toHaveAttribute('href', '/salas-preparacion/alta');

        const pagoAbonoLink = screen.getByRole("link", { name: /Pago mensual abonos/i });
        expect(pagoAbonoLink).toBeInTheDocument();
        expect(pagoAbonoLink.closest('a')).toHaveAttribute('href', '/salas-preparacion/pago-abono');

        const reservasPreparacionLink = screen.getByRole("link", { name: /Reservas de instalaciones/i })
        expect(reservasPreparacionLink).toBeInTheDocument();
        expect(reservasPreparacionLink.closest('a')).toHaveAttribute('href', '/instalaciones');
    });

    it("renders 'Instalaciones deportivas' section with correct links", () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByRole("heading", { level: 2, name: /Instalaciones deportivas/i })).toBeInTheDocument();

        const instalacionesLink = screen.getByRole("link", { name: /Reservas de instalaciones/i });
        expect(instalacionesLink).toBeInTheDocument();
        expect(instalacionesLink.closest('a')).toHaveAttribute('href', '/instalaciones');
    });

    it("renders all cards with descriptions", () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByRole("link", { name: /encuentros/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /clasificaciones/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Altas en salas de preparación/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Pago mensual abonos/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Reservas de instalaciones/i })).toBeInTheDocument();
    });
});