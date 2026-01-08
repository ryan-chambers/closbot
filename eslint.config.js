// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier/flat');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      prettier,
      // TODO add sonarjs
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error', // or "warn" for a warning instead of an error
        {
          args: 'all',
          argsIgnorePattern: '^_', // Ignores arguments starting with _
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_', // Ignores caught errors starting with _
          destructuredArrayIgnorePattern: '^_', // Ignores destructured array items starting with _
          varsIgnorePattern: '^_', // Ignores variables starting with _
          ignoreRestSiblings: true, // Allows ignoring the rest of destructured siblings
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },
);
