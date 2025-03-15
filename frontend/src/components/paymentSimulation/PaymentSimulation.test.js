import { render, screen, fireEvent } from "@testing-library/react";
import PaymentSimulation from "./PaymentSimulation";

describe("PaymentSimulation Component", () => {
    const mockOnPayment = jest.fn();
    const externalPrice = 100;

    beforeEach(() => {
        jest.clearAllMocks();
        render(<PaymentSimulation externalPrice={externalPrice} onPayment={mockOnPayment} />);
    });

    it("renders the component with the correct price", () => {
        expect(screen.getByRole('heading', { name: /Formulario de Pago/i })).toBeInTheDocument();
        expect(document.querySelector('.price').textContent).toBe(`Precio: ${externalPrice}€`);
    });

    it("shows error messages for invalid card number", () => {
        const cardNumberInput = screen.getByLabelText(/Número de Tarjeta/i);
        fireEvent.change(cardNumberInput, { target: { value: '1234' } });
        fireEvent.blur(cardNumberInput); // Trigger validation on blur
        fireEvent.click(screen.getByRole('button', { name: /Pagar/i })); // Try to submit to show errors

        expect(screen.getByText('El número de tarjeta debe contener 16 dígitos.')).toBeInTheDocument();
    });

    it("shows error messages for invalid card holder name", () => {
        const cardHolderInput = screen.getByLabelText(/Nombre del Titular/i);
        fireEvent.change(cardHolderInput, { target: { value: 'ab' } });
        fireEvent.blur(cardHolderInput);
        fireEvent.click(screen.getByRole('button', { name: /Pagar/i }));

        expect(screen.getByText('El nombre del titular debe tener al menos 3 caracteres.')).toBeInTheDocument();
    });

    it("shows error messages for invalid expiry date format", () => {
        const expiryDateInput = screen.getByLabelText(/Fecha de Expiración/i);
        fireEvent.change(expiryDateInput, { target: { value: '2024' } });
        fireEvent.blur(expiryDateInput);
        fireEvent.click(screen.getByRole('button', { name: /Pagar/i }));

        expect(screen.getByText('La fecha de expiración debe tener el formato MM/AA.')).toBeInTheDocument();
    });

    it("shows error messages for invalid CVV", () => {
        const cvvInput = screen.getByLabelText(/CVV/i);
        fireEvent.change(cvvInput, { target: { value: '12' } });
        fireEvent.blur(cvvInput);
        fireEvent.click(screen.getByRole('button', { name: /Pagar/i }));

        expect(screen.getByText('El CVV debe contener 3 dígitos.')).toBeInTheDocument();
    });

    it("calls onPayment prop when form is valid", () => {
        const cardNumberInput = screen.getByLabelText(/Número de Tarjeta/i);
        const cardHolderInput = screen.getByLabelText(/Nombre del Titular/i);
        const expiryDateInput = screen.getByLabelText(/Fecha de Expiración/i);
        const cvvInput = screen.getByLabelText(/CVV/i);
        const payButton = screen.getByRole('button', { name: /Pagar/i });

        fireEvent.change(cardNumberInput, { target: { value: '1234567890123456' } });
        fireEvent.change(cardHolderInput, { target: { value: 'Card Holder Name' } });
        fireEvent.change(expiryDateInput, { target: { value: '12/25' } });
        fireEvent.change(cvvInput, { target: { value: '123' } });
        fireEvent.click(payButton);

        expect(mockOnPayment).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('El número de tarjeta debe contener 16 dígitos.')).not.toBeInTheDocument();
        expect(screen.queryByText('El nombre del titular debe tener al menos 3 caracteres.')).not.toBeInTheDocument();
        expect(screen.queryByText('La fecha de expiración debe tener el formato MM/AA.')).not.toBeInTheDocument();
        expect(screen.queryByText('El CVV debe contener 3 dígitos.')).not.toBeInTheDocument();
    });

    it("does not call onPayment prop when form is invalid", () => {
        fireEvent.click(screen.getByRole('button', { name: /Pagar/i }));
        expect(mockOnPayment).not.toHaveBeenCalled();
    });

    it("hides error messages when input becomes valid after being invalid", () => {
        const cardNumberInput = screen.getByLabelText(/Número de Tarjeta/i);
        const payButton = screen.getByRole('button', { name: /Pagar/i });
    
        // Initially invalid
        fireEvent.change(cardNumberInput, { target: { value: '1234' } });
        fireEvent.blur(cardNumberInput);
    
        fireEvent.click(payButton);
    
        expect(screen.getByText('El número de tarjeta debe contener 16 dígitos.')).toBeInTheDocument();
    
        // Make it valid
        fireEvent.change(cardNumberInput, { target: { value: '1234567890123456' } });
        fireEvent.blur(cardNumberInput);
        fireEvent.click(payButton);
    
        expect(screen.queryByText('El número de tarjeta debe contener 16 dígitos.')).not.toBeInTheDocument();
    });
});