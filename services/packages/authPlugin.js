import fp from 'fastify-plugin'
import fastifyJWT from '@fastify/jwt'
import dotenv from 'dotenv'

async function authPlugin (app, opts) {
    dotenv.config();
    if (!process.env.JWT_SECRET)    
        throw new Error('JWT_SECRET manquant dans les variables d’environnement');
    app.register(fastifyJWT, {
        secret: process.env.JWT_SECRET,
    });

    app.decorate("authenticate", async function (req, reply) {
        try {
            await req.jwtVerify();
        } catch (err) {
            console.error(`\nERROR: ${err.message}\n`);
            reply.code(401).send({ error: "Unauthorized" });
        }
    })
}

export default fp(authPlugin)
