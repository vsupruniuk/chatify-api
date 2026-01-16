import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { GlobalTypes } from '@customTypes';

export class MetadataHelper {
	public static getParamDecoratorFactory(decorator: CallableFunction): CallableFunction {
		class MetadataWrapper {
			public metadataWrapper(@decorator() _metadataValue: unknown): void {}
		}

		const args: GlobalTypes.IMetadataArguments = Reflect.getMetadata(
			ROUTE_ARGS_METADATA,
			MetadataWrapper,
			'metadataWrapper',
		);

		return args[Object.keys(args)[0]].factory;
	}
}
