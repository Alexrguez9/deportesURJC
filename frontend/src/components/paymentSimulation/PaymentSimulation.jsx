import { useState } from 'react';
import './PaymentSimulation.css';
import PropTypes from 'prop-types';

const PaymentSimulation = ({ externalPrice, onPayment }) => {
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });
    const [formErrors, setFormErrors] = useState({});

    const validateForm = () => {
        const errors = {};

        if (!formData.cardNumber || !/^[0-9]{16}$/.test(formData.cardNumber)) {
            errors.cardNumber = 'El número de tarjeta debe contener 16 dígitos.';
        }
        if (!formData.cardHolder || formData.cardHolder.length < 3) {
            errors.cardHolder = 'El nombre del titular debe tener al menos 3 caracteres.';
        }
        if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
            errors.expiryDate = 'La fecha de expiración debe tener el formato MM/AA.';
        }
        if (!formData.cvv || !/^[0-9]{3}$/.test(formData.cvv)) {
            errors.cvv = 'El CVV debe contener 3 dígitos.';
        }

        return errors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validateForm();

        if (Object.keys(errors).length === 0) {
            setFormErrors({});
            onPayment(); // Calls the onPayment function passed as a prop (from the parent component)
        } else {
            setFormErrors(errors);
        }
    };

    return (
        <form className="payment-container" onSubmit={handleSubmit}>
            <h2>Formulario de Pago</h2>

            <div className="form-group">
                <label htmlFor="cardNumber">Número de Tarjeta</label>
                <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                />
                {formErrors.cardNumber && <p className="error-message">{formErrors.cardNumber}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="cardHolder">Nombre del Titular</label>
                <input
                    type="text"
                    id="cardHolder"
                    name="cardHolder"
                    value={formData.cardHolder}
                    onChange={handleInputChange}
                    placeholder="Nombre del titular"
                />
                {formErrors.cardHolder && <p className="error-message">{formErrors.cardHolder}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="expiryDate">Fecha de Expiración (MM/AA)</label>
                <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/AA"
                />
                {formErrors.expiryDate && <p className="error-message">{formErrors.expiryDate}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                />
                {formErrors.cvv && <p className="error-message">{formErrors.cvv}</p>}
            </div>

            <p className="price">Precio: <b>{externalPrice}€</b></p>

            <button type="submit" className="pay-button">Pagar</button>
        </form>
    );
};

PaymentSimulation.propTypes = {
    externalPrice: PropTypes.number.isRequired,
    onPayment: PropTypes.func.isRequired,
};

export default PaymentSimulation;
