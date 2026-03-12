import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'src/test/', '**/*.test.ts'],
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.ts']
    }
  }
});
