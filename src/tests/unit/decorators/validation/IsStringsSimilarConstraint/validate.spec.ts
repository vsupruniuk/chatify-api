import { IsStringsSimilarConstraint } from '@decorators/validation/IsStringsSimilar.decorator';
import { ValidationArguments } from 'class-validator';

describe('Is strings similar', (): void => {
	let isStringsSimilarConstraint: IsStringsSimilarConstraint;

	beforeAll((): void => {
		isStringsSimilarConstraint = new IsStringsSimilarConstraint();
	});

	describe('validate', (): void => {
		const value: string = 'value';
		const relatedValue: string = 'relatedValue';

		const relatedPropertyName: string = 'relatedPropertyName';
		const validationArguments: ValidationArguments = {
			constraints: [relatedPropertyName],
			object: { relatedPropertyName: relatedValue },
		} as ValidationArguments;

		it('should return true if value and related value are the same', (): void => {
			const isSimilar: boolean = isStringsSimilarConstraint.validate(value, {
				...validationArguments,
				object: { relatedPropertyName: value },
			});

			expect(isSimilar).toBe(true);
		});

		it('should return false if value and related value are not the same', (): void => {
			const isSimilar: boolean = isStringsSimilarConstraint.validate(value, validationArguments);

			expect(isSimilar).toBe(false);
		});
	});
});
