export const sendEmail = async (to, subject, message) => {
    try {
        const response = await fetch('http://localhost:4000/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, subject, message })
        });
        if (!response.ok) {
            throw new Error('Error al enviar el correo 1');
        }

        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Error al enviar el correo en utils:', error);
        throw new Error('No se pudo enviar el correo.');
    }
};
