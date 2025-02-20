// jest.config.mjs
import { defaults } from 'jest-config';

export default {
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  testMatch: ["<rootDir>/src/**/*.test.js"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy", // Mapea archivos de estilo a módulos vacíos
  }
};
