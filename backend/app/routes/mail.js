const express = require('express');
const router = express.Router();
const initMails = require('../../config/mails');

const { sendEmail } = initMails();

// Route to send an email
router.post('/send-email', async (req, res) => {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    try {
        const response = await sendEmail(to, subject, message);
        res.status(200).json({ message: 'Correo enviado con éxito' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ message: 'Error al enviar el correo', error: error.message });
    }
});

module.exports = router;
