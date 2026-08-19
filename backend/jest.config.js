export default {
  testEnvironment: "node",
  transform: {},
  setupFiles: ["<rootDir>/jest.setup.js"],
  testMatch: ["**/src/**/__tests__/**/*.test.js", "**/src/**/?(*.)+(spec|test).js"],
  testPathIgnorePatterns: ["/node_modules/"],
  verbose: true,
  clearMocks: true
};
