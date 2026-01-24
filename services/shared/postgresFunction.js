
export const getRowFromDB = async (db, sql, params) => {
    const res = await db.query(sql, params);
    return (res.rows[0] ?? null);
}

export const getAllRowsFromDb = async (db, sql, params) => {
    const res = await db.query(sql, params);
    return (res.rows);
}

export const runSql = async (db, sql, params) => {
    const res = await db.query(sql, params);
    return (res.rowCount);
}

export const initDb = async function (app) {
    try {
        await app.pg.transact(async (client) => {
            await client.query(`CREATE TABLE IF NOT EXISTS users (
                id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                username text UNIQUE NOT NULL,
                email text UNIQUE NOT NULL,
                password text NOT NULL,
                avatar_path text NOT NULL,
                createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
                twofa_enabled boolean DEFAULT false,
                twofa_secret text UNIQUE)`);

            await client.query(`CREATE TABLE IF NOT EXISTS refreshed_tokens (
                jwt_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token text NOT NULL)`);

            await client.query(`CREATE TABLE IF NOT EXISTS friendships (
                id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                sender_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                receiver_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                status text NOT NULL CHECK (status IN ('pending', 'accepted', 'refused', 'blocked', 'removed')),
                blocked_by integer REFERENCES users(id) ON DELETE CASCADE,
                created_at timestamp DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp,
                UNIQUE (sender_id, receiver_id))`);
            
            await client.query(`CREATE TABLE IF NOT EXISTS chat_history (
                id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                from_user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                to_user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content text NOT NULL,
                request_id text UNIQUE NOT NULL,
                client_sent_at text,
                delivered_at text)`);
        });
    } catch (err) {
        console.error(`\nERROR initDb: ${err.message}\n`);
        throw err;
    }
}
