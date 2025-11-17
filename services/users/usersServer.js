import sqlite3 from 'sqlite3'

export const db = new sqlite3.Database('./users/data/usersDatabase.sqlite', (err) => {
	if (err)
		return (console.error(err.message));
	console.log(`
		
		database
		
		`)
});

export const runDatabase = async function () {
	db.run(`CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT,
		email TEXT UNIQUE,
		password TEXT,
		createdAt TEXT
		)`, (err) => {
			if (err)
				return (console.error(err.message));
		});
}

// export const createUser = async function () {
// 	db.run();
// }
