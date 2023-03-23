import { JWT } from '../types';
import { UserAccount } from '../types';
import UserAccountService from '../db/user-account.service';
import AuthService from '../db/auth.service';

export default {

	get_user: async (
		_: unknown,
		args: { id: string },
		{ jwt }: JWT
	): Promise<UserAccount> => {
		await AuthService.verify_jwt(jwt);
		return UserAccountService.get_user(args.id);
	},

	search_users: async (
		_: unknown,
		args: { search_query?: string },
		{ jwt }: JWT
	): Promise<UserAccount[]> => {
		await AuthService.verify_jwt(jwt);
		return UserAccountService.search_users(args.search_query ?? '');
	},

	login: async (
		_: unknown,
		args: { email: string, password: string },
	): Promise<{ jwt: string }> => {
		const jwt = await AuthService.login(args.email, args.password);
		return { jwt };
	}

}
