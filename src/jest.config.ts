import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};

export default config;