const sgMail = require('@sendgrid/mail');

const initMails = () => {
    // If the environment is test, we mock the email sending functionality
    if (process.env.NODE_ENV === 'test') {
        return {
            sendEmail: async (to, subject, message) => {
                return { success: true, message: 'Correo simulado en entorno de test' };
            }
        };
    }

    // Production / Development
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
        return {
            sendEmail: async () => ({
                success: false,
                message: 'API Key de SendGrid no configurada correctamente',
            }),
        };
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const sendEmail = async (to, subject, message) => {
        try {
            await sgMail.send({
                to,
                from: process.env.EMAIL_SENDER,
                subject,
                text: message,
            });
            return { success: true, message: 'Correo enviado exitosamente' };
        } catch (error) {
            console.error('❌ Error al enviar el correo:', error.message);
            return { success: false, message: error.message };
        }
    };

    return { sendEmail };
};

module.exports = initMails;
