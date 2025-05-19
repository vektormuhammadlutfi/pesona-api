module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'import',
    'prettier'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // TypeScript-specific rules
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],

    // Import rules
    'import/order': ['error', {
      groups: [
        'builtin', 
        'external', 
        'internal', 
        ['parent', 'sibling'], 
        'index'
      ],
      'newlines-between': 'always'
    }],
    'import/no-unresolved': 'error',

    // General best practices
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'eqeqeq': 'error',
    'complexity': ['warn', 10],
    'max-depth': ['warn', 4],
    'max-lines-per-function': ['warn', 50]
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json'
      }
    }
  }
};
