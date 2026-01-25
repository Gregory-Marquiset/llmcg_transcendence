
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

            await client.query(`CREATE TABLE badge_categories (
                id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name text UNIQUE NOT NULL,
                category text NOT NULL,
                color text NOT NULL,
                created_at timestamp DEFAULT CURRENT_TIMESTAMP
            )`);
            await client.query(`CREATE TABLE badges (
                badge_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                badge_category_id integer NOT NULL REFERENCES badge_categories(id) ON DELETE CASCADE,
                level integer NOT NULL CHECK (level IN (1, 2, 3)),
                description text NOT NULL,
                threshold integer NOT NULL,
                icon_path text NOT NULL,
                created_at timestamp DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (badge_category_id, level)
            )`);
            await client.query(`INSERT INTO badge_categories (name, category, color) VALUES
                    ('Trophee', 'Ranking', '#e3574c'),
                    ('Croissance', 'Productivity', '#72b242'),
                    ('Like', 'Number of friendship', '#3ea5d0'),
                    ('Medal', 'Number of days connected in a row', '#f69725'),
                    ('Screen', 'LogTime recap in the month (reset every month)', '#6bc7bd'),
                    ('Spaceship', 'Seniority on the app', '#7b689b'),
                    ('Idea', 'Number of upload', '#e6c437')
                ON CONFLICT (name) DO NOTHING
            `);
            await client.query(`INSERT INTO badges (badge_category_id, level, description, threshold, icon_path) VALUES
                    ((SELECT id FROM badge_categories WHERE name = 'Trophee'), 1, 'Under top 10', 10, 'trophee/silver.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Trophee'), 2, 'Under top 3', 3, 'trophee/regular.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Trophee'), 3, 'Top 1', 1, 'trophee/gold.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Croissance'), 1, '10 tasks completed', 10, 'croissance/silver.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Croissance'), 2, '100 tasks completed', 100, 'croissance/regular.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Croissance'), 3, '500 tasks completed', 500, 'croissance/gold.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Like'), 1, '1 friend', 1, 'like/silver.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Like'), 2, '10 friends', 10, 'like/regular.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Like'), 3, '30 friends', 30, 'like/gold.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Medal'), 1, '1 week', 7, 'medal/silver.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Medal'), 2, '1 month', 30, 'medal/regular.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Medal'), 3, '3 months', 90, 'medal/gold.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Screen'), 1, '1 hour', 1, 'screen/silver.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Screen'), 2, '30 hours', 30, 'screen/regular.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Screen'), 3, '100 hours', 100, 'screen/gold.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Spaceship'), 1, '1 day', 1, 'spaceship/silver.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Spaceship'), 2, '3 months', 90, 'spaceship/regular.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Spaceship'), 3, '1 year', 365, 'spaceship/gold.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Idea'), 1, '1 file uploaded', 1, 'idea/silver.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Idea'), 2, '10 files uploaded', 10, 'idea/regular.png'),
                    ((SELECT id FROM badge_categories WHERE name = 'Idea'), 3, '50 files uploaded', 50, 'idea/gold.png')
                ON CONFLICT (badge_category_id, level) DO NOTHING
            `);
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
        });
    } catch (err) {
        console.error(`\nERROR initDb: ${err.message}\n`);
        throw err;
    }
}