import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card Component", () => {
    it("renders the component without errors", () => {
        render(<Card description="Test Description" />);
        expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
    });

    it("renders with default className 'card' when no className prop is provided", () => {
        const { container } = render(<Card description="Test Description" />);
        const cardElement = container.querySelector('.card');
        expect(cardElement).toHaveClass("card");
    });

    it("renders with additional className when className prop is provided", () => {
        const { container } = render(<Card className="custom-class" description="Test Description" />);
        const cardElement = container.querySelector('.card.custom-class');
        expect(cardElement).toHaveClass("card");
        expect(cardElement).toHaveClass("custom-class");
    });

    it("displays the correct description", () => {
        render(<Card description="This is a test description for the card." />);
        expect(screen.getByText("This is a test description for the card.")).toBeInTheDocument();
    });

    it("renders the img tag when img prop is provided", () => {
        const imgSrc = "test-image.png";
        render(<Card img={imgSrc} description="Test Description" />);
        const imgElement = document.querySelector('img.card-img');
        expect(imgElement).toBeInTheDocument();
        expect(imgElement).toHaveAttribute("src", imgSrc);
        expect(imgElement).toHaveClass("card-img");
    });
    it("does not render the img tag when img prop is not provided", () => {
        render(<Card description="Test Description" />);
        console.log(screen.debug());
        const imgElement = screen.queryByRole('img');
        expect(imgElement).not.toBeInTheDocument();
    });
});