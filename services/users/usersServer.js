import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
//### IMPORT OWN FILES ###
import * as user from './user/user.js';
import * as friends from './friends/friends.js';
import authPlugin from '../shared/authPlugin.js';
import postgresPlugin from '../shared/postgresPlugin.js';
import { initDb } from '../shared/postgresFunction.js';

import metricsPlugin from '../shared/metricsPlugin.js';

export const app = Fastify({
	logger: true
});

await app.register(metricsPlugin, { serviceName: "users", enableBizMetrics: false });	//	metrics

export const httpError = (code, message) => {
	const err = new Error(message);
	err.statusCode = code;
	return err;
}

const rootDir = dirname(fileURLToPath(import.meta.url));
//###### AVATAR UPLOADS DIRECTORY
export const uploadsDir = join(rootDir, './uploads/avatar');

console.log(`\nusersServer.js: rootDir: ${rootDir},\n
	uploadsDir: ${uploadsDir}\n`);

//###### STATIC PLUGIN ######
await app.register(fastifyStatic, {
	root: uploadsDir,
	prefix: '/avatar/'
});

//###### SWAGGER PLUGIN FOR DOCS ######
await app.register(fastifySwagger, {
	openapi: {
		openapi: '3.0.0',
		info: {
			title: 'Users swagger',
			description: 'Users service description',
			version: '0.1.0'
		},
		servers: [{ url: 'http://localhost:5000/api/v1/users' }],
		tags: [{ name: 'users', description: 'Users' }],
		components: {
			securitySchemes: {
				bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
			}
		}
	},
	exposeRoute: true,
	routePrefix: '/docs'
});

await app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true
  }
});

//###### PARSE MULTIPART FORM DATA ######
await app.register(fastifyMultipart, {
	limits: {
		fileSize: 5 * 1024 * 1024
	}
});

//###### PLUGIN PERSO ######
await app.register(authPlugin);
await app.register(postgresPlugin);

//###### USER ROUTES ######
await app.register(user.userRoutes);

//###### FRIENDS ROUTES ######
await app.register(friends.friendsRoutes);


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

app.get('/health', async (req, reply) => {
	reply.code(200).send({ status: 'ok' });
});

await app.ready();
//app.log.info('\nUSERS ROUTES:\n' + app.printRoutes());
//###### STARTING SERVER ######
const start = async () => {
	try {
		await initDb(app);
		await app.listen({ port: 5000, host: '0.0.0.0' });
	} catch (err) {
		console.error(`\nERROR userServer\n`);
		process.exit(1);
	}
}

start();
