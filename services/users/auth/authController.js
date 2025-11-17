import hyperid from 'hyperid'
import {db} from '../usersServer.js' 

export const authRegister = function (req, reply) {
	console.log(`
		
		${JSON.stringify(req.body)}
		
		`);

	const now = new Date();
	const dateTime = `${now.getDate()}-${now.getMonth()}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

	//db.run('DROP TABLE IF EXISTS users');

	db.run(`INSERT INTO users(username, email, password, createdAt) 
		VALUES (?, ?, ?, ?)`, [req.body.username, req.body.email, req.body.password, dateTime], (err) => {
		if (err)
		{
			(console.error(err.message));
			reply.code(409).send(err.message);
		}
		else
			reply.code(201).send("ok");
	});
}

