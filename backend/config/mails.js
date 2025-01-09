const sgMail = require('@sendgrid/mail');

const initMails = () => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Función para enviar correos
    const sendEmail = async (to, subject, message) => {
        try {
            await sgMail.send({
                to,
                from: 'alexrguez9@gmail.com', // Actualmente (Enero 2025) único email verificado en SendGrid
                subject,
                text: message,
            });
            console.log(`Correo enviado a ${to}`);
            return { success: true, message: 'Correo enviado exitosamente' };
        } catch (error) {
            console.error('Error al enviar el correo:', error.message);
            return { success: false, message: error.message };
        }
    };

    return {
        sendEmail,
    };
};

module.exports = initMails;
