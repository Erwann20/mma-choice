import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Generated + build artifacts are never linted.
  { ignores: ['dist', 'node_modules', 'src/routeTree.gen.ts'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },

  // --- Architecture guardrails: the functional core must stay pure & deterministic ---
  {
    files: ['src/engine/**/*.{ts,tsx}'],
    rules: {
      // AD-1: engine imports nothing from React, the store, the UI or the routes.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'react/*', 'react-dom/*'],
              message: 'Le moteur (src/engine) doit rester pur — pas de React (AD-1).',
            },
            {
              group: [
                '**/store/**',
                '**/ui/**',
                '**/routes/**',
                'zustand',
                'zustand/*',
                '@tanstack/*',
                'primereact',
                'primereact/*',
                '@primereact/*',
                '@primeuix/*',
              ],
              message: 'Le moteur ne dépend ni du store, ni de l’UI, ni des routes, ni de leurs libs (AD-1).',
            },
          ],
        },
      ],
      // AD-3: no Math.random in the engine — all randomness goes through the seeded PRNG.
      // NOTE: `no-restricted-globals` does NOT catch `Math.random` (it is a property,
      // not a bare global), so we use `no-restricted-properties`.
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Utilise le PRNG à graine (AD-3), jamais Math.random.' },
      ],
    },
  },
)
