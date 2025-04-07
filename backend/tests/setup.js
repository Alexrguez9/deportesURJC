const mongoose = require('mongoose');

jest.setTimeout(20000); // 20 seconds timeout for tests

console.log('🔍 URI de test:', process.env.MONGO_ATLAS_URI_TEST);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_ATLAS_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    try {
      await mongoose.connection.db.dropDatabase();
    } catch (err) {
      console.error('❌ No se pudo hacer dropDatabase:', err.message);
    }
  }
  await mongoose.connection.close();
});
