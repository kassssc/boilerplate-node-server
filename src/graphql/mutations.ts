import { JWT } from '../types';
import { UserAccount, UserData } from '../types';
import UserAccountService from '../db/user-account.service';
import AuthService from '../db/auth.service';

export default {

	create_user: async (
		_: unknown,
		args: {
			name: string,
			email: string,
			password: string,
		},
		{ jwt }: JWT
	): Promise<string> => {
		await AuthService.verify_jwt(jwt);
		const [ result ] = await Promise.all([
			UserAccountService.create_user(args),
			AuthService.register_user(args.email, args.password),
		]);
		return result;
	},

	update_user: async (
		_: unknown,
		args: {
			id: string,
			name?: string,
			email?: string,
		},
		{ jwt }: JWT
	): Promise<boolean> => {
		await AuthService.verify_jwt(jwt);
		const update_data: Partial<UserData> = {
			...(args.name && { name: args.name } ),
			...(args.email && { email: args.email } ),
		};
		return UserAccountService.update_user(args.id, update_data);
	},

	delete_user: async (
		_: unknown,
		args: { id: string },
		{ jwt }: JWT
	): Promise<boolean> => {
		await AuthService.verify_jwt(jwt);
		const [ auth_res, user_res] = await Promise.all([
			AuthService.delete_user(args.id),
			UserAccountService.delete_user(args.id)
		]);
		return auth_res && user_res;
	},
}
