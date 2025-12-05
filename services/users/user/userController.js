import { pipeline } from 'node:stream/promises'
import * as fs from 'node:fs';

import { app, uploadsDir } from '../../gateway/server.js';
import { user_db, httpError } from '../usersServer.js';


export const userMe = async function (req, reply) {
	const selectFromDB = (sql, params) => {
		return (new Promise((resolve, reject) => {
			user_db.get(sql, params, (err, row) => {
				if (err)
					reject(err);
				resolve(row);
			});
		}));
	}

	const updateDb = (sql, params) => {
		return (new Promise((resolve, reject) => {
			user_db.run(sql, params, (err) => {
				if (err)
					reject(err);
				resolve();
			});
		}));
	}

	try {
		const user_in_db = await selectFromDB('SELECT * FROM users WHERE id = ?', [req.user.id]);
		if (!user_in_db.id || req.user.id !== user_in_db.id)
			throw httpError(401, "Invalid id");
		if (req.body.new_username)
		{
			user_in_db.username = req.body.new_username;
			const searchUsername = await selectFromDB('SELECT username FROM users WHERE (id != ? AND username = ?)', [req.user.id, req.body.new_username]);
			if (searchUsername && searchUsername.username)
				throw httpError(409, "Username is already taken");
		}
		if (req.body.new_email)
		{
			user_in_db.email = req.body.new_email;
			const searchEmail = await selectFromDB('SELECT email FROM users WHERE (id != ? AND email = ?)', [req.user.id, req.body.new_email]);
			if (searchEmail && searchEmail.email)
				throw httpError(409, "Email is already taken");
		}
		
		await updateDb('UPDATE users SET username = ?, email = ? WHERE id = ?', [user_in_db.username, user_in_db.email, req.user.id]);
		const newUserInfo = await selectFromDB('SELECT id, username, email, avatar_path, twofa_enabled, createdAt, status FROM users WHERE id = ?', [req.user.id]);
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
	const selectFromDB = (sql, params) => {
		return (new Promise((resolve, reject) => {
			user_db.get(sql, params, (err, row) => {
				if (err)
					reject(err);
				resolve(row);
			});
		}));
	}

	const insertToDB = (sql, params) => {
		return (new Promise((resolve, reject) => {
			user_db.run(sql, params, (err) => {
				if (err)
					reject(err);
				resolve();
			});
		}));
	}

	try {
		const data = await req.file();
		if (!data)
			throw httpError(500, "No data");
		if (data.mimetype !== "image/jpeg" && data.mimetype !== "image/png")
			throw httpError(400, "Wrong image type");
		const filetype = data.mimetype.substring(data.mimetype.indexOf("/") + 1);
		// console.log(`\nuserMeAvatar filetype: ${filetype}\n`);
		const filename = req.user.id + "_" + Date.now() + "." + filetype;
		// console.log(`\nuserMeAvatar filename: ${filename}\n`);
		// console.log(`\nuserMeAvatar uploadsDir: ${uploadsDir}\n`);
		const filepath = uploadsDir + filename;
		console.log(`\nuserMeAvatar filepath: ${filepath}\n`);
		await pipeline(data.file, fs.createWriteStream(filepath));

		const oldFileName = await selectFromDB('SELECT avatar_path FROM users WHERE id = ?', [req.user.id]);
		if (oldFileName?.avatar_path !== "default.jpg")
		{
			const oldFilepath = uploadsDir + oldFileName.avatar_path;
			fs.unlink(oldFilepath, () => {});
		}

		await insertToDB('UPDATE users SET avatar_path = ? WHERE id = ?', [filename, req.user.id]);
		reply.send({ avatar_url: filename });
	} catch (err)
	{
		console.error(`\nERROR userMeAvatar: ${err.message}\n`);
		if (err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}
