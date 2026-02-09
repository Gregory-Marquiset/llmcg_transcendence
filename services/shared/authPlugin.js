import fp from 'fastify-plugin';
import fastifyJWT from '@fastify/jwt';
import { getVaultSecret } from './vaultClient.js';

async function authPlugin(app) {

    const jwt = await getVaultSecret('secret/data/app/jwt');

    if (!jwt?.value) {
        throw new Error('JWT secret introuvable dans Vault');
    }

    await app.register(fastifyJWT, {
        secret: jwt.value
    });

    app.decorate('authenticate', async function (req, reply) {
        try {
            await req.jwtVerify();
        } catch (err) {
            app.log.error(err);
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });
}

export default fp(authPlugin);
