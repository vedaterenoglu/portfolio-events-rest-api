import eslint from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// === NEW IMPORTS FOR RECOMMENDED PLUGINS ===
import pluginSecurity from 'eslint-plugin-security'
import pluginImport from 'eslint-plugin-import' // For import/order rule
// ===========================================

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'src/generated/**/*'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs', // CommonJS for Node.js backend
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // === NEW: Define plugins for this configuration block ===
    plugins: {
      security: pluginSecurity,
      import: pluginImport,
    },
    // =======================================================
    rules: {
      semi: ['error', 'never'],
      'prettier/prettier': [
        'error',
        {
          arrowParens: 'avoid',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',

      // === NEW RECOMMENDATIONS START HERE ===

      // 1. Security Rules (from eslint-plugin-security)
      // Apply the recommended security rules.
      ...pluginSecurity.configs.recommended.rules,
      // Additional security rules based on threat model:
      // 'security/detect-buffer-noassert': 'error',
      'security/detect-eval-with-expression': 'error',
      // 'security/detect-non-literal-regexp': 'error',
      'security/detect-non-literal-require': 'error',

      // 2. Import Order (from eslint-plugin-import)
      // Enforces a consistent order for your import statements.
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js built-in modules (e.g., 'fs', 'path')
            'external', // Third-party modules (e.g., 'express', 'zod')
            'internal', // Your internal modules aliased (e.g., '@/')
            'parent', // Relative parent imports (e.g., '../')
            'sibling', // Relative sibling imports (e.g., './')
            'index', // Index files of the current directory (e.g., './')
            'object', // Object destructuring imports
            'type', // Type-only imports
          ],
          'newlines-between': 'always', // Add a newline between import groups
          alphabetize: {
            order: 'asc', // Sort imports alphabetically within groups
            caseInsensitive: true,
          },
        },
      ],

      // 3. Production Readiness
      // Disallow console.log/warn/error in production code.
      // You might want to adjust this based on your environment (e.g., only 'error' in production builds).
      'no-console': ['error', { allow: ['warn', 'error'] }], // Allow console.warn and console.error, but disallow log

      // 4. Stricter TypeScript Rules (beyond recommendedTypeChecked default errors)
      // Prevents common promise-related bugs where promises are not handled or awaited correctly.
      // `checksVoidReturn: false` is often necessary for NestJS methods (e.g., Guards, Interceptors)
      // that return void but internally await a promise.
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],

      // Ensures that anything you `await` is actually an awaitable (PromiseLike).
      '@typescript-eslint/await-thenable': 'error',

      // Ensures variables in template literals are strings or safely coercible.
      // Helps catch errors where you might accidentally include objects or other non-string types.
      // `allowNumber` and `allowBoolean` are often useful for convenience.
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
          allowBoolean: true,
          allowAny: false,
          allowNullish: false,
          allowRegExp: false,
        },
      ],

      // Ensures consistent use of await, or prevents unnecessary await if configured.
      // 'error' for always requiring await on thenables, 'never' for preventing redundant await.
      // Often, `recommendedTypeChecked` has a good default for this. You can adjust if needed.
      // '@typescript-eslint/return-await': 'error',

      // === NEW RECOMMENDATIONS END HERE ===
    },
    // === NEW: Settings for plugins ===
    // These settings are particularly important for `eslint-plugin-import`
    // to correctly resolve your module paths, especially with TypeScript.
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
    // =================================
  },
)
