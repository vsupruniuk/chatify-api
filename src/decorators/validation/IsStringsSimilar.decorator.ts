import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isStringsSimilar', async: false })
export class IsStringsSimilarConstraint implements ValidatorConstraintInterface {
	public validate(
		value: unknown,
		validationArguments?: ValidationArguments,
	): Promise<boolean> | boolean {
		const [relatedPropertyName] = validationArguments?.constraints || '';
		const relatedValue = validationArguments?.object[relatedPropertyName] || '';

		return value === relatedValue;
	}

	public defaultMessage(args: ValidationArguments): string {
		const [relatedPropertyName] = args.constraints;

		return `${args.property} and ${relatedPropertyName} should match`;
	}
}

/**
 * Validation decorator to check if two strings similar
 * @param property - name of property to compare
 * @param validationOptions - additional validation options
 */
export const IsStringsSimilar = (property: string, validationOptions?: ValidationOptions) => {
	return (object: object, propertyName: string): void => {
		registerDecorator({
			target: object.constructor,
			propertyName,
			options: validationOptions,
			constraints: [property],
			validator: IsStringsSimilarConstraint,
		});
	};
};
