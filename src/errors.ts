import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { ApolloError } from 'apollo-server-errors';
import fs from 'fs';

import CONFIG from './config';

export const log_error = (err: GraphQLError): void => {
	const file_path = `${CONFIG.LOG_DIR}/gql-errors.log`;

	const date = `[${new Date().toLocaleString()}]`;
	const path = err.path?.[0];
	const line = err.locations?.[0]?.line;
	let location = '';
	if (path && line) {
		location = ` @${path}, line ${line}`;
	}

	fs.appendFile(
		file_path,
		`${date}${location} => ${err.message}\r\n`,
		() => {}
	);
}

export const error_handler = (err: GraphQLError): GraphQLFormattedError => {

	log_error(err);

	// Mask ALL internal Errors
	if (!(
		err.originalError instanceof LoginError ||
		err.originalError instanceof UnauthenticatedError ||
		err.originalError instanceof NotFoundError ||
		err.originalError instanceof InvalidArgsError
	)) {
		return new Error('Internal server error');
	}

	// Otherwise return the original error
	return err;
}

export class LoginError extends ApolloError {
	constructor(message: string = 'Error: Invalid credentials', extensions?: Record<string, any>) {
		super(message, 'LOGIN_ERROR', extensions);

		Object.defineProperty(this, 'name', { value: 'LoginError' });
	}
}

export class UnauthenticatedError extends ApolloError {
	constructor(message: string = 'Error: Unauthenticated', extensions?: Record<string, any>) {
		super(message, 'UNAUTHENTICATED', extensions);

		Object.defineProperty(this, 'name', { value: 'UnauthenticatedError' });
	}
}

export class NotFoundError extends ApolloError {
	constructor(message: string, extensions?: Record<string, any>) {
		super(message, 'NOT_FOUND', extensions);

		Object.defineProperty(this, 'name', { value: 'NotFoundError' });
	}
}

export class InvalidArgsError extends ApolloError {
	constructor(message: string, extensions?: Record<string, any>) {
		super(message, 'INVALID_ARGS', extensions);

		Object.defineProperty(this, 'name', { value: 'InvalidArgsError' });
	}
}
