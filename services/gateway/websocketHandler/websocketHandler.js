import * as presence from "../presence/presenceService.js";
import * as wsValidatorHandler from "./websocketEventValidator.js";
import * as wsChatHandler from "./websocketChatHandler.js";
import * as wsAuthHandler from "./websocketAuthHandler.js";
import { connectionsIndex } from "./connexionRegistry.js";


let connectId = 0;

export const websocketHandler = async function (socket, req) {
	try {
		await req.jwtVerify();
		socket.isAlive = true;
		socket.userId = req.user.id;
		socket.currentToken = req.headers.authorization;
		socket.badFrames = 0;
		let date = new Date().toISOString();
		console.log(`\nwebsocketHandler: new socket\n`);

		connectionsIndex.set(socket, {
			userId: req.user.id,
			connectionId: connectId++,
			ip: req.socket.remoteAddress,
		});

		socket.on("pong", () => {
			console.log(`\npong\n`);
			socket.isAlive = true;
		});

		let becameOnline = presence.onSocketConnected(socket.userId, socket, date);
		if (becameOnline === true)
			await wsChatHandler.pushUndeliveredMessages(socket.currentToken);

		console.log(`\napres pushUndeliveredMessages\n`);
		socket.on("message", async (event) => {
			try {
				// NEED AJOUT SECU NOMBRE MSG PAR SECONDE

				// Protocole JSON: {
				// 	type: "chat:send",
				//  requestId: id (string a generer de facon random pour ne pas avoir des messages en doublons dans la db),
				//	payload {
				//		toUserId: integer,
				//		content: string
				//		}
				//	}
				let rawText;

				rawText = wsValidatorHandler.checkEventType(event, socket);
				if (!rawText)
					return;
				if (wsValidatorHandler.checkPayloadSize(rawText, socket) === false)
					return;
				rawText = wsValidatorHandler.checkAndTrimRawText(rawText, socket);
				if (!rawText)
					return;

				let obj = JSON.parse(rawText);
				if (!obj.type || (obj.type !== "chat:send" && obj.type !== "chat:delivered" && obj.type !== "auth:refresh"))
				{
					socket.send(JSON.stringify({ type: "error", code: "bad_request_format" }));
					return;
				}
				if (obj.type === "chat:send")
					await wsChatHandler.handleChatSendEvent(socket, obj, connectionsIndex);
				else if (obj.type === "chat:delivered")
					await wsChatHandler.markAsDeliveredInDb(socket, obj, connectionsIndex);
				else if (obj.type === "auth:refresh")
					await wsAuthHandler.handleAuthRefreshEvent(socket, obj, connectionsIndex);

			} catch (err) {
				console.error(`\nERROR websocketHandler on message: error stack: ${err.stack},\nmessage: ${err.message}, name: ${err.name}\n`);
				if (err.name === "SyntaxError")
				{
					socket.badFrames++;
					if (socket.badFrames > 5)
						socket.close(1008, "too_much_bad_frames");
					socket.send(JSON.stringify({ type: "error", code: "invalid_json" }));
					return;
				}
				if (err.statusCode === 401)
				{
					socket.close(1008, "unhauthorized");
					return;
				}
				else if (err.statusCode === 403)
					socket.send(JSON.stringify({ type: "error", code: "invalid_friendships" }));
				else if (err.statusCode === 404)
					socket.send(JSON.stringify({ type: "error", code: "users_not_found" }));
				else if (err.statusCode === 409)
					socket.send(JSON.stringify({ type: "error", code: "request_id_already_used" }));
				else
					socket.send(JSON.stringify({ type: "error", code: "internal_error" }));
			}
		});

		socket.on("close", (code, reason) => {
			date = new Date().toISOString();
			presence.onSocketDisconnected(req.user.id, socket, date);
			connectionsIndex.delete(socket);
			console.log(`\nwebsocketHandler socket.on close, code: ${code} and reason: ${reason}\n`);
		});

	} catch (err) {
		console.error(`\nERROR websocketHandler: error code: ${err.code}, message: ${err.message}\n`);
		if (err.code === "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED")
			socket.close(1008, "token_expired");
		else if (typeof err?.code === "string" && (err.code.startsWith("FST_JWT_") || err.code.startsWith("FAST_JWT_")))
			socket.close(1008, "unauthorized");
		else
			socket.close();
	}
}

export const heartbeat = function () {
	console.log(`\nwebsocketHandler heartbeat\n`);
	connectionsIndex?.forEach((value, key) => {
		if (!key)
			return;
		// console.log(`value.userId: ${value.userId}`);
		// console.log(`value.connectionId: ${value.connectionId}`);
		// console.log(`value.ip: ${value.ip}\n`);
		if (key.isAlive === false)
		{
			key.terminate();
			return;
		}
		key.isAlive = false;
		try {
			key.ping();
		} catch (err) {
			key.terminate();
		}
	});
}
