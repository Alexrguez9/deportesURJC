export default {
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!**/node_modules/**",
  ],
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  testMatch: ["<rootDir>/src/**/*.test.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js"
  },
  transformIgnorePatterns: [
    "node_modules/(?!cheerio)"
  ],
};
