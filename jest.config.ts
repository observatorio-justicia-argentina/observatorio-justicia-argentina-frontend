import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
  },
  collectCoverageFrom: ['app/**/*.{ts,tsx}', '!app/**/*.test.{ts,tsx}', '!app/layout.tsx'],
  coverageDirectory: 'coverage',
};

export default createJestConfig(config);
