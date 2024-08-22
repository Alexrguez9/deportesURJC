// db.js
require('dotenv').config();
const mongoose = require('mongoose');

// ERROR: poniendo mongodb://localhost:27017/deportesdb -> crashea en local
const MONGO_URI =  process.env.MONGO_URI;

module.exports = async () => {
    console.log('MONGO_URI:', process.env.MONGO_URI);
    try{
        await mongoose.connect(MONGO_URI);
        console.log('Conectado a la base de datos con URI:', MONGO_URI);
    } catch (error) {
        console.error('ERROR URI:', MONGO_URI);
        console.error('Error conectando a la base de datos', error);
    }

};
