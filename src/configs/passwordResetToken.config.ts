type ConfigKey = 'ttl';

export const passwordResetTokenConfig: Record<ConfigKey, number> = {
	ttl: 1000 * 60 * 60 * 24,
};
