async function userRoutes(app, options) {
	app.get('/users', async (req, reply) => {

	});

	app.get('/users/:id', async (req, reply) => {

	});

	app.get('/users/me', async (req, reply) => {
		reply.send({data: "me"});
	});

	app.delete('/users/me', async (req, reply) => {

	});
}

export { userRoutes };
