import { render, screen, fireEvent } from "@testing-library/react";
import BackButton from "./BackButton";
import { useNavigate } from 'react-router-dom';

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

describe("BackButton Component", () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        useNavigate.mockReturnValue(mockNavigate);
        jest.clearAllMocks();
    });

    it("renders the component without errors", () => {
        render(<BackButton />);
        expect(screen.getByRole('button', { name: /Volver/i })).toBeInTheDocument();
    });

    it("renders a button with 'back-button' class", () => {
        render(<BackButton />);
        const buttonElement = screen.getByRole('button', { name: /Volver/i });
        expect(buttonElement).toHaveClass("back-button");
    });

    it("displays the correct text and arrow icon", () => {
        render(<BackButton />);
        expect(screen.getByRole('button', { name: /Volver/i })).toHaveTextContent("⭠ Volver");
    });

    it("calls navigate(-1) when the button is clicked", () => {
        render(<BackButton />);
        const buttonElement = screen.getByRole('button', { name: /Volver/i });
        fireEvent.click(buttonElement);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
});