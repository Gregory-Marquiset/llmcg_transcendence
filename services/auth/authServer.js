import Fastify from 'fastify';
import fastifyBcrypt from 'fastify-bcrypt';
import fastifyCookie from '@fastify/cookie';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import 'dotenv/config';

//###IMPORT OWN FILES ###
import * as auth from './routes/auth.js';
import authPlugin from '../shared/authPlugin.js';
import postgresPlugin from '../shared/postgresPlugin.js';
import { initDb } from '../shared/postgresFunction.js';

import metricsPlugin from '../shared/metricsPlugin.js';
import oauthPlugin from '@fastify/oauth2';

export const app = Fastify({
    logger: true
});

await app.register(metricsPlugin, { serviceName: "auth", enableBizMetrics: true }); //  metrics

export const httpError = (code, message) => {
	const err = new Error(message);
	err.statusCode = code;
	return err;
}

//###### CORS PLUGIN ###### 
await app.register(cors, {
    origin: 'http://localhost:5173',
    credentials: true
});

//###### SWAGGER PLUGIN FOR DOCS ######
await app.register(fastifySwagger, {
    openapi: {
        openapi: '3.0.0',
        info: {
            title: 'Auth swagger',
            description: 'Auth service description',
            version: '0.1.0'
        },
        servers: [{ url: 'http://localhost:5000/api/v1/auth' }],
        tags: [{ name: 'auth', description: 'Authentication' }],
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
})
//###### COOKIE PLUGIN ######
await app.register(fastifyCookie);

//###### HASH DU PASSWORD #######
await app.register(fastifyBcrypt, {
	saltWorkFactor: 12
});

//###### PLUGIN PERSO ######
await app.register(authPlugin);
await app.register(postgresPlugin);

//###### AUTH ROUTES ######
await app.register(auth.authRoutes);

//###### ERROR HANDLER ######
app.setErrorHandler((error, req, reply) => {
    app.log.error(error);
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500)
        return (reply.code(error.statusCode).send({ message: error.message }));
    reply.code(500).send({ message: "Internal server error" });
});
app.setNotFoundHandler((req, reply) => {
    app.log.info('\nexecuting setNotFoundHandler\n');
    reply.code(404).send({ message: '404 Not Found' });
});

app.get('/health', async (req, reply) => {
  reply.code(200).send({ status: 'ok' });
});

await app.register(oauthPlugin, {
  name: 'fortyTwoOAuth2',
  credentials: {
    client: {
      id: process.env.FORTY_TWO_CLIENT_ID,
      secret: process.env.FORTY_TWO_CLIENT_SECRET,
    },
    auth: {
      authorizeHost: 'https://api.intra.42.fr',
      authorizePath: '/oauth/authorize',
      tokenHost: 'https://api.intra.42.fr',
      tokenPath: '/oauth/token',
    },
  },
  scope: ['public'],
  startRedirectPath: '/login/42',
  callbackUri: 'http://localhost:5000/api/v1/auth/login/42/callback',
})

await app.ready();
//app.log.info('\nAUTH ROUTES:\n' + app.printRoutes());
//###### STARTING SERVER ######
const start = async () => {
  try {
    await initDb(app);
    console.log(process.env.FORTY_TWO_CLIENT_ID)
    console.log(process.env.FORTY_TWO_CLIENT_SECRET)
    
        await app.listen({ port: 5000, host: '0.0.0.0' });
    } catch (err) {
        console.error(`\nERROR authServer\n`);
        process.exit(1);
    }
}

start();
