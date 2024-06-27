/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "moduleNameMapper": {
  "^@domains/(.*)$": "<rootDir>/src/domains/$1",
  "^@socket/(.*)$": "<rootDir>/src/socket/$1",
  "^@utils": "<rootDir>/src/utils/$1",
  "^@aws": "<rootDir>/src/aws/$1",
  },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>/src']
};