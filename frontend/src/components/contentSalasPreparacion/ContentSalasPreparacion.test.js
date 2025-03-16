import { render, screen } from "@testing-library/react";
import ContentSalasPreparacion from "./ContentSalasPreparacion";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    Link: ({ to, children }) => <a href={to}>{children}</a>, // Mock Link for testing purposes
}));

describe("ContentSalasPreparacion Component", () => {
    beforeEach(() => {
        render(<ContentSalasPreparacion />);
    });

    it("renders the component without errors", () => {
        expect(screen.getByRole('heading', { name: /Salas de preparación/i })).toBeInTheDocument();
    });
});