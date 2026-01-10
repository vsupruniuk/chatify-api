export const passwordConfig = {
	saltHashRounds: Number(process.env.PASSWORD_SALT_HASH_ROUNDS),
	validationRegExp: /^(?=.*[0-9])(?=.*[A-Z])/,
} as const;
