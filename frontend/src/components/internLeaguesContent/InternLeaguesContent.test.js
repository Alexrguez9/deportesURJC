import { render, screen } from "@testing-library/react";
import MainLigasInternas from "./InternLeaguesContent";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    Link: ({ to, children }) => <a href={to}>{children}</a>, // Mock Link for testing purposes
}));

describe("MainLigasInternas Component", () => {
    beforeEach(() => {
        render(<MainLigasInternas />);
    });

    it("renders the component without errors", () => {
        expect(screen.getByRole('heading', { name: /Ligas Internas/i })).toBeInTheDocument();
    });

    it("displays the correct heading", () => {
        expect(screen.getByRole('heading', { name: /Ligas Internas/i })).toBeInTheDocument();
    });

    it("displays the introductory paragraph with correct text", () => {
        expect(screen.getByText(/Bienvenido a la página de Ligas Internas de URJC Deportes./i)).toBeInTheDocument();
        expect(screen.getByText(/Aquí podrás consultar los encuentros y clasificaciones de las Ligas Internas./i)).toBeInTheDocument();
    });

    it("renders two Link components with correct 'to' props", () => {
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);

        expect(links[0]).toHaveAttribute('href', '/ligas-internas/encuentros');
        expect(links[1]).toHaveAttribute('href', '/ligas-internas/clasificaciones');
    });

    it("renders two Card components with correct 'description' and 'className' props", () => {
        const cards = screen.getAllByRole('link').map(link => link.firstChild); // Get Card components from Links
        expect(cards).toHaveLength(2);

        expect(cards[0]).toBeInTheDocument();
        expect(cards[0]).toHaveClass("horizontal-card");
        expect(screen.getByText("Encuentros", { container: cards[0] })).toBeInTheDocument();

        expect(cards[1]).toBeInTheDocument();
        expect(cards[1]).toHaveClass("horizontal-card");
        expect(screen.getByText("Clasificaciones", { container: cards[1] })).toBeInTheDocument();
    });
});
