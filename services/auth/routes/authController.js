import { app, httpError } from '../authServer.js';
import { authenticator } from 'otplib';
import { getRowFromDB, runSql, getAllRowsFromDb } from '../../shared/postgresFunction.js'

export const authRegister = async function (req, reply) {
	console.log(`\n${JSON.stringify(req.body)}\n`);

	try {
		const hashedPWD = await app.bcrypt.hash(req.body.password);

		const rowCount = await runSql(app.pg, `INSERT INTO users(username, email, password, avatar_path) 
			VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`, [req.body.username, req.body.email, hashedPWD, "avatar/default.jpg"]);
		if (rowCount !== 1)
			throw httpError(409, "Username or email already taken");
    app.bizMetrics.usersCreatedTotal.labels(app.bizMetrics.serviceName).inc();	// Metrics
		return (reply.code(201).send({ message: "New entry in database" }));
	} catch (err) {
		console.error(`\nERROR authRegister: ${err.message}\n`);
		if (err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}

export const authRegister42 = async function (req, reply) {
	console.log(`\n${JSON.stringify(req.body)}\n`);

	try {
		const hashedPWD = await app.bcrypt.hash(req.body.password);

		await runSql(app.pg, `INSERT INTO users(username, email, password, avatar_path) 
			VALUES ($1, $2, $3, $4)`, [req.body.username, req.body.email, hashedPWD, "default.jpg"]);

		app.bizMetrics.usersCreatedTotal.labels(app.bizMetrics.serviceName).inc();	// Metrics
		return (reply.code(201).send("New entry in database"));
	} catch (err) {
		console.error(`\nERROR authRegister: ${err.message}\n`);
		if (err.code === '23505')
		{
			err.statusCode = 409;
			err.message = "Conflict";
		}
		else
			err.statusCode = 500;
		throw err;
	}
}


export const authLogin = async function (req, reply) {
	console.log(`\nauthLogin req.body: ${JSON.stringify(req.body)}\n`);

	try {
		const userHashedPassword = await getRowFromDB(app.pg, 'SELECT password FROM users WHERE email = $1', [req.body.email]);
		if (!userHashedPassword)
		{
			app.bizMetrics.loginFailureTotal.labels(app.bizMetrics.serviceName).inc();	// Metrics
			throw httpError(401, "Invalid email or password");
		}
		const match = await app.bcrypt.compare(req.body.password, userHashedPassword.password);
		if (match !== true)
		{
			app.bizMetrics.loginFailureTotal.labels(app.bizMetrics.serviceName).inc();	// Metrics
			throw httpError(401, "Invalid email or password");
		}
		const twofa_enabled = await getRowFromDB(app.pg, 'SELECT twofa_enabled FROM users WHERE email = $1', [req.body.email]);
		if (twofa_enabled.twofa_enabled === true)
		{
			const tempInfo = await getRowFromDB(app.pg, 'SELECT id FROM users WHERE email = $1', [req.body.email]);
			tempInfo.twofa_pending = true;
			console.log(`\nauthLogin temInfo: ${JSON.stringify(tempInfo)}\n`);
			const temp_token = app.jwt.sign(tempInfo, { expiresIn: '2m' });
			return (reply.code(200).send({ access_token: temp_token }));
		}
		const userInfo = await getRowFromDB(app.pg, 'SELECT id, username FROM users WHERE email = $1', [req.body.email]);
		console.log(`\nauthLogin userInfo: ${JSON.stringify(userInfo)}\n`);
		// stats - logtime
		await runSql(app.pg, `INSERT INTO daily_logtime (user_id, day, logtime_second) VALUES ($1, CURRENT_DATE, 0)
			ON CONFLICT (user_id, day) DO NOTHING`, [userInfo.id]);
		const nowMonth = new Date().toISOString().slice(0, 7);
		const statMonth = await getRowFromDB(app.pg, `SELECT monthly_logtime_month FROM user_stats WHERE user_id = $1`, [userInfo.id]);
		if (!statMonth) {
			await runSql(app.pg,`INSERT INTO user_stats (user_id, monthly_logtime, monthly_logtime_month)
				VALUES ($1, 0, $2)`,
				[userInfo.id, nowMonth]
			);
		}
		else if(statMonth.monthly_logtime_month !== nowMonth){
			await runSql(app.pg, `UPDATE user_stats SET  monthly_logtime = 0, monthly_logtime_month = $1 WHERE user_id = $2`,
  			[nowMonth, userInfo.id]);
		}
		//
		const access_tok = app.jwt.sign(userInfo, { expiresIn: '5m' });
		const refresh_tok = app.jwt.sign(userInfo, { expiresIn: '1d' });
		console.log(`\nauthLogin access_token: ${access_tok}\nauthLogin refresh_token: ${refresh_tok}\n`);
		await runSql(app.pg, `INSERT INTO refreshed_tokens(user_id, token) VALUES ($1, $2)`, [userInfo.id, refresh_tok]);
		app.bizMetrics.loginSuccessTotal.labels(app.bizMetrics.serviceName).inc();	// Metrics
		return (reply
			.setCookie('refreshToken', refresh_tok, {
				httpOnly: true,
				path: '/',
				maxAge: 24 * 60 * 60
			})
			.code(200)
			.send( { access_token: access_tok }));
	} catch (err) {
		console.error(`\nERROR authLogin: ${err.message}\n`);
		if(err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}

export const authLogin2fa = async function (req, reply) {
	try {
		const payload = app.jwt.verify(req.body.temp_token);
		console.log(`\nauthLogin2fa payload : ${JSON.stringify(payload)}\n`);
		if (payload.twofa_pending !== true)
			throw httpError(401, "Expired, please login again");
		const userInfo = await getRowFromDB(app.pg, 'SELECT id, username, twofa_enabled, twofa_secret FROM users WHERE id = $1', [payload.id]);
		console.log(`\nauthLogin2fa userInfo: ${JSON.stringify(userInfo)}\n`);
		if (!userInfo)
			throw httpError(401, "Invalid 2FA session");
		else if (userInfo.twofa_enabled !== true)
			throw httpError(400, "2FA not enabled for this user");
		else if (!userInfo.twofa_secret)
			throw httpError(500, "2FA configuration error");

		const isVerified = authenticator.verify({ token: req.body.code, secret: userInfo.twofa_secret });
		console.log(`\nauthLogin2fa: isverified: ${isVerified}\n`);
		if (isVerified === false)
			throw httpError(401, "Invalid 2FA code");

		const access_tok = app.jwt.sign({ id: userInfo.id, username: userInfo.username }, { expiresIn: "5m" });
		const refresh_tok = app.jwt.sign({ id: userInfo.id, username: userInfo.username }, { expiresIn: "1d" });
		console.log(`\nauthLogin2fa access_token: ${access_tok}\nauthLogin refresh_token: ${refresh_tok}\n`);
		await runSql(app.pg, `INSERT INTO refreshed_tokens(user_id, token) VALUES ($1, $2)`, [userInfo.id, refresh_tok]);
		return (reply
			.setCookie('refreshToken', refresh_tok, {
				httpOnly: true,
				path: '/',
				maxAge: 24 * 60 * 60
			})
			.code(200)
			.send({ access_token: access_tok }));
	} catch (err) {
		console.error(`\nERROR authLogin2fa: ${err.message}\n`);
		if (err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}


//le front met un header dans la req: Authorization: Bearer <token>
export const authMe = async function (req, reply) {
	console.log(`\nautMe req.user: ${JSON.stringify(req.user)}\n`);
	
	try {
		const userInfos = await getRowFromDB(app.pg, 'SELECT id, username, email, avatar_path, twofa_enabled, createdAt FROM users WHERE id = $1', [req.user.id]);
		console.log(`\nauthMe userInfos: ${JSON.stringify(userInfos)}\n`);
		let userStats = await getRowFromDB(app.pg, 'SELECT rank_position, task_completed, friends_count, streaks_history, current_streak_count, monthly_logtime, monthly_logtime_month, app_seniority, upload_count, created_at, updated_at, last_login FROM user_stats WHERE user_id = $1',
			[req.user.id]);
		if (!userStats){
			await runSql(app.pg, 'INSERT INTO user_stats (user_id) VALUES ($1)', [req.user.id]);
			userStats = await getRowFromDB(app.pg, 'SELECT rank_position, task_completed, friends_count, streaks_history, current_streak_count, monthly_logtime, monthly_logtime_month, app_seniority, upload_count, created_at, updated_at, last_login FROM user_stats WHERE user_id = $1',
			[req.user.id]);
		}
		let userTodo = await getRowFromDB(app.pg, 'SELECT id FROM todo_list WHERE user_id = $1', [req.user.id]);
		const created_at = new Date(userStats.created_at);
		/// Update of streaks, seniority
		const now = new Date();
		const last_login = new Date(userStats.last_login);
		const lastLoginDate = new Date(last_login.getFullYear(), last_login.getMonth(), last_login.getDate());
		const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const daysDifference = Math.floor((todayDate - lastLoginDate) / (1000 * 60 * 60 * 24));
		const newSeniority = Math.floor((now - created_at) / (1000 * 60 * 60 * 24)) + 1;
		if (daysDifference >= 1) {
			let newStreak = 0;
			if (daysDifference === 1) { // if log happens the very next day
				newStreak = 1;
			}
			else { // if it happens more than one day after
				await runSql(app.pg, `UPDATE user_stats SET 
									app_seniority = $1,
									last_login = $2,
									updated_at = NOW(),
									current_streak_count = 0
									WHERE user_id = $3`,
								[newSeniority, now, req.user.id]);
				return (reply.code(200).send({...userInfos, stats : userStats}));
			}
			await runSql(app.pg, `UPDATE user_stats SET 
								app_seniority = $1,
								last_login = $2,
								updated_at = NOW(),
								current_streak_count = current_streak_count + $3
								WHERE user_id = $4`,
							[newSeniority, now, newStreak, req.user.id]);
		}
		return (reply.code(200).send({...userInfos, stats : userStats}));
	} catch (err) {
		console.error(`\nERROR authMe: ${err.message}\n`);
		err.message = "Error with Database";
		err.statusCode = 500;
		throw err;
	}
}

export const authRefresh = async function (req, reply) {

	try {
		if (!req.cookies.refreshToken)
			throw httpError(401, "Missing refresh token");
		const decoded  = app.jwt.verify(req.cookies.refreshToken);
		console.log(`\nauthRefresh: decode.id: ${decoded.id}, decode.username: ${decoded.username}\n`);
		const old_token_in_db = await getRowFromDB(app.pg, `SELECT token FROM refreshed_tokens WHERE token = $1`, [req.cookies.refreshToken]);
		if (!old_token_in_db)
			throw httpError(401, "Missing refresh token");
		console.log(`\nauthRefresh old token in db: ${old_token_in_db.token}\n`);
		
		const new_access_token = app.jwt.sign({ id: decoded.id, username: decoded.username } , { expiresIn: '5m' });
		const new_refresh_token = app.jwt.sign({ id: decoded.id, username: decoded.username }, { expiresIn: '1d' });
		console.log(`authRefresh new refresh token not in db: ${new_refresh_token}\n`);
		await runSql(app.pg, `INSERT INTO daily_logtime (user_id, day, logtime_second)
						VALUES ($1, CURRENT_DATE, 240)
						ON CONFLICT (user_id, day)
						DO UPDATE SET logtime_second =
						daily_logtime.logtime_second + EXCLUDED.logtime_second`, [decoded.id]);

		await runSql(app.pg, `SELECT logtime_second FROM daily_logtime WHERE user_id = $1 AND day = CURRENT_DATE`, 
			[decoded.id]);
		await runSql(app.pg, `UPDATE user_stats SET monthly_logtime = monthly_logtime + 4
			WHERE user_id = $1`, [decoded.id])
		await runSql(app.pg, `UPDATE refreshed_tokens SET token = $1 WHERE token = $2 AND user_id = $3`, [new_refresh_token, req.cookies.refreshToken, decoded.id]);
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
		console.error(`\nERROR authRefresh: ${err.message}\n`);
		if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError' || err.statusCode === 401)
		{
			err.message = "Invalid refresh token";
			err.statusCode = 401;
		}
		else
			err.statusCode = 500;
		throw err;
	}
}



export const authLogout = async function (req, reply) {

	try {
		if (!req.cookies.refreshToken)
			throw httpError(401, "Missing refresh token")
		//console.log(`\nauthLogout req.cookies.refreshToken: ${req.cookies.refreshToken}\n`);
		app.jwt.verify(req.cookies.refreshToken);
		//await getRowFromDB('SELECT user_id FROM refreshed_tokens WHERE token = $1', [req.cookies.refreshToken]);
		await runSql(app.pg, `DELETE FROM refreshed_tokens WHERE token = $1`, [req.cookies.refreshToken]);
		return (reply.clearCookie('refreshToken', { path: '/' })
		.code(204)
		.send({ message: "User successfully logout" }));
	} catch (err) {
		console.error(`\nERROR authLogout: ${err.message}\n`);
		if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError' || err.statusCode === 401)
		{
			err.message = "Invalid refresh token";
			err.statusCode = 401;
		}
		else
			err.statusCode = 500;
		throw err;
	}
}



//le front met un header dans la req: Authorization: Bearer <token>
export const auth2faSetup = async function (req, reply) {

	try {
		const check_in_db = await getRowFromDB(app.pg, `SELECT twofa_enabled, twofa_secret FROM users WHERE id = $1`, [req.user.id]);
		//console.log(`\nauth2faSetup check_in_db.twofa_enabled: ${check_in_db.twofa_enabled}\n2faSetup check_in_db.twofa_secret: ${check_in_db.twofa_secret}\n`)
		if (check_in_db.twofa_enabled === true)
			throw httpError(500, "2fa already activated");
		if (check_in_db.twofa_secret)
			return (reply.code(201).send({ secret: check_in_db.twofa_secret }));

		const secret = authenticator.generateSecret();
		console.log(`\nauth2faSetup req.user: ${JSON.stringify(req.user)}\n`);
		await runSql(app.pg, `UPDATE users SET twofa_secret = $1 WHERE id = $2`, [secret, req.user.id]);

		return (reply.code(201).send( { secret: secret }));
	} catch (err) {
		console.error(`\nERROR auth2faSetup: ${err.message}\n`);
		err.statusCode = 500;
		throw err;
	}
}


//le front met un header dans la req: Authorization: Bearer <token>
export const auth2faVerify = async function (req, reply) {

	try {
		const secret = await getRowFromDB(app.pg, `SELECT twofa_enabled, twofa_secret FROM users WHERE id = $1`, [req.user.id]);
		console.log(`\nauth2faVerify: secret.twofa_enabled: ${secret.twofa_enabled}\nsecret.twofa_secret: ${secret.twofa_secret}`);
		if (secret.twofa_enabled === true)
			throw httpError(500, "2fa already enabled");
		else if (!secret.twofa_secret)
			throw httpError(500, "2fa secret missing");
		const code = req.body.code;

		const isVerified = authenticator.verify({ token: code, secret: secret.twofa_secret });
		console.log(`\nauth2faVerify: isverified: ${isVerified}\n`);
		if (isVerified === false)
			throw httpError(401, "token not verified");
		await runSql(app.pg, `UPDATE users SET twofa_enabled = $1 WHERE id = $2`, [true, req.user.id]);

		return (reply.code(201).send({ message: "2fa activated"}));
	} catch (err) {
		console.error(`\nERROR in 2faVerify: ${err.message}\n`);
		if (err.statusCode === 401)
			err.message = "Unauthorized";
		else
			err.statusCode = 500;
		throw err;
	}
}
