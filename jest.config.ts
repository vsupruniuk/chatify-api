import type { Config } from 'jest';

export default async (): Promise<Config> => {
	return {
		rootDir: '.',
		roots: ['./src'],
		transform: {
			'^.+\\.ts?$': 'ts-jest',
		},
		moduleNameMapper: {
			'@configs/(.*)': '<rootDir>/src/configs/$1',
			'@controllers/(.*)': '<rootDir>/src/controllers/$1',
			'@custom-types/(.*)': '<rootDir>/src/types/$1',
			'@db/(.*)': '<rootDir>/src/db/$1',
			'@decorators/(.*)': '<rootDir>/src/decorators/$1',
			'@dtos/(.*)': '<rootDir>/src/dtos/$1',
			'@emailTemplates/(.*)': '<rootDir>/src/emailTemplates/$1',
			'@entities/(.*)': '<rootDir>/src/db/entities/$1',
			'@enums/(.*)': '<rootDir>/src/enums/$1',
			'@filters/(.*)': '<rootDir>/src/filters/$1',
			'@gateways/(.*)': '<rootDir>/src/gateways/$1',
			'@helpers/(.*)': '<rootDir>/src/helpers/$1',
			'@interceptors/(.*)': '<rootDir>/src/interceptors/$1',
			'@middlewares/(.*)': '<rootDir>/src/middlewares/$1',
			'@modules/(.*)': '<rootDir>/src/modules/$1',
			'@pipes/(.*)': '<rootDir>/src/pipes/$1',
			'@repositories/(.*)': '<rootDir>/src/repositories/$1',
			'@responses/(.*)': '<rootDir>/src/responses/$1',
			'@services/(.*)': '<rootDir>/src/services/$1',
			'@testHelpers/(.*)': '<rootDir>/src/tests/helpers/$1',
			'@testMocks/(.*)': '<rootDir>/src/tests/mocks/$1',
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
		],
	};
};
