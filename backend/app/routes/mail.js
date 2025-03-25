const express = require('express');
const router = express.Router();
const initMails = require('../../config/mails');

const { sendEmail } = initMails();

// Route to send an email
router.post('/send-email', async (req, res) => {
    const { to, subject, message } = req.body;

    console.log('Datos recibidos:', { to, subject, message });

    if (!to || !subject || !message) {
        console.error('Campos faltantes');
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    try {
        const response = await sendEmail(to, subject, message);
        res.status(200).json({ message: 'Correo enviado con éxito' });
        console.log('Correo enviado con éxito:', response);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ message: 'Error al enviar el correo', error: error.message });
    }
});

module.exports = router;
