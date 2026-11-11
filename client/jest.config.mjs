import nextJest from 'next/jest.js';

// next/jest: transforma con SWC, carga next.config y .env, y mockea CSS/imágenes.
const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    // Router en memoria para tests (URL reactiva).
    '^next/navigation$': '<rootDir>/src/test/next-navigation.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // app/, middleware y server/*.ts (sesión, BFF, proxy a la API) se cubren con Playwright E2E.
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.stories.tsx', '!src/app/**', '!src/middleware.ts', '!src/server/*.ts', '!src/test/**', '!src/mocks/**', '!src/types/**'],
};

export default createJestConfig(config);
