
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
            await client.query(`SELECT pg_advisory_lock(424242);`);
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

            await client.query(`CREATE TABLE IF NOT EXISTS user_stats (
                id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                user_id integer UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                rank_position integer DEFAULT 0,
                task_completed integer DEFAULT 0,
                friends_count integer DEFAULT 0,
                streaks_history integer DEFAULT 0,
                current_streak_count integer DEFAULT 0,
                monthly_logtime integer DEFAULT 0,
                monthly_logtime_month text,
                app_seniority integer DEFAULT 0,
                upload_count integer DEFAULT 0,
                created_at timestamp DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp,
                last_login timestamp)
                `);
            await client.query(`CREATE TABLE IF NOT EXISTS todo_list (
                id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                user_id integer UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title text UNIQUE NOT NULL,
                description text,
                done boolean DEFAULT false,
                deadline timestamp,
                created_at timestamp DEFAULT NOW(),
                UNIQUE(user_id, title) )`);
            await client.query(`SELECT pg_advisory_unlock(424242);`);
        });
    } catch (err) {
        console.error(`\nERROR initDb: ${err.message}\n`);
        throw err;
    }
}