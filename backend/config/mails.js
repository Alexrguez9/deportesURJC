const sgMail = require('@sendgrid/mail');

const initMails = () => {
  // Si estamos en test, devolvemos mocks
  if (process.env.NODE_ENV === 'test') {
    return {
      sendEmail: async (to, subject, message) => {
        console.log(`📭 [MOCK] Correo simulado a ${to} con asunto "${subject}"`);
        return { success: true, message: 'Correo simulado en entorno de test' };
      }
    };
  }

  // Producción / desarrollo
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    console.warn('⚠️ SENDGRID_API_KEY no definido o inválido. No se enviarán correos.');
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
        from: process.env.EMAIL_SENDER || 'alexrguez9@gmail.com',
        subject,
        text: message,
      });
      console.log(`✅ Correo enviado a ${to}`);
      return { success: true, message: 'Correo enviado exitosamente' };
    } catch (error) {
      console.error('❌ Error al enviar el correo:', error.message);
      return { success: false, message: error.message };
    }
  };

  return { sendEmail };
};

module.exports = initMails;
