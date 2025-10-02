import { DateHelper } from '@helpers';

describe('Date helper', (): void => {
	describe('Timestamp now', (): void => {
		const dateMock: Date = new Date('2025-07-15 18:20:00');

		beforeEach((): void => {
			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.useRealTimers();
		});

		it('should return current date and time in timestamp format', (): void => {
			jest.setSystemTime(dateMock);

			expect(DateHelper.timestampNow()).toBe(dateMock.getTime() / 1000);
		});
	});
});
