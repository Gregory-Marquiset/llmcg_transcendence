import fp from 'fastify-plugin';
import dotenv from 'dotenv';
import fastifyPostgres from '@fastify/postgres';

async function postgresPlugin (app, opts) {
    dotenv.config();
    if (!process.env.DATABASE_URL)
        throw new Error(`DATABASE_URL manquant dans les variables d'environnement`);
    app.register(fastifyPostgres, {
        connectionString: process.env.DATABASE_URL
    });
}

export default fp(postgresPlugin);