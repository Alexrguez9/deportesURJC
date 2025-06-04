require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.NODE_ENV === 'test'
  ? process.env.MONGO_ATLAS_URI_TESTS
  : process.env.MONGO_ATLAS_URI;

if (!uri) {
throw new Error(`❌ No se recibió la URI de MongoDB (${process.env.NODE_ENV})`);
}

if (!uri.startsWith('mongodb+srv://') && !uri.startsWith('mongodb://')) {
console.warn(`⚠️ La URI de MongoDB no parece válida (no empieza por "mongodb+srv://" ni "mongodb://"): "${uri}"`);
}

module.exports = async () => {
  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado a la base de datos');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos', error);
  }
};
