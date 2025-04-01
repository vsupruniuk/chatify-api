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
			'@custom-types/(.*)': '<rootDir>/src/types/types/$1',
			'@db/(.*)': '<rootDir>/src/db/$1',
			'@decorators/(.*)': '<rootDir>/src/decorators/$1',
			'@dtos/(.*)': '<rootDir>/src/dtos/$1',
			'@emailTemplates/(.*)': '<rootDir>/src/emailTemplates/$1',
			'@entities/(.*)': '<rootDir>/src/db/entities/$1',
			'@enums/(.*)': '<rootDir>/src/types/enums/$1',
			'@filters/(.*)': '<rootDir>/src/filters/$1',
			'@gateways/(.*)': '<rootDir>/src/gateways/$1',
			'@helpers/(.*)': '<rootDir>/src/helpers/$1',
			'@interceptors/(.*)': '<rootDir>/src/interceptors/$1',
			'@interfaces/(.*)': '<rootDir>/src/types/interfaces/$1',
			'@middlewares/(.*)': '<rootDir>/src/middlewares/$1',
			'@migrations/(.*)': '<rootDir>/src/db/migrations/$1',
			'@modules/(.*)': '<rootDir>/src/modules/$1',
			'@pipes/(.*)': '<rootDir>/src/pips/$1',
			'@repositories/(.*)': '<rootDir>/src/repositories/$1',
			'@responses/(.*)': '<rootDir>/src/types/responses/$1',
			'@services/(.*)': '<rootDir>/src/services/$1',
			'@testMocks/(.*)': '<rootDir>/src/tests/mocks/$1',
		},
		verbose: true,
		preset: 'ts-jest',
		testEnvironment: 'node',
		moduleDirectories: ['node_modules', 'src', 'dist'],
		setupFiles: ['dotenv/config'],
		coveragePathIgnorePatterns: ['node_modules', 'types', 'db', 'tests', '.mock.ts', 'main.ts'],
	};
};
