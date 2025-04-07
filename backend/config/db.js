require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.NODE_ENV === 'test'
  ? process.env.MONGO_ATLAS_URI_TEST
  : process.env.MONGO_ATLAS_URI;

if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
  throw new Error(`❌ La URI de MongoDB no es válida: "${uri}"`);
}

module.exports = async () => {
  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado a la base de datos');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos', error);
  }
};
