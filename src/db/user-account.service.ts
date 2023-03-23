import { ObjectId } from 'mongodb';
import { UserAccount, UserData } from '../types';
import DbService, { CASE_INSENSITIVE_COLLATION } from './db.service';
import { InvalidArgsError, NotFoundError } from '../errors';

export default class UserAccountService {

	static async get_user(id: string): Promise<UserAccount> {
		const user = await DbService.UserAccountCollection.findOne({ _id: new ObjectId(id) });
		if (!user) {
			throw new NotFoundError('User id does not exist');
		}
		return user;
	}

	static async search_users(search_query: string): Promise<UserAccount[]> {
		return DbService.UserAccountCollection
			.find({
				name: {
					$regex: new RegExp(search_query),
					$options: 'i'
				}
			})
			.collation(CASE_INSENSITIVE_COLLATION)
			.toArray();
	}

	static async create_user(data: UserData): Promise<string> {
		if (await UserAccountService.check_duplicates(data)) {
			throw new InvalidArgsError('User with name or email already exists');
		}
		const insert_result = await DbService.UserAccountCollection.insertOne({
			_id: new ObjectId(),
			...data,
		});
		return insert_result.insertedId.toString();
	}

	static async update_user(id: string, update_data: Partial<UserData>): Promise<boolean> {
		if (await UserAccountService.check_duplicates(update_data)) {
			throw new InvalidArgsError('User with name or email already exists');
		}
		const update_result = await DbService.UserAccountCollection.findOneAndUpdate(
			{ _id: new ObjectId(id) },
			{ $set: update_data }
		);
		if (update_data.email) {
			await DbService.AuthCollection.findOneAndUpdate(
				{ email: update_result.value.email },
				{ $set: { email: update_data.email } }
			);
		}
		return true;
	}

	static async delete_user(id: string): Promise<boolean> {
		const delete_result = await DbService.UserAccountCollection.deleteOne({ _id: new ObjectId(id) });
		return delete_result.deletedCount === 1;
	}

	private static async check_duplicates({ name, email }: Partial<UserData>): Promise<boolean> {
		const filter = [];
		if (name) filter.push({ name });
		if (email) filter.push({ email });
		const duplicates = await DbService.UserAccountCollection
			.find({ $or: filter })
			.collation(CASE_INSENSITIVE_COLLATION)
			.toArray();

		return duplicates.length > 0;
	}

}