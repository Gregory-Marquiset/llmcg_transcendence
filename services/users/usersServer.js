import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
//### IMPORT OWN FILES ###
import * as user from './user/user.js';
import * as friends from './friends/friends.js';
import authPlugin from '../shared/authPlugin.js';
import postgresPlugin from '../shared/postgresPlugin.js';
import { initDb } from '../shared/postgresFunction.js';

export const app = Fastify({
	logger: true
});

export const httpError = (code, message) => {
	const err = new Error(message);
	err.statusCode = code;
	return err;
}

const rootDir = dirname(fileURLToPath(import.meta.url));
//###### AVATAR UPLOADS DIRECTORY
export const uploadsDir = join(rootDir, './uploads/avatar/');

//###### STATIC PLUGIN ######
app.register(fastifyStatic, {
	root: uploadsDir,
	decorateReply: false
})

//###### PARSE MULTIPART FORM DATA ######
app.register(fastifyMultipart, {
	limits: {
		fileSize: 5 * 1024 * 1024
	}
});

//###### PLUGIN PERSO ######
app.register(authPlugin);
app.register(postgresPlugin);

//###### USER ROUTES ######
app.register(user.userRoutes);

//###### FRIENDS ROUTES ######
app.register(friends.friendsRoutes);


//###### ERROR HANDLER ######
app.setErrorHandler((error, req, reply) => {
	if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500)
		return (reply.code(error.statusCode).send({ message: error.message }));
	reply.code(500).send({ message: "Internal server error" });
});
app.setNotFoundHandler((req, reply) => {
	console.log(`\nExecuting setNotFoundHandler\n`);
	reply.code(404).send({ message: '404 Not Found' });
})

//###### STARTING SERVER ######
const start = async () => {
	try {
		await app.listen({ port: 5000, host: '0.0.0.0' });
		await initDb(app);
	} catch (err) {
		console.error(`\nERROR userServer\n`);
		process.exit(1);
	}
}

start();