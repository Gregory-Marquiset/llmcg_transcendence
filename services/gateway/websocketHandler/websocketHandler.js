import * as presence from "../presence/presenceService.js";
import * as wsChatHandler from "./websocketChatHandler.js";
import { connectionsIndex } from "./connexionRegistry.js";


let connectId = 0;
//const maxChatPayloadSize = 16;

export const websocketHandler = async function (socket, req) {
	try {
		// console.log(`websocketHandler socket type: ${socket?.constructor?.name}\n`);
		// console.log(`websocketHandler req type: ${req?.constructor?.name}\n`);
		// console.log(`websocketHandler socket typeof socket.close: ${typeof socket.close}\n`);
		// console.log(`websocketHandler socket typeof socket.socket?.close: ${typeof socket.socket?.close}\n`);
		await req.jwtVerify();
		socket.isAlive = true;
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

		let becameOnline = presence.onSocketConnected(req.user.id, socket, date);
		if (becameOnline === true)
			await wsChatHandler.pushUndeliveredMessages(req.headers.authorization);

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

				rawText = wsChatHandler.checkEventType(event, socket);
				if (!rawText)
					return;
				wsChatHandler.checkPayloadSize(rawText, socket);
				rawText = wsChatHandler.checkAndTrimRawText(rawText, socket);
				if (!rawText)
					return;

				let obj = JSON.parse(rawText);
				obj = wsChatHandler.checkJSONValidity(obj, socket, connectionsIndex, req.user.id);
				if (!obj)
					return;

				let chatObj = {
					fromUserId: req.user.id,
					toUserId: obj.payload.toUserId,
					content: obj.payload.content,
					requestId: obj.requestId,
					clientSentAt: new Date().toISOString()
				};

				let chatServiceResponse = await wsChatHandler.chatServiceCreateMessage(chatObj, req.headers.authorization);
				console.log(`\nwebsocketHandler chat service response: ${JSON.stringify(chatServiceResponse)}\n`);
				
				let acknowledgement = {
					type: "chat:sent",
					requestId: obj.requestId,
					messageId: chatServiceResponse.messageId,
					createdAt: chatServiceResponse.createdAt
				};
				//console.log(`\nwebsocketHandler acknowledgment: ${JSON.stringify(acknowledgement)}\n`);
				socket.send(JSON.stringify(acknowledgement));
				
				await wsChatHandler.deliverMessage(chatServiceResponse, req.headers.authorization);

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
				{
					socket.badFrames++;
					if (socket.badFrames > 5)
						socket.close(1008, "too_much_bad_frames");
					socket.send(JSON.stringify({ type: "error", code: "invalid_friendships" }));
				}
				else if (err.statusCode === 404)
				{
					socket.badFrames++;
					if (socket.badFrames > 5)
						socket.close(1008, "too_much_bad_frames");
					socket.send(JSON.stringify({ type: "error", code: "users_not_found" }));
				}
				else if (err.statusCode === 409)
				{
					socket.badFrames++;
					if (socket.badFrames > 5)
						socket.close(1008, "too_much_bad_frames");
					socket.send(JSON.stringify({ type: "error", code: "request_id_already_used" }));
				}
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
		else
			socket.close(1008, "unauthorized");
	}
}

export const heartbeat = function () {
	console.log(`\nwebsocketHandler heartbeat\n`);
	connectionsIndex?.forEach((value, key) => {
		if (!key)
			return;
		console.log(`value.userId: ${value.userId}`);
		console.log(`value.connectionId: ${value.connectionId}`);
		console.log(`value.ip: ${value.ip}\n`);
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
