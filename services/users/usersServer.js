import sqlite3 from 'sqlite3'

export const user_db = new sqlite3.Database('./users/data/usersDatabase.sqlite', (err) => {
	if (err)
	{
		console.error(err.message);
		throw new Error("userDB not init");
	}
	console.log(`\ndatabase\n`);
});

export const runDatabase = async function () {
	user_db.run(`PRAGMA foreign_keys = ON`, (err) => {
		if(err)
		{
			console.error(err.message);
			//throw new Error("PRAGMA error");
		}
			
	});
	user_db.run(`CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		email TEXT UNIQUE NOT NULL,
		password TEXT NOT NULL,
		avatar_path TEXT,
		createdAt TEXT,
		twofa_enabled INTEGER,
		twofa_secret TEXT UNIQUE,
		status TEXT
		)`, (err) => {
			if (err)
			{
				console.error(err.message);
				//throw new Error("user table run error");
			}
		});
	user_db.run(`CREATE TABLE IF NOT EXISTS refreshed_tokens (
		jwt_id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER REFERENCES users(id),
		token TEXT
		)`, (err) => {
			if(err)
			{
				console.error(err.message);
				//throw new Error("refreshed table run error");
			}
		});
	user_db.run(`CREATE TABLE IF NOT EXISTS friendships (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		sender_id INTEGER NOT NULL REFERENCES users(id),
		receiver_id INTEGER NOT NULL REFERENCES users(id),
		status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'refused', 'blocked', 'removed')),
		blocked_by INTEGER REFERENCES users(id),
		created_at TEXT,
		updated_at TEXT,
		UNIQUE (sender_id, receiver_id)
		)`, (err) => {
			if (err)
			{
				console.error(err.message);
			}
		});
}

export const httpError = (code, message) => {
	const err = new Error(message);
	err.statusCode = code;
	return err;
}
