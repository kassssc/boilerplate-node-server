import { Request } from 'express';
import { ObjectId } from 'mongodb';

export interface JWTRequest extends Request {
  jwt?: string;
}

export interface JWT {
  jwt?: string;
}

export interface UserData {
  name: string;
  email: string;
}

export interface UserAccount extends UserData {
  _id: ObjectId;
}


