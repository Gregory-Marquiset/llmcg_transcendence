import { app } from '../../gateway/server.js';
import { user_db } from '../usersServer.js';
import { authenticator } from 'otplib';

export const authRegister = async function (req, reply) {
	console.log(`\n${JSON.stringify(req.body)}\n`);

	const now = new Date();
	const dateTime = `${now.getDate()}-${now.getMonth()}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

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
		const hashedPWD = await app.bcrypt.hash(req.body.password);

		const result = await insertToDB(`INSERT INTO users(username, email, password, createdAt, twofa_enabled) 
			VALUES (?, ?, ?, ?, ?)`, [req.body.username, req.body.email, hashedPWD, dateTime, 0]);
		
		return (reply.code(201).send("New entry in database"));
	} catch (err) {
		const e = new Error(err.message);
		e.statusCode = 409;
		throw e;
	}
}



export const authLogin = async function (req, reply) {
	console.log(`\n${JSON.stringify(req.body)}\n`);

	const selectFromDB = (sql, params) => {
		return (new Promise((resolve, reject) => {
			user_db.get(sql, params, (err, row) => {
				if (err)
					reject(err);
				resolve(row);
			});
		}));
	}

	const insertToken = (sql, params) => {
		return (new Promise((resolve, reject) => {
			user_db.run(sql, params, (err) => {
				if (err)
					reject(err);
				resolve();
			});
		}));
	}

	try {
		const userHashedPassword = await selectFromDB('SELECT password FROM users WHERE email = ?', [req.body.email]);

		const match = await app.bcrypt.compare(req.body.password, userHashedPassword.password);
		if (match === true)
		{
			const userInfo = await selectFromDB('SELECT id, username FROM users WHERE email = ?', [req.body.email]);
			console.log(`\n${JSON.stringify(userInfo)}\n`);

			const access_tok = app.jwt.sign(userInfo , { expiresIn: '5m' });
			const refresh_tok = app.jwt.sign(userInfo , { expiresIn: '1d' });

			console.log(`\naccess_token: ${access_tok}\nrefresh_token: ${refresh_tok}\n`);

			const add_to_db = await insertToken(`INSERT INTO refreshed_tokens(user_id, token)
				VALUES (?, ?)`, [userInfo.id, refresh_tok]);

			return (reply.
				setCookie('refreshToken', refresh_tok, {
					httpOnly: true,
					path: '/',
					maxAge: 24 * 60 * 60
				})
				.code(200)
				.send( { access_token: access_tok }));
		}
		const err = new Error("Invalid email or password");
		err.statusCode = 401;
		throw err;
	} catch (err) {
		if(err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}


//le front met un header dans la req: Authorization: Bearer <token>
export const authMe = async function (req, reply) {
	console.log(`\n${JSON.stringify(req.user)}\n`);

	const selectFromDB = (sql, params) => {
		return (new Promise((resolve, reject) => {
			user_db.get(sql, params, (err, row) => {
				if (err)
					reject(err);
				resolve(row);
			});
		}));
	}
	
	try {
		const userInfos = await selectFromDB('SELECT id, username, email, createdAt FROM users WHERE id = ?', req.user.id);
		console.log(`\n${JSON.stringify(userInfos)}\n`);
		return (reply.code(200).send(userInfos));
	} catch (err) {
		const e = new Error("Error with Database");
		e.statusCode = 500;
		throw e;
	}
}



export const authRefresh = async function (req, reply) {
	const checkToken = (sql, params) => {
		return (new Promise((resolve, reject) => {
			user_db.get(sql, params, (err, row) => {
				if (err)
					reject(err);
				resolve(row);
			});
		}));
	}

	const replaceToken = (sql, params) => {
		return (new Promise((resolve, reject) => {
			user_db.run(sql, params, (err) => {
				if (err)
					reject(err);
				resolve();
			})
		}))
	}

	try {
		app.jwt.verify(req.cookies.refreshToken);
		const old_token_in_db = await checkToken(`SELECT token FROM refreshed_tokens WHERE token = ?`, req.cookies.refreshToken);
		console.log(`\nold token in db: ${old_token_in_db.token}\n`);
		
		const decoded = app.jwt.decode(req.cookies.refreshToken);
		const new_access_token = app.jwt.sign({id: decoded.id, username: decoded.username} , { expiresIn: '5m' });
		const new_refresh_token = app.jwt.sign({id: decoded.id, username: decoded.username}, { expiresIn: '1d' });
		console.log(`new refresh token not in db: ${new_refresh_token}\n`);

		await replaceToken(`UPDATE refreshed_tokens SET token = REPLACE(token, ?, ?)`, [req.cookies.refreshToken, new_refresh_token]);
		return (reply
			.clearCookie('refreshToken', { path: '/' })
			.setCookie('refreshToken', new_refresh_token, {
				httpOnly: true,
				path: '/',
				maxAge: 24 * 60 * 60
			})
			.code(201)
			.send( { access_token: new_access_token }));
	} catch (err)
	{
		console.error(err.message);
		throw err;
	}
}



export const authLogout = async function (req, reply) {
	const deleteFromDB = (sql, params) => {
		return (new Promise((resolve, reject) => {
			user_db.run(sql, params, (err) => {
				if (err)
					reject(err);
				resolve();
			});
		}));
	}

	try {
		//console.log(`\n${req.cookies.refreshToken}\n`);
		app.jwt.verify(req.cookies.refreshToken);
		const result = await deleteFromDB(`DELETE FROM refreshed_tokens WHERE token = ?`, req.cookies.refreshToken);
		return (reply.clearCookie('refreshToken', { path: '/' })
		.code(204)
		.send({ message: "User successfully logout" }));
	} catch (err) {
		console.error(err.message);
		const e = new Error("Error with suppression in Database");
		e.statusCode = 500;
		throw e;
	}
}




export const auth2faSetup = async function (req, reply) {
	const getDbRows = (sql, params) => {
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
		const check_in_db = await getDbRows(`SELECT twofa_enabled, twofa_secret FROM users WHERE id = ?`, [req.user.id]);
		//console.log(`\n2faSetup check_in_db.twofa_enabled: ${check_in_db.twofa_enabled}\n2faSetup check_in_db.twofa_secret: ${check_in_db.twofa_secret}\n`)
		if (check_in_db.twofa_enabled === 1)
		{
			console.error("2fa already activated");
			throw new Error();
		}
		if (check_in_db.twofa_secret)
		{
			return (reply.code(201).send({ secret: check_in_db.twofa_secret }));
		}

		const secret = authenticator.generateSecret();
		console.log(`\n2faSetup req.user: ${JSON.stringify(req.user)}\n`);
		await updateDb(`UPDATE users SET twofa_secret = ? WHERE id = ?`, [secret, req.user.id]);

		return (reply.code(201).send( { secret: secret }));
	} catch (err) {
		console.error(err.message);
		const e = new Error("Error with 2fa setup");
		e.statusCode = 500;
		throw e;
	}
}



export const auth2faVerify = async function (req, reply) {
	const getSecret = (sql, params) => {
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
		const secret = await getSecret(`SELECT twofa_enabled, twofa_secret FROM users WHERE id = ?`, [req.user.id]);
		console.log(`\n2faVerify: secret.twofa_enabled: ${secret.twofa_enabled}\nsecret.twofa_secret: ${secret.twofa_secret}`);
		if (secret.twofa_enabled === 1)
			throw new Error("2fa already enabled");
		else if (!secret.twofa_secret)
			throw new Error("2fa secret missing");
		const code = req.body.code;

		const isVerified = authenticator.verify({ token: code, secret: secret.twofa_secret });
		console.log(`\n2faVerify: isverified: ${isVerified}\n`);
		if (isVerified === false)
			throw new Error("token not verified");
		await updateDb(`UPDATE users SET twofa_enabled = ? WHERE id = ?`, [1, req.user.id]);

		return (reply.code(201).send({ message: "2fa activated"}));
	} catch (err) {
		console.error(`\nERROR in 2faVerify: ${err.message}\n`);
		const e = new Error("Error with 2fa verify");
		e.statusCode = 500;
		throw e
	}
}
