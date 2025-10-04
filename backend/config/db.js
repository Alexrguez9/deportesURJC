require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.NODE_ENV === 'test'
  ? process.env.MONGO_ATLAS_URI_TESTS
  : process.env.MONGO_ATLAS_URI;

if (!uri) {
throw new Error(`❌ No se recibió la URI de MongoDB (${process.env.NODE_ENV})`);
}

if (!uri.startsWith('mongodb+srv://') && !uri.startsWith('mongodb://')) {
  // Invalid MongoDB URI format
}

module.exports = async () => {
  try {
    await mongoose.connect(uri);
  } catch (error) {
    console.error('❌ Error conectando a la base de datos', error);
  }
};
