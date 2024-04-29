// db.js
const mongoose = require('mongoose');

// ERROR: poniendo mongodb://localhost:27017/deportesdb -> crashea
const DB_URI = `mongodb://127.0.0.1:27017/deportesdb`;

module.exports = () => {
    const connect = () => {
        mongoose.connect(
            DB_URI,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        ).then(() => {
            console.log('Conectado a la base de datos');
        }).catch(err => {
            console.error('Error conectando a la base de datos', err);
        });
    };
    connect();
};
