const sgMail = require('@sendgrid/mail');

const initMails = () => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Function to verify and send the email
    const sendEmail = async (to, subject, message) => {
        try {
            await sgMail.send({
                to,
                from: 'alexrguez9@gmail.com', // January 2025: Unique mail verified in Sendgrid
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
