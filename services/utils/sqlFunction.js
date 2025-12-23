import { user_db } from '../users/usersServer.js'

export const getRowFromDB = (sql, params) => {
	return (new Promise((resolve, reject) => {
		user_db.get(sql, params, (err, row) => {
			if (err)
				reject(err);
			resolve(row);
		});
	}));
}

export const getAllRowsFromDB = (sql, params) => {
	return (new Promise((resolve, reject) => {
		user_db.all(sql, params, (err, rows) => {
			if (err)
				reject(err);
			resolve(rows);
		});
	}));
}

export const runSql = (sql, params) => {
	return (new Promise((resolve, reject) => {
		user_db.run(sql, params, (err) => {
			if (err)
				reject(err);
			resolve();
		});
	}));
}
