import fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const app = fastify({
	logger: true
});
const rootDir = dirname(fileURLToPath(import.meta.url));

app.register(fastifyStatic, {
	root: join(rootDir, '../../frontend/webapp/dist/')
});

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
