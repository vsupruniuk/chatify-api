import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { GlobalTypes } from '@customTypes';

export class MetadataHelper {
	public static getParamDecoratorFactory(decorator: CallableFunction): CallableFunction {
		class MetadataWrapper {
			public metadataWrapper(@decorator() _metadataValue: unknown): void {
				// This method needs to exist for decorators testing, but doesn't require any logic to be implemented.
				// After calling getParamDecoratorFactory method with target decorator, this method will trigger Nest.js
				// flow for decorator registration and allow later to extract the function from the decorator
			}
		}

		const args: GlobalTypes.IMetadataArguments = Reflect.getMetadata(
			ROUTE_ARGS_METADATA,
			MetadataWrapper,
			'metadataWrapper',
		);

		return args[Object.keys(args)[0]].factory;
	}
}
