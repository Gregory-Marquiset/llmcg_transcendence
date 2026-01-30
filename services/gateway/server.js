import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyBcrypt from 'fastify-bcrypt'
import fastifyCookie from '@fastify/cookie'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyWebsocket from '@fastify/websocket'
import fastifyHttpProxy from '@fastify/http-proxy'

// import { dirname, join } from 'node:path'
// import { fileURLToPath } from 'node:url'
//###IMPORT OWN FILES ###
import * as health from './routes/health.js'
//import * as auth from '../auth/auth.js'
//import * as user from '../users/user/user.js'
//import * as friends from '../users/friends/friends.js'
import * as wsHandler from './websocketHandler/websocketHandler.js'
//import { runDatabase } from '../users/usersServer.js'
import authPlugin from '../shared/authPlugin.js'
//Metrics for Prometheus
import metricsPlugin from "../shared/metricsPlugin.js";	//	metrics

export const app = Fastify({
	logger: true
});

await app.register(metricsPlugin, { serviceName: "gateway", enableBizMetrics: false });	//	metrics

// // metrics HTTP node
// await app.register(metricsPlugin, {
//   endpoint: '/metrics',
//   routeMetrics: {
//     customLabels: { service: 'gateway' },
//     routeBlacklist: ['/metrics']
//   }
// });

//const rootDir = dirname(fileURLToPath(import.meta.url));
//###### AVATAR UPLOADS DIRECTORY
//export const uploadsDir = join(rootDir, '../users/uploads/avatar/');

//###### STATIC PLUGIN ######
// console.log(`\nserver.js rootDir: ${rootDir}\n`);
// app.register(fastifyStatic, {
// 	root: join(rootDir, '../users/uploads/avatar/'),
// 	prefix: '/avatars/',
// 	decorateReply: false
// });

// app.register(fastifyStatic, {
// 	root: join(rootDir, '../../frontend/webapp/dist/')
// });

//###### HTTP PROXY PLUGIN ######
await app.register(fastifyHttpProxy, {
	upstream: 'http://auth-service:5000',
	prefix: '/api/v1/auth'
});

await app.register(fastifyHttpProxy, {
	upstream: 'http://users-service:5000',
	prefix: '/api/v1/users'
});

await app.register(fastifyHttpProxy, {
	upstream: 'http://auth-service:5000',
	prefix: '/_docs/auth',
	rewritePrefix: '/docs'
});

await app.register(fastifyHttpProxy, {
	upstream: 'http://statistics-service:5000',
	prefix: '/_docs/statistics',
	rewritePrefix: '/docs'
});

await app.register(fastifyHttpProxy, {
	upstream: 'http://statistics-service:5000',
	prefix: '/api/v1/statistics'
});

await app.register(fastifyHttpProxy, {
	upstream: 'http://users-service:5000',
	prefix: '/_docs/users',
	rewritePrefix: '/docs'
});

await app.register(fastifyHttpProxy, {
	upstream: 'http://users-service:5000',
	prefix: '/avatar',
	rewritePrefix: '/avatar'
});

//###### SWAGGER PLUGIN FOR DOCS ######
// app.register(fastifySwagger, {
// 	openapi: {
// 		openapi: '3.0.0',
// 		info: {
// 			title: 'Test swagger',
// 			description: 'Testing the Fastify swagger API',
// 			version: '0.1.0'
// 	},
// 	servers: [
// 	  {
// 		url: 'http://localhost:5000',
// 		description: 'Development server'
// 	  }
// 	],
// 	tags: [
// 	  { name: 'user', description: 'User related end-points' },
// 	  { name: 'code', description: 'Code related end-points' }
// 	],
// 	components: {
// 	  securitySchemes: {
// 		apiKey: {
// 			type: 'apiKey',
// 			name: 'apiKey',
// 			in: 'header'
// 		}
// 	  }
// 	},
// 	externalDocs: {
// 	  url: 'https://swagger.io',
// 	  description: 'Find more info here'
// 	}
//   }
// });

await app.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.0',
    info: { title: 'Gateway docs', version: '1.0.0' }
  },
  exposeRoute: false
})

await app.register(fastifySwaggerUi, {
	routePrefix: '/docs',
	uiConfig: {
		urls: [
			{ name: 'Auth service', url: '/_docs/auth/json' },
			{ name: 'Users Service', url: '/_docs/users/json' }
		],
		docExpansion: 'list',
		deepLinking: true
	}
});

//###### COOKIE PLUGIN ######
// app.register(fastifyCookie);

//###### PLUGIN PERSO ######
await app.register(authPlugin);

//###### WEBSOCKET PLUGIN ######
await app.register(fastifyWebsocket, {
	options: { maxPayload: 1048576 }
});

//###### PARSE MULTIPART FORM DATA ######
// app.register(fastifyMultipart, {
// 	limits: {
// 		fileSize: 5 * 1024 * 1024
// 	}
// });


//###### HASH DU PASSWORD #######
await app.register(fastifyBcrypt, {
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
//runDatabase();



//####### ROUTES #######
await app.register(health.healthRoute);
await app.register(health.ping);
// app.register(auth.authRoutes, { prefix: '/api/v1' });
// app.register(user.userRoutes, { prefix: '/api/v1' });
// app.register(friends.friendsRoutes, { prefix: '/api/v1' });

//###### WEBSOCKET ROUTES ######
await app.register(async function (app){
	app.get('/ws', { websocket: true }, wsHandler.websocketHandler);
});



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




//###### LANCEMENT DU SERV ######
const start = async () => {
	try {
		await app.listen({port: 5000, host: '0.0.0.0'})
		setInterval(wsHandler.heartbeat, 30000);
	} catch (err) {
		app.log.error(`\n${err}\n`);
		process.exit(1);
	}
}

start();
