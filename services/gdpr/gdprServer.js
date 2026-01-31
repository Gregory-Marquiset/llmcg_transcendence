import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharedMetricsPlugin = require("../shared/metricsPlugin.js");

import authPlugin from '../shared/authPlugin.js';
import postgresPlugin from '../shared/postgresPlugin.js';

// Import des routes
import { gdprRoutes } from './routes/gdpr.js';
// import { eventsRoutes } from './routes/events.js';

export const app = Fastify({
    logger: true
});


// ===== METRICS =====
await app.register(sharedMetricsPlugin, { serviceName: "statistics" });

// ===== SWAGGER =====
await app.register(fastifySwagger, {
    openapi: {
        openapi: '3.0.0',
        info: {
            title: 'Statistics Service',
            description: 'Service de gestion des statistiques utilisateurs',
            version: '1.0.0'
        },
        servers: [
            { url: 'http://localhost:5000', description: 'Statistics Service' }
        ],
        tags: [
            { name: 'stats', description: 'Récupération des statistiques' },
            { name: 'events', description: 'Tracking des événements' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
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

// ===== PLUGINS =====
await app.register(authPlugin);
await app.register(postgresPlugin);
// ===== ROUTES =====
await app.register(gdprRoutes);

// ===== HEALTH CHECK =====
app.get('/health', async (req, reply) => {
    return { status: 'ok', service: 'statistics' };
});

// ===== ERROR HANDLER =====
app.setErrorHandler((error, req, reply) => {
    app.log.error(error);
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500)
        return reply.code(error.statusCode).send({ message: error.message });
    reply.code(500).send({ message: "Internal server error" });
});

app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({ message: '404 Not found' });
});


// ===== START SERVER =====
const start = async () => {
    try {
        await app.listen({ port: 5000, host: '0.0.0.0' });
        app.log.info('gdpr service started on port 5000');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();

export const httpError = (code, message) => {
    const err = new Error(message);
    err.statusCode = code;
    return err;
}