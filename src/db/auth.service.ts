import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

import DbService from './db.service';
import { LoginError, UnauthenticatedError } from '../errors';

export default class AuthService {

  static async register_user (email: string, password: string): Promise<boolean> {
    const pass_hash = await bcrypt.hash(password, 12);
    const result = await DbService.AuthCollection.insertOne({
      _id: new ObjectId(),
      email,
      pass_hash,
    });
    return result.acknowledged;
  }

  static async delete_user(id: string): Promise<boolean> {
    const { email } = await DbService.UserAccountCollection.findOne({ _id: new ObjectId(id) });
		const delete_result = await DbService.AuthCollection.deleteOne({ email });
		return delete_result.deletedCount === 1;
	}

  static async login (email: string, password: string): Promise<string> {
    const auth_data = await DbService.AuthCollection.findOne({ email });
    if (!auth_data) {
      throw new LoginError();
    }
    const password_correct = await bcrypt.compare(password, auth_data.pass_hash);
    if (!password_correct) {
      throw new LoginError();
    }
    return AuthService.gen_jwt(email);
  }

  static async verify_jwt(jwt): Promise<boolean> {
    if (!jwt) throw new UnauthenticatedError();

		try {
			// Decodes jwt. If any error occurred and if the token could not be decoded, return error.
			const decoded: JwtPayload = jsonwebtoken.decode(jwt) as JwtPayload;
			if (!decoded) throw new UnauthenticatedError();

			// check jwt expiry
			if (Date.now() >= decoded.exp * 1000) {
				throw new UnauthenticatedError('Expired Token');
			}

			//-------------------------------------------------------------------------------------------
			// Verifies if the incoming jwt is valid.
			const verified = jsonwebtoken.verify(jwt, process.env.JWT_SECRET);
			if (!verified) {
				throw new UnauthenticatedError('Invalid Token');
			}
      return true;
		} catch (err) {
			throw new UnauthenticatedError();
		}
  }

  private static async gen_jwt (email: string): Promise<string> {
		return jsonwebtoken.sign(
			{ email },
			process.env.JWT_SECRET,
			{ expiresIn: '2d' }
		);
	}

}