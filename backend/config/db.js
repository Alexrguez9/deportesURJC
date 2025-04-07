require('dotenv').config();
const mongoose = require('mongoose');

// ERROR with:
// mongodb://localhost:27017/deportesdb -> crashes on local

const uri = process.env.NODE_ENV === 'test'
  ? process.env.MONGO_ATLAS_URI_TEST
  : process.env.mongo_atlas_uri;

module.exports = async () => {
    try{
        await mongoose.connect(uri);
        console.log('Conectado a la base de datos');
    } catch (error) {
        console.error('Error conectando a la base de datos', error);
    }
};
