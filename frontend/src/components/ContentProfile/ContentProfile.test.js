import { render, screen } from "@testing-library/react";
import ContentProfile from "./ContentProfile";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    Link: ({ to, children }) => <a href={to}>{children}</a>, // Mock Link for testing purposes
}));

describe("ContentProfile Component", () => {
    beforeEach(() => {
        render(<ContentProfile />);
    });

    it("renders the component without errors", () => {
        expect(screen.getByRole('heading', { name: /Profile/i })).toBeInTheDocument();
    });

    it("displays the correct heading", () => {
        expect(screen.getByRole('heading', { name: /Profile/i })).toBeInTheDocument();
    });

    it("displays the introductory paragraph with correct text", () => {
        expect(screen.getByText(/Bienvenido a la página de Profile de URJC Deportes./i)).toBeInTheDocument();
        expect(screen.getByText(/Aquí podrás ver y gestionar tus reservas, así como tus datos./i)).toBeInTheDocument();
    });

    it("renders two Link components with correct 'to' props", () => {
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);

        expect(links[0]).toHaveAttribute('href', 'consultar-perfil');
        expect(links[1]).toHaveAttribute('href', 'mis-reservas');
    });
});
