import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from '../../context/AuthContext';
import "./WalletReload.css";
import Spinner from "../../components/spinner/Spinner";
import { sendEmail } from '../../utils/mails';

const WalletReload = () => {
    const { user, updateUser } = useAuth();
    const [amount, setImporte] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setImporte(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (amount > 0) {
            setIsLoading(true);

            try {
                // Update user balance
                const updatedUserData = { ...user };
                updatedUserData.balance = user.balance + Number(amount);
                const response = await updateUser(user._id, updatedUserData);


                setTimeout(() => {
                    setIsLoading(false);

                    if (response.status === 200) {
                        toast.success(`¡Saldo de ${amount}€ añadido!`);
                    } else {
                        console.error('Error al recargar el monedero:', response.data.message);
                        toast.error('Error al recargar el monedero. Inténtalo de nuevo más tarde.');
                    }

                    // Send email to user with the receipt
                    sendEmail(
                        user.email, 
                        "Deportes URJC - Recarga de monedero con éxito",
                        `Hola ${user.name},\n\n` +
                        `Has recargado tu monedero con un importe de €${amount}.\nTu nuevo saldo es de €${user.balance - Number(amount)}.\n\n` +
                        `Gracias por utilizar nuestro servicio.\nDeportes URJC`
                    );
                    
                    setImporte("");
                });

            } catch (error) {
                setIsLoading(false);
                console.error('Error al dar de alta:', error);
                toast.error('Error al dar de alta. Inténtalo de nuevo.');
            }
        } else {
            toast.error("Por favor, introduce un importe válido.");
        }
    };

    return (
        <div id="recarga-monedero-content" className="content">
            <h1>Recarga de monedero</h1>
            <p>Bienvenido a la página de recarga de monedero de URJC Deportes.</p>

            {user && !isLoading && (
                <>
                <section>
                    <label htmlFor="amount">Introduce el importe a recargar:</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={handleChange}
                        placeholder="€"
                    />
                    <button onClick={handleSubmit}>Enviar</button>
                </section>

                <section>
                    <h2>Datos de envío del justificante</h2>
                    <p><strong>Nombre:</strong> {user?.name}</p>
                    <p><strong>Correo:</strong> {user?.email}</p>
                    <p><strong>Saldo actual:</strong> {user?.balance} €</p>
                </section>
                </>
            )}
            {!user && <p>No se ha podido cargar el usuario.</p>}
            {isLoading && <Spinner />}
        </div>
    );
};

export default WalletReload;
