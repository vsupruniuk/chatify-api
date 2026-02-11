import { Config } from 'jest';

import baseConfig from './jest.config';

const config: Config = {
	...baseConfig,

	testTimeout: 60_000,
	testMatch: ['<rootDir>/src/tests/e2e/**/*.e2e.spec.ts'],
};

export default config;
