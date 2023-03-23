import express, { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { addResolversToSchema } from '@graphql-tools/schema'
import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { join } from 'path';
import fs from 'fs';

import { JWTRequest, JWT } from './types';
import { error_handler } from './errors';
import DbService from './db/db.service';
import resolvers from './graphql/resolvers';
import CONFIG from './config';

const init_server = async (): Promise<void> => {

	if (!fs.existsSync(CONFIG.LOG_DIR)) {
		fs.mkdirSync(CONFIG.LOG_DIR);
	}

	try {
		await DbService.connect(CONFIG.DB);
	} catch (err) {
		console.log(err);
		return;
	}

	const app = express();

	app.use(cors({ credentials: true, origin: true }));
	app.use(compression());
	app.use(helmet());
	app.use(express.json());

	//---------------------------------------------------------------------------
	// Auth middleware
	app.use(async (req: Request, _: Response, next: any) => {
		(req as JWTRequest).jwt = req.headers?.authorization?.split(' ')?.[1] || null;
		next();
	});

	const schema = await loadSchema(
		join(__dirname, 'graphql/schema.gql'),
		{ loaders: [new GraphQLFileLoader()] }
	);

	//---------------------------------------------------------------------------
	// Add resolvers to the schema
	const schema_resolver = addResolversToSchema({
		schema,
		resolvers,
	});

	const server = new ApolloServer({
		schema: schema_resolver,
		context: ({ req }: { req: JWTRequest }): JWT => ({ jwt: req.jwt }),
		formatError: error_handler,
	});

	await server.start();

	server.applyMiddleware({
		app,
		path: CONFIG.GQL_ENDPOINT
	});

	app.listen(
		CONFIG.PORT,
		(): void => {
			console.log('\n-------------------------------------------------------------------------------');
			console.log(`Server is listening on port: ${CONFIG.PORT}`)
			console.log(`GraphQL Endpoint: ${CONFIG.GQL_ENDPOINT}`)
			console.log('-------------------------------------------------------------------------------\n');
		}
	);
}

init_server();