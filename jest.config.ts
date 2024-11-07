import type { Config } from 'jest';

export default async (): Promise<Config> => {
	return {
		rootDir: '.',
		roots: ['./src'],
		transform: {
			'^.+\\.ts?$': 'ts-jest',
		},
		moduleNameMapper: {
			'@Controllers/(.*)': '<rootDir>/src/controllers/$1',
			'@DB/(.*)': '<rootDir>/src/db/$1',
			'@Decorators/(.*)': '<rootDir>/src/decorators/$1',
			'@DTO/(.*)': '<rootDir>/src/types/dto/$1',
			'@EmailTemplates/(.*)': '<rootDir>/src/emailTemplates/$1',
			'@Entities/(.*)': '<rootDir>/src/db/entities/$1',
			'@Enums/(.*)': '<rootDir>/src/types/enums/$1',
			'@Filters/(.*)': '<rootDir>/src/filters/$1',
			'@Gateways/(.*)': '<rootDir>/src/gateways/$1',
			'@Helpers/(.*)': '<rootDir>/src/helpers/$1',
			'@Interceptors/(.*)': '<rootDir>/src/interceptors/$1',
			'@Interfaces/(.*)': '<rootDir>/src/types/interfaces/$1',
			'@Logger/(.*)': '<rootDir>/src/logger/$1',
			'@Middlewares/(.*)': '<rootDir>/src/middlewares/$1',
			'@Migrations/(.*)': '<rootDir>/src/db/migrations/$1',
			'@Modules/(.*)': '<rootDir>/src/modules/$1',
			'@Repositories/(.*)': '<rootDir>/src/repositories/$1',
			'@Responses/(.*)': '<rootDir>/src/types/responses/$1',
			'@Services/(.*)': '<rootDir>/src/services/$1',
			'@TestMocks/(.*)': '<rootDir>/src/tests/mocks/$1',
			'@Types/(.*)': '<rootDir>/src/types/types/$1',
		},
		verbose: true,
		preset: 'ts-jest',
		testEnvironment: 'node',
		moduleDirectories: ['node_modules', 'src', 'dist'],
		setupFiles: ['dotenv/config'],
		coveragePathIgnorePatterns: ['node_modules', 'types', 'db', 'logger', 'tests', '.mock.ts'],
	};
};
