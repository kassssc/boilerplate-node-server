const CONFIG = {
	LOG_DIR: process.env.LOG_DIR || './logs',
	GQL_ENDPOINT: process.env.GQL_ENDPOINT || '/api/graphql',
	PORT: process.env.PORT || 11168,
	DB: {
		DB_PORT: process.env.DB_PORT || 27018,
		DB_HOST: process.env.DB_HOST || '127.0.0.1',
		DB_NAME: process.env.DB_NAME || 'testdb',
		DB_USER: process.env.DB_USER,
		DB_PASS: process.env.DB_PASS,
	},
} as const;

export default CONFIG;