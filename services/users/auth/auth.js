import * as authOpts from "./authSchema.js"
import {db} from "../usersServer.js"

async function authRoutes(app, options) {
	// app.get('/auth/register', async (req, reply) => {

	// });

	app.post('/auth/register', authOpts.authRegisterOpts);

	app.get('/auth/login', (req, reply) => {
		reply.send({resp: "ok"});
	});

	app.post('/auth/login', (req, reply) => {

	});

	app.post('/auth/logout', (req, reply) => {

	});


	app.get('/auth/debug_db', (req, reply) => {
		db.all('SELECT * FROM users', (err, rows) => {
			if (err)
				return (console.error(err.message));
			reply.send(rows);
		});
	});
}

export { authRoutes };
