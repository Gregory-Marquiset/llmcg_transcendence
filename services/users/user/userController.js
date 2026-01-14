import { pipeline } from 'node:stream/promises';
import * as fs from 'node:fs';

import { app, uploadsDir, httpError } from '../usersServer.js';
import { getRowFromDB, getAllRowsFromDb, runSql } from '../../shared/postgresFunction.js';


export const userMe = async function (req, reply) {

	try {
		const user_in_db = await getRowFromDB(app.pg, 'SELECT * FROM users WHERE id = $1', [req.user.id]);
		if (!user_in_db.id || req.user.id !== user_in_db.id)
			throw httpError(401, "Invalid id");
		if (req.body.new_username)
		{
			user_in_db.username = req.body.new_username;
			const searchUsername = await getRowFromDB(app.pg, 'SELECT username FROM users WHERE (id != $1 AND username = $2)', [req.user.id, req.body.new_username]);
			if (searchUsername && searchUsername.username)
				throw httpError(409, "Username is already taken");
		}
		if (req.body.new_email)
		{
			user_in_db.email = req.body.new_email;
			const searchEmail = await getRowFromDB(app.pg, 'SELECT email FROM users WHERE (id != $1 AND email = $2)', [req.user.id, req.body.new_email]);
			if (searchEmail && searchEmail.email)
				throw httpError(409, "Email is already taken");
		}
		
		await runSql(app.pg, 'UPDATE users SET username = $1, email = $2 WHERE id = $3', [user_in_db.username, user_in_db.email, req.user.id]);
		const newUserInfo = await getRowFromDB(app.pg, 'SELECT id, username, email, avatar_path, twofa_enabled, createdAt FROM users WHERE id = $1', [req.user.id]);
		console.log(`\nuserMe newUserInfo: ${JSON.stringify(newUserInfo)}\n`);
		return (reply.code(200).send(newUserInfo));
	} catch (err) {
		console.error(`\nERROR userMe: ${err.message}\n`);
		if (err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}



export const userMeAvatar = async function (req, reply) {

	try {
		const data = await req.file();
		if (!data)
			throw httpError(500, "No data");
		if (data.mimetype !== "image/jpeg" && data.mimetype !== "image/png")
			throw httpError(400, "Wrong image type");
		const filetype = data.mimetype.substring(data.mimetype.indexOf("/") + 1);
		// console.log(`\nuserMeAvatar filetype: ${filetype}\n`);
		const filename = req.user.id + "_" + Date.now() + "." + filetype;
		console.log(`\nuserMeAvatar filename: ${filename}\n`);
		console.log(`\nuserMeAvatar uploadsDir: ${uploadsDir}\n`);
		const filepath = uploadsDir + '/' + filename;
		console.log(`\nuserMeAvatar filepath: ${filepath}\n`);
		await pipeline(data.file, fs.createWriteStream(filepath));

		const oldFileName = await getRowFromDB(app.pg, 'SELECT avatar_path FROM users WHERE id = $1', [req.user.id]);
		if (oldFileName?.avatar_path !== "default.jpg")
		{
			const oldFilepath = uploadsDir + oldFileName.avatar_path;
			fs.unlink(oldFilepath, () => {});
		}

		await runSql(app.pg, 'UPDATE users SET avatar_path = $1 WHERE id = $2', [`avatar/${filename}`, req.user.id]);
		reply.send({ avatar_url: `avatar/${filename}` });
	} catch (err)
	{
		console.error(`\nERROR userMeAvatar: ${err.message}\n`);
		if (err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}



export const userProfil = async function (req, reply) {
	try {
		const userInDb = await getRowFromDB(app.pg, `SELECT id, username, avatar_path FROM users WHERE username = $1`, [req.params.targetUsername]);
		if (!userInDb)
			throw httpError(404, "User not found");
		const isBlocked = await getRowFromDB(app.pg, `SELECT status FROM friendships WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`,
			[req.user.id, userInDb.id]);
		if (isBlocked?.status === "blocked")
			throw httpError(401, "Unhauthorized");
		reply.code(200).send(userInDb);
	} catch (err) {
		console.error(`ERROR userProfil: ${ err.message }`);
		if (err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}
