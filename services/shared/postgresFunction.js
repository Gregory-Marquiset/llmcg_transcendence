
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
                id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                username varchar(30) UNIQUE NOT NULL,
                email varchar(50) UNIQUE NOT NULL,
                password text NOT NULL,
                avatar_path text NOT NULL,
                createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
                twofa_enabled boolean DEFAULT false,
                twofa_secret text UNIQUE)`);

            await client.query(`CREATE TABLE IF NOT EXISTS refreshed_tokens (
                jwt_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token text NOT NULL)`);

            await client.query(`CREATE TABLE IF NOT EXISTS friendships (
                id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                sender_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                receiver_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                status varchar(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'refused', 'blocked', 'removed')),
                created_at timestamp DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp,
                UNIQUE (sender_id, receiver_id))`);
        });
    } catch (err) {
        console.error(`\nERROR initDb: ${err.message}\n`);
        throw err;
    }
}