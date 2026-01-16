import { DateHelper } from '@helpers';

import { Dayjs } from 'dayjs';
import * as dayjs from 'dayjs';

describe('Date helper', (): void => {
	describe('Timestamp now', (): void => {
		const dateMock: Dayjs = dayjs('2025-07-15 18:20:00');

		beforeEach((): void => {
			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.useRealTimers();
		});

		it('should return current date and time in timestamp format', (): void => {
			jest.setSystemTime(dateMock.toDate());

			expect(DateHelper.timestampNow()).toBe(dateMock.unix());
		});
	});
});
