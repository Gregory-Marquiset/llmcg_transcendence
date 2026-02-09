import fp from 'fastify-plugin';
import pg from 'pg';
import { getPostgresCreds } from './vaultClient.js';

async function dynamicPostgresPlugin(app, opts) {
    let currentPool = null;
    let rotationTimer = null;
    
    const dbHost = process.env.DB_HOST || 'postgres';
    const dbName = process.env.DB_NAME || 'transcendance_database';


    const createPool = async () => {
        app.log.info("[DB Rotation] Récupération identifiants Vault...");
        const { username, password, lease_duration } = await getPostgresCreds();

        const newPool = new pg.Pool({
            host: dbHost,
            database: dbName,
            user: username,
            password: password,
            port: 5432,
            max: 10,
            idleTimeoutMillis: 30000,
        });

        const client = await newPool.connect();
        client.release();

        app.log.info(`[DB Rotation] Pool prêt (User: ${username}). TTL: ${lease_duration}s`);
        return { newPool, lease_duration };
    };


    const rotateCredentials = async () => {
        try {
            const { newPool, lease_duration } = await createPool();
            const oldPool = currentPool;

            currentPool = newPool;

            if (oldPool) {
                oldPool.end().catch(err => app.log.error(err, "Erreur fermeture ancien pool"));
            }

            const nextRotationMs = (lease_duration * 1000) * 0.8;
            
            clearTimeout(rotationTimer);
            rotationTimer = setTimeout(rotateCredentials, nextRotationMs);

        } catch (err) {
            app.log.error(err, "❌ [DB Rotation] Échec. Réessai dans 10s.");
            setTimeout(rotateCredentials, 10000);
        }
    };

    await rotateCredentials();

    app.decorate('pg', {
        query: async (text, params) => {
            if (!currentPool) throw new Error("Database initializing...");
            return currentPool.query(text, params);
        },
        
        connect: async () => {
            if (!currentPool) throw new Error("Database initializing...");
            return currentPool.connect();
        },

        transact: async (callback) => {
            if (!currentPool) throw new Error("Database initializing...");
            
            const client = await currentPool.connect();
            try {
                await client.query('BEGIN');
                const result = await callback(client);
                await client.query('COMMIT');
                return result;
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        },

        get pool() {
            return currentPool;
        }
    });

    app.addHook('onClose', async (instance) => {
        clearTimeout(rotationTimer);
        if (currentPool) await currentPool.end();
    });
}

export default fp(dynamicPostgresPlugin);