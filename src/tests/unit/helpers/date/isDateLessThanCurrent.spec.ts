import { DateHelper } from '@helpers/date.helper';

describe('Date helper', (): void => {
	describe('Is date less than current', (): void => {
		const dateMock: Date = new Date('2025-07-14 23:30:00');

		beforeEach((): void => {
			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.useRealTimers();
		});

		it('should return true if date less than current', (): void => {
			jest.setSystemTime(dateMock);

			expect(DateHelper.isDateLessThanCurrent('2025-07-14 23:25:00')).toBe(true);
		});

		it('should return false if date greater than current', (): void => {
			jest.setSystemTime(dateMock);

			expect(DateHelper.isDateLessThanCurrent('2025-07-14 23:35:00')).toBe(false);
		});

		it('should return false if date the same as current', (): void => {
			jest.setSystemTime(dateMock);

			expect(DateHelper.isDateLessThanCurrent(dateMock.toString())).toBe(false);
		});
	});
});
