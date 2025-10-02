import { HelmetOptions } from 'helmet';

export const helmetConfig: HelmetOptions = {
	contentSecurityPolicy: {
		reportOnly: false,
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'none'"],
			styleSrc: ["'none'"],
			imgSrc: ["'self'", 'data:'],
			connectSrc: ["'self'", 'wss://localhost:'],
			fontSrc: ["'none'"],
			objectSrc: ["'none'"],
			mediaSrc: ["'none'"],
			frameSrc: ["'none'"],
			workerSrc: ["'none'"],
			manifestSrc: ["'none'"],
			baseUri: ["'none'"],
			formAction: ["'self'"],
			frameAncestors: ["'none'"],
			upgradeInsecureRequests: [],
		},
	},
};
