import dotenv from 'dotenv';
import { app } from '../server.js';
import { connectionsIndex } from './connexionRegistry.js';

const checkJSONValidity = (obj, socket, connectionsIndex, actualUserId) => {
	if (obj?.type !== "auth:refresh" || !obj?.requestId || !obj?.payload
    	|| typeof obj.payload !== "object")
    {
            socket.send(JSON.stringify({ type: "error", code: "bad_request_format" }));
            return (null);
    }

	if (connectionsIndex.get(socket).userId !== actualUserId)
    {
        socket.close(1008, "unauthorized");
        return (null);
    }

	if (typeof obj?.payload?.token !== "string")
    {
        socket.send(JSON.stringify({ type: "error", code: "invalid_content_type" }));
        return (null);
    }

	obj.payload.token = obj.payload.token.trim();
    if (obj?.payload?.token.length === 0)
    {
        socket.send(JSON.stringify({ type: "error", code: "empty_token" }));
        return (null);
    }

    if (obj?.payload?.token.length > 4 * 1024)
    {
        socket.send(JSON.stringify({ type: "error", code: "message_too_long" }));
        return (null);
    }
    return (obj);
}

export const handleAuthRefreshEvent = async function (socket, obj) {
	try {
		console.log(`\nhandleAuthRefreshEvent\n`);
		obj = checkJSONValidity(obj, socket, connectionsIndex, socket.userId);
		if (!obj)
			return;

		dotenv.config();
		const secret = process.env.JWT_SECRET;
		if (!secret)
		{
			socket.send(JSON.stringify({ type: "error", code: "jwt_env_variable_missing" }));
			socket.close(1008, "unauthorized");
			return;
		}

		const verifiedToken = await app.jwt.verify(obj.payload.token);
		console.log(`\nhandleAuthRefreshEvent token is verified\n`);

		if (verifiedToken.id !== socket.userId)
		{
			socket.close(1008, "user_not_corresponding");
			return;
		}

		socket.currentToken = "Bearer " + obj.payload.token;
		socket.send(JSON.stringify({ type: "auth:refreshed" }));
	} catch (err) {
		console.error(`\nERROR handleAuthRefreshEvent: ${err.message}\n`);

		if (err.code.startsWith("FST_JWT_") || err.code.startsWith("FAST_JWT_"))
			socket.close(1008, "unauthorized");
	}
}
