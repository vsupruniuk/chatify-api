import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Constraint object that performs validation of two fields
 */
@ValidatorConstraint({ name: 'isStringsSimilar', async: false })
export class IsStringsSimilarConstraint implements ValidatorConstraintInterface {
	public validate(value: unknown, validationArguments?: ValidationArguments): boolean {
		const [relatedPropertyName] = validationArguments?.constraints || '';
		const args = validationArguments?.object as Record<string, string>;

		const relatedValue: string = args[relatedPropertyName] || '';

		return value === relatedValue;
	}

	public defaultMessage(args: ValidationArguments): string {
		const [relatedPropertyName] = args.constraints;

		return `${args.property} and ${relatedPropertyName} should match`;
	}
}

/**
 * Validation decorator that checks if two string fields are similar in the DTO object
 * @param property - name of the property to which field will be compared
 * @param validationOptions - object with different validation options
 * @returns - function that can be used as validation decorator
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
