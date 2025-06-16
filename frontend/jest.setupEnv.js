// jest.setupEnv.js
globalThis.importMeta = {
  env: {
    VITE_API_URL: "http://localhost:4000/api"
  },
  writable: true,
};
