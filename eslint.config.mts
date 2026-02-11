import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import unicornPlugin from 'eslint-plugin-unicorn';

export default defineConfig([
	{
		ignores: ['dist/**', 'node_modules/**'],
	},

	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
				BufferEncoding: 'readonly',
				Express: 'readonly',
			},
			parserOptions: {
				projectService: true,
			},
		},
	},

	tseslint.configs.strict,
	tseslint.configs.strictTypeChecked,
	js.configs.recommended,
	prettierConfig,

	{
		plugins: {
			prettier: prettierPlugin,
			unicorn: unicornPlugin,
		},
		rules: {
			'prettier/prettier': 'error',

			'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
			'@typescript-eslint/prefer-readonly': 'error',
			'@typescript-eslint/no-confusing-void-expression': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/require-await': 'off',
			'@typescript-eslint/restrict-template-expressions': 'off',
			'@typescript-eslint/no-extraneous-class': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unnecessary-type-parameters': 'off',
			'@typescript-eslint/no-misused-spread': 'off',
			'@typescript-eslint/no-unnecessary-condition': 'off',
			'@typescript-eslint/no-useless-constructor': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-misused-promises': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],

			eqeqeq: 'error',
			'spaced-comment': 'error',
			'no-unused-vars': 'off',
		},
	},

	{
		files: ['**/*.spec.{js,ts}'],
		rules: {
			'@typescript-eslint/unbound-method': 'off',
			'@typescript-eslint/no-invalid-void-type': 'off',
			'@typescript-eslint/no-misused-promises': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
		},
	},
]);
