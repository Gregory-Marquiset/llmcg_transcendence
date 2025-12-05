import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyBcrypt from 'fastify-bcrypt'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
//###IMPORT OWN FILES ###
import * as health from './routes/health.js'
import * as tournament from '../game/tournaments/tournaments.js'
import * as auth from '../users/auth/auth.js'
import * as user from '../users/user/user.js'
import { runDatabase } from '../users/usersServer.js'
import authPlugin from '../packages/authPlugin.js'

export const app = Fastify({
	logger: true
});

//###### PLUGIN ######
const rootDir = dirname(fileURLToPath(import.meta.url));
console.log(`\nserver.js rootDir: ${rootDir}\n`);
app.register(fastifyStatic, {
	root: join(rootDir, '../users/uploads/avatar/'),
	prefix: '/avatars/',
	decorateReply: false
});

app.register(fastifyStatic, {
	root: join(rootDir, '../../frontend/webapp/dist/')
});

app.register(fastifySwagger, {
	openapi: {
		openapi: '3.0.0',
		info: {
			title: 'Test swagger',
			description: 'Testing the Fastify swagger API',
			version: '0.1.0'
	},
	servers: [
	  {
		url: 'http://localhost:5000',
		description: 'Development server'
	  }
	],
	tags: [
	  { name: 'user', description: 'User related end-points' },
	  { name: 'code', description: 'Code related end-points' }
	],
	components: {
	  securitySchemes: {
		apiKey: {
			type: 'apiKey',
			name: 'apiKey',
			in: 'header'
		}
	  }
	},
	externalDocs: {
	  url: 'https://swagger.io',
	  description: 'Find more info here'
	}
  }
});

app.register(fastifySwaggerUi, {
	routePrefix: '/docs',
	uiConfig: {
		docExpansion: 'list',
		deepLinking: false
	}
});

app.register(fastifyCookie);
app.register(authPlugin);

//###### PARSE MULTIPART FORM DATA ######
app.register(fastifyMultipart, {
	limits: {
		fileSize: 5 * 1024 * 1024
	}
});


//###### HASH DU PASSWORD #######
app.register(fastifyBcrypt, {
	saltWorkFactor: 12
});

//###### JWT ######
// dotenv.config();
// if (!process.env.JWT_SECRET)
// 	throw new Error('JWT_SECRET manquant dans les variables d’environnement');
// app.register(fastifyJwt, {
// 	secret: process.env.JWT_SECRET
// });


//###### RUN DATABASE ######
runDatabase();

//###### AVATAR UPLOADS DIRECTORY
export const uploadsDir = join(rootDir, '../users/uploads/avatar/');

//####### ROUTES #######
app.register(health.healthRoute);
app.register(health.ping);
app.register(tournament.tournamentsRoutes, { prefix: '/api/v1' });
app.register(auth.authRoutes, { prefix: '/api/v1' });
app.register(user.userRoutes, { prefix: '/api/v1' });



//###### ERROR HANDLER ######
app.setErrorHandler((error, req, reply) => {
		app.log.error(error);
		if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500)
				return (reply.code(error.statusCode).send({ message: error.message}));
		reply.code(500).send({ message: "Internal server error" });
});
app.setNotFoundHandler(function (req, reply) {
		app.log.info('\nexecuting setNotFoundHandler\n');
		reply.code(404).send( { message:'404 Not found' });
});




//###### FRONT ###### (surement à changer)
app.get('/', async (req, reply) => {
	return reply.sendFile('index.html');
});
app.get('/tournois', async (req, reply) => {
	return reply.sendFile('index.html');
});
app.get('/jeu', async (req, reply) => {
	return reply.sendFile('index.html');
});


const start = async () => {
	try {
		await app.listen({port: 5000, host: '0.0.0.0'})
	} catch (err) {
		app.log.error(`\n${err}\n`);
		process.exit(1);
	}
}

start();
