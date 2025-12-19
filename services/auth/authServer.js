import Fastify from 'fastify';
import fastifyBcrypt from 'fastify-bcrypt';
import fastifyCookie from '@fastify/cookie';

//###IMPORT OWN FILES ###
import * as auth from './routes/auth.js';
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

//###### COOKIE PLUGIN ######
app.register(fastifyCookie);

//###### HASH DU PASSWORD #######
app.register(fastifyBcrypt, {
	saltWorkFactor: 12
});

//###### PLUGIN PERSO ######
app.register(authPlugin);
app.register(postgresPlugin);

//###### AUTH ROUTES ######
app.register(auth.authRoutes);

//###### ERROR HANDLER ######
app.setErrorHandler((error, req, reply) => {
    app.log.error(error);
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500)
        return (reply.code(error.statusCode).send({ message: error.message }));
    reply.code(500).send({ message: "Internal server error "});
});
app.setNotFoundHandler((req, reply) => {
    app.log.info('\nexecuting setNotFoundHandler\n');
    reply.code(404).send( { message: '404 Not Found' });
});

//###### LANCEMENT DU SERV ######
const start = async () => {
    try {
        await app.listen({ port: 5000, host: '0.0.0.0' });
        await initDb(app);
    } catch (err) {
        console.error(`\nERROR authServer\n`);
        process.exit(1);
    }
}

start();