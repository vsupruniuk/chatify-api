/**
 * Helper class for dates
 */
export class DateHelper {
	/**
	 * Generate and return current date and time
	 * @returns dateTime - current date and time in format "YYYY-MM-dd hh:mm:ss"
	 */
	public static dateTimeNow(): string {
		const dateNow: Date = new Date();

		return this.formatDate(dateNow);
	}

	/**
	 * Generate and return date and time in future
	 * @param milliseconds - milliseconds to add
	 * @returns dateTime - future date and time in format "YYYY-MM-dd hh:mm:ss"
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

		return targetDate.getTime() < currentDate.getTime();
	}

	private static formatDate(date: Date) {
		const year: number = date.getFullYear();
		const month: string = String(date.getMonth() + 1).padStart(2, '0');
		const day: string = String(date.getDate()).padStart(2, '0');

		const hours: string = String(date.getHours()).padStart(2, '0');
		const minutes: string = String(date.getMinutes()).padStart(2, '0');
		const seconds: string = String(date.getSeconds()).padStart(2, '0');

		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}
}
