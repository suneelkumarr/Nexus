module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
    'vitest/globals': true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:playwright/recommended',
    'plugin:testing-library/react',
  ],
  plugins: [
    '@typescript-eslint',
    'playwright',
    'testing-library',
    'react-hooks',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',

    // React specific rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',

    // General code quality rules
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-alert': 'error',
    'no-await-in-loop': 'warn',
    'prefer-const': 'error',
    'prefer-destructuring': ['error', {
      object: true,
      array: false,
    }],
    'no-var': 'error',

    // Import/export rules
    'sort-imports': ['error', {
      ignoreCase: false,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      allowSeparatedGroups: true,
    }],

    // Testing specific rules
    'testing-library/await-async-utils': 'error',
    'testing-library/await-async-query': 'error',
    'testing-library/no-await-sync-query': 'error',
    'testing-library/no-container': 'error',
    'testing-library/no-debugging-utils': 'error',
    'testing-library/no-dom-import': 'off', // We need DOM imports for testing
    'testing-library/no-manual-cleanup': 'error',
    'testing-library/no-render-in-setup': 'error',
    'testing-library/no-unnecessary-act': 'error',
    'testing-library/prefer-explicit-assert': 'error',
    'testing-library/prefer-find-by': 'error',
    'testing-library/prefer-presence-queries': 'error',
    'testing-library/prefer-query-by-disappearance': 'error',
    'testing-library/render-result-naming-convention': 'error',

    // Playwright specific rules (if using playwright-test)
    'playwright/missing-playwright-await': 'error',
    'playwright/no-networkidle': 'error',
    'playwright/no-wait-for-timeout': 'error',
    'playwright/no-element-handle': 'error',
    'playwright/no-force-option': 'error',
    'playwright/no-wait-for-selector': 'error',

    // Accessibility rules
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/html-has-lang': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/no-access-key': 'error',
    'jsx-a11y/no-autofocus': 'error',
    'jsx-a11y/no-distracting-elements': 'error',
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/scope': 'error',
    'jsx-a11y/tabindex-no-positive': 'error',

    // Disable some overly strict rules for test files
    'max-len': 'off',
    'complexity': 'off',
    'max-depth': 'off',
    'max-nested-callbacks': 'off',
    'max-statements': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        // Relax some rules for test files
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'no-console': 'off',
        'max-len': 'off',
        'testing-library/await-async-utils': 'off', // Often needed in test files
      },
    },
    {
      files: ['**/*.e2e.ts', '**/*.e2e.tsx'],
      rules: {
        // E2E tests specific rules
        'no-console': 'off', // Console logs useful for debugging E2E tests
        'playwright/no-wait-for-timeout': 'off', // Sometimes necessary in E2E
        'playwright/no-networkidle': 'off', // Network idle can be unreliable
      },
    },
    {
      files: ['playwright.config.ts', 'vitest.config.ts', 'setup.ts'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off', // Common in config files
        'import/no-extraneous-dependencies': 'off', // Dev dependencies needed in config
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    'playwright-report/',
    'test-results/',
    '**/*.d.ts',
    'build/',
    '.next/',
    '.git/',
    '.cache/',
    '.vite/',
    '*.config.js',
    '*.config.ts',
  ],
};