import { ValidationArguments } from 'class-validator';

import { IsStringsSimilarConstraint } from '@decorators/validation';

describe('Is strings similar decorator', (): void => {
	let isStringsSimilarConstraint: IsStringsSimilarConstraint;

	beforeAll((): void => {
		isStringsSimilarConstraint = new IsStringsSimilarConstraint();
	});

	describe('Default message', (): void => {
		const property: string = 'property';
		const relatedPropertyName: string = 'relatedPropertyName';

		const validationArguments: ValidationArguments = {
			property,
			constraints: [relatedPropertyName],
		} as ValidationArguments;

		it('should return a message that contains both fields names', (): void => {
			const message: string = isStringsSimilarConstraint.defaultMessage(validationArguments);

			expect(message.includes(property)).toBe(true);
			expect(message.includes(relatedPropertyName)).toBe(true);
		});
	});
});
