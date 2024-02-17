/**
 * Helper class for dates
 */
export class DateHelper {
	/**
	 * Generate and return current date and time
	 * @returns dateTime - current date and time in ISO string format
	 */
	public static dateTimeNow(): string {
		const dateNow: Date = new Date();

		return this.formatDate(dateNow);
	}

	/**
	 * Generate and return date and time in future
	 * @param milliseconds - milliseconds to add
	 * @returns dateTime - future date and time in ISO string format
	 */
	public static dateTimeFuture(milliseconds: number): string {
		const dateNow: number = Date.now();

		return this.formatDate(new Date(dateNow + milliseconds));
	}

	/**
	 * Check if target date less then current
	 * @param date - date to checking
	 * @returns true - if target date less then current
	 * @returns false - if target date greater then current
	 */
	public static isDateLessThenCurrent(date: string): boolean {
		const currentDate: Date = new Date();
		const targetDate: Date = new Date(date);

		return this.formatDate(targetDate) < this.formatDate(currentDate);
	}

	private static formatDate(date: Date): string {
		return date.toISOString();
	}
}
