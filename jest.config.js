/**@type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!<rootDir>/src/main/**",
    "!<rootDir>/src/**/index.ts"
  ],
  coverageDirectory: "coverage",
  coverageProvider: "babel",
  moduleNameMapper: {
    "@/test/(.+)": "<rootDir>/test/$1",
    "@/(.+)": "<rootDir>/src/$1"
  },
  testMatch: ["**/*.spec.ts", "**/*.int.spec.ts"],
  roots: ["<rootDir>/src", "<rootDir>/test"],
  transform: {
    "\\.ts$": "ts-jest"
  },
  clearMocks: true
};
