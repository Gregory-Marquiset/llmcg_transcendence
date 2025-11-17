import fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as health from './routes/health.js'
import * as tournament from '../game/tournaments/tournaments.js'
import * as auth from '../users/auth/auth.js'
import { runDatabase } from '../users/usersServer.js'

const app = fastify({
	logger: true
});
const rootDir = dirname(fileURLToPath(import.meta.url));

app.register(fastifyStatic, {
	root: join(rootDir, '../../frontend/webapp/dist/')
});

runDatabase();

app.register(health.healthRoute);
app.register(health.ping);
app.register(tournament.tournamentsRoutes, {prefix: '/api/v1'});
app.register(auth.authRoutes, {prefix: '/api/v1'});

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
		app.log.error(err);
		process.exit(1);
	}
}

start();
