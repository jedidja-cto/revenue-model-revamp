import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['hosting/**/*.js'],
    languageOptions: {
      globals: {
        alert: 'readonly',
        Blob: 'readonly',
        console: 'readonly',
        crypto: 'readonly',
        document: 'readonly',
        FileReader: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLSelectElement: 'readonly',
        URL: 'readonly',
        window: 'readonly',
      },
      sourceType: 'module',
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
);
