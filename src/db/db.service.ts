import {
	MongoClient,
	Db,
	Collection,
	Document,
} from 'mongodb';
import AuthService from './auth.service';
import UserService from './user-account.service';

export const CASE_INSENSITIVE_COLLATION = {
	locale: 'en',
	strength: 2,
};

enum Collections {
	UserAccount = 'UserAccounts',
	Auth = 'Auth',
}

interface UserAccountSchema extends Document {
	name: string;
	email: string;
}

interface AuthSchema extends Document {
	pass_hash: string;
	email: string;
}

export default class DbService {

	static client: MongoClient;
	static db: Db;

	static get UserAccountCollection(): Collection<UserAccountSchema> {
		return DbService.db.collection(Collections.UserAccount);
	}

	static get AuthCollection(): Collection<AuthSchema> {
		return DbService.db.collection(Collections.Auth);
	}

	static async connect({ DB_PORT, DB_HOST, DB_NAME, DB_USER, DB_PASS }): Promise<void> {
		DbService.client = new MongoClient(
			`mongodb://${DB_HOST}:${DB_PORT}`,
			{
				auth: { username: DB_USER, password: DB_PASS },
				authSource: DB_NAME,
			}
		);

		try {
			await DbService.client.connect();
		} catch (err) {
			console.log(err);
			return;
		}
		console.log('Successfully connected to mongodb...');

		DbService.db = DbService.client.db(DB_NAME);
		DbService.create_indexes(); // don't wait
		DbService.init_db();
	}

	private static async init_db(): Promise<void> {
		const has_user = !!(await DbService.AuthCollection.findOne());
		if (has_user) return;

		await Promise.all([
			AuthService.register_user(
				process.env.ADMIN_USER_EMAIL,
				process.env.ADMIN_USER_PASS,
			),
			UserService.create_user({
				name: process.env.ADMIN_USER_NAME,
				email: process.env.ADMIN_USER_EMAIL,
			})
		]);

	}

	private static async create_indexes(): Promise<void> {
		await DbService.AuthCollection.createIndex(
			{ email: 1 },
			{
				unique: true,
				collation: CASE_INSENSITIVE_COLLATION,
			}
		);
		await DbService.UserAccountCollection.createIndex(
			{ name: 1 },
			{
				unique: true,
				collation: CASE_INSENSITIVE_COLLATION,
			}
		);
		await DbService.UserAccountCollection.createIndex(
			{ email: 1 },
			{
				unique: true,
				collation: CASE_INSENSITIVE_COLLATION,
			}
		);
	}

}
