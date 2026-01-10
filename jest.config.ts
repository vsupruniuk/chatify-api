import type { Config } from 'jest';

const config: Config = {
	rootDir: '.',
	roots: ['./src'],
	transform: {
		'^.+\\.ts?$': 'ts-jest',
	},
	moduleNameMapper: {
		'@configs/(.*)': '<rootDir>/src/configs/$1',
		'@configs': '<rootDir>/src/configs/index',

		'@controllers/(.*)': '<rootDir>/src/controllers/$1',
		'@controllers': '<rootDir>/src/controllers/index',

		'@custom-types/(.*)': '<rootDir>/src/types/$1',
		'@custom-types': '<rootDir>/src/types/index',

		'@decorators/(.*)': '<rootDir>/src/decorators/$1',

		'@dtos/(.*)': '<rootDir>/src/dtos/$1',

		'@emailTemplates/(.*)': '<rootDir>/src/emailTemplates/$1',
		'@emailTemplates': '<rootDir>/src/emailTemplates/index',

		'@entities/(.*)': '<rootDir>/src/db/entities/$1',
		'@entities': '<rootDir>/src/db/entities/index',

		'@enums/(.*)': '<rootDir>/src/enums/$1',
		'@enums': '<rootDir>/src/enums/index',

		'@filters/(.*)': '<rootDir>/src/filters/$1',
		'@filters': '<rootDir>/src/filters/index',

		'@gateways/(.*)': '<rootDir>/src/gateways/$1',
		'@gateways': '<rootDir>/src/gateways/index',

		'@helpers/(.*)': '<rootDir>/src/helpers/$1',
		'@helpers': '<rootDir>/src/helpers/index',

		'@interceptors/(.*)': '<rootDir>/src/interceptors/$1',
		'@interceptors': '<rootDir>/src/interceptors/index',

		'@middlewares/(.*)': '<rootDir>/src/middlewares/$1',
		'@middlewares': '<rootDir>/src/middlewares/index',

		'@modules/(.*)': '<rootDir>/src/modules/$1',
		'@modules': '<rootDir>/src/modules/index',

		'@pipes/(.*)': '<rootDir>/src/pipes/$1',
		'@pipes': '<rootDir>/src/pipes/index',

		'@repositories/(.*)': '<rootDir>/src/repositories/$1',
		'@repositories': '<rootDir>/src/repositories/index',

		'@responses/(.*)': '<rootDir>/src/responses/$1',
		'@responses': '<rootDir>/src/responses/index',

		'@services/(.*)': '<rootDir>/src/services/$1',
		'@services': '<rootDir>/src/services/index',

		'@testHelpers/(.*)': '<rootDir>/src/tests/helpers/$1',
		'@testHelpers': '<rootDir>/src/tests/helpers/index',

		'@testMocks/(.*)': '<rootDir>/src/tests/mocks/$1',
		'@testMocks': '<rootDir>/src/tests/mocks/index',
	},
	verbose: true,
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleDirectories: ['node_modules', 'src', 'dist'],
	setupFiles: ['dotenv/config', 'reflect-metadata'],
	collectCoverage: true,
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',

		'!src/main.ts',
		'!src/**/*.d.ts',

		'!src/configs/**',
		'!src/db/**',
		'!src/dtos/**',
		'!src/emailTemplates/**',
		'!src/enums/**',
		'!src/modules/**',
		'!src/responses/**',
		'!src/tests/**',
		'!src/types/**',
	],
	testMatch: ['<rootDir>/src/tests/unit/**/*.spec.ts'],
};

export default config;
