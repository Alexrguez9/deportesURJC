const mongoose = require('mongoose');

jest.setTimeout(20000); // 20 seconds timeout for tests

beforeAll(async () => {
  await mongoose.connect(process.env.mongo_atlas_uri_test, {
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
