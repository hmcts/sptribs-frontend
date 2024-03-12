module.exports = {
  root: true,
  env: { browser: true, es6: true, node: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'import', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.eslint.json',
  },
  globals: { Atomics: 'readonly', SharedArrayBuffer: 'readonly' },
  rules: {
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-var-requires': 'off',
    curly: 'error',
    eqeqeq: 'error',
    'import/no-duplicates': 'error',
    'import/no-named-as-default': 'error',
    'import/order': [
      'error',
      {
        alphabetize: {
          caseInsensitive: false,
          order: 'asc',
        },
        'newlines-between': 'always',
      },
    ],
    'jest/prefer-to-have-length': 'error',
    'jest/valid-expect': 'off',
    'linebreak-style': ['error', 'unix'],
    'no-console':  [
      "warn",
        { "allow": ["log", "error", "info"] }
    ],
    'no-prototype-builtins': 'off',
    'no-return-await': 'error',
    'no-unneeded-ternary': [
      'error',
      {
        defaultAssignment: false,
      },
    ],
    'object-curly-spacing': ['error', 'always'],
    'object-shorthand': ['error', 'properties'],
    quotes: [
      'error',
      'single',
      {
        allowTemplateLiterals: false,
        avoidEscape: true,
      },
    ],
    semi: ['error', 'always'],
    'sort-imports': [
      'error',
      {
        allowSeparatedGroups: false,
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      },
    ],
  },  
  overrides: [
    {
      files: [
        'src/main/steps/contact-us/content.test.ts',
        'src/main/steps/common/components/common/component.test.ts',
        'src/main/steps/accessibility-statement/content.test.ts',
        'src/main/steps/edge-case/cookies/content.test.ts',
        'src/main/steps/edge-case/subject-contact-details/content.test.ts',
        'src/main/steps/edge-case/upload-appeal-form/content.test.ts',
        'src/main/steps/edge-case/upload-other-information/content.test.ts',
        'src/main/steps/edge-case/upload-supporting-documents/content.test.ts',
        'src/main/steps/privacy-policy/content.test.ts',
        'src/main/steps/terms-and-conditions/content.test.ts',
      ],
      rules: {
        'jest/expect-expect': 'off',
      },
    },
  ],
};
