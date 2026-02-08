import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fs from 'fs'

//### IMPORT OWN FILES ###
import * as chat from './routes/chat.js';
import authPlugin from '../shared/authPlugin.js';
import postgresPlugin from '../shared/postgresPlugin.js';
import { initDb } from '../shared/postgresFunction.js';

export const app = Fastify({
	logger: true,
	https: {
		key:  fs.readFileSync('/vault/secrets/chat.key'),
		cert: fs.readFileSync('/vault/secrets/chat.crt'),
		ca:   fs.readFileSync('/vault/secrets/ca.crt'),
  }
});

export const httpError = (code, message) => {
	const err = new Error(message);
	err.statusCode = code;
	return err;
}

//###### SWAGGER PLUGIN FOR DOCS ######
await app.register(fastifySwagger, {
	openapi: {
		openapi: '3.0.0',
		info: {
			title: 'Chat swagger',
			description: 'Chat service description',
			version: '0.1.0'
		},
		servers: [{ url: 'https://localhost:5000/api/v1/chat' }],
		tags: [{ name: 'chat', description: 'Chat' }],
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

//###### PLUGIN PERSO ######
await app.register(authPlugin);
await app.register(postgresPlugin);

//###### CHAT ROUTES ######
await app.register(chat.chatRoutes);

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
//app.log.info('\nCHAT ROUTES:\n' + app.printRoutes());
//###### STARTING SERVER ######
const start = async () => {
	try {
		await initDb(app);
		await app.listen({ port: 5000, host: '0.0.0.0' });
	} catch (err) {
		console.error(`\nERROR chatServer\n`);
		process.exit(1);
	}
}

start();
