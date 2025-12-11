
const userPresence = new Map();
const connectionsId = new Map();

const userId = {
	connection_count: 0,
	status: "offline",
	last_seen_at: null,
	connection: []
}

export const websocketHandler = async function (socket, req) {
	try {
		await req.jwtVerify();

		const currentUser = userPresence.get(req.user.id);
		if (currentUser)
		{
			currentUser.connection_count++;
			currentUser.connection.push(socket);
		}
		else
		{
			userPresence.set(req.user.id, {
				connection_count: 1,
				status: "online",
				last_seen_at: null,
				connection: [socket]
			});
		}
		
		socket.addEventListener("message", (event) => {
			console.log(`\nwebsocketHandler Message: ${event.data}\n`);
		});

		socket.addEventListener("close", (event) => {

		});
	} catch (err) {
		console.error(`ERROR connectionHandler: ${err.message}\n`);
		socket.close();
		err.statusCode = 401;
		err.message = "Unhautorized"
		throw err;
	}
}
