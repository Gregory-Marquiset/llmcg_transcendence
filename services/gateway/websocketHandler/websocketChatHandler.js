//import { connectionsIndex } from "./connexionRegistry.js";
import { getPresenceForUsers } from "../presence/presenceService.js";
import { sessionsByUser } from "../presence/presenceStore.js";

const maxChatPayloadSize = 16 * 1024;

export const checkEventType = (event, socket) => {

    if (typeof event === "string")
        return (event);
    else if (Buffer.isBuffer(event))
        return (event.toString("utf8"));
    else if (event instanceof Uint8Array)
        return (Buffer.from(event).toString("utf8"));
    else
    {
        socket.badFrames++;
        if (socket.badFrames > 5)
        {
            socket.close(1008, "too_much_bad_frames");
            return (null);
        }
        socket.send(JSON.stringify({ type: "error", code: "unsupported_frame_type" }));
        return (null);
    }
}


export const checkPayloadSize = (rawText, socket) => {
    
    const bytes = new TextEncoder().encode(rawText).length;
	if (bytes > maxChatPayloadSize)
		socket.close(1009, "payload_too_large");
}


export const checkAndTrimRawText = (rawText, socket) => {
    rawText = rawText.trim();
    if (rawText.length === 0)
    {
        socket.badFrames++;
        if (socket.badFrames > 5)
        {
            socket.close(1008, "too_much_bad_frames");
            return (null);
        }
        socket.send(JSON.stringify({ type: "error", code: "empty_message" }));
        return (null);
    }
    return (rawText);
}


export const checkJSONValidity = (obj, socket, connectionsIndex, actualUserId) => {
    if (obj?.type !== "chat:send" || !obj?.requestId || !obj?.payload
        || typeof obj.payload !== "object")
    {
            socket.send(JSON.stringify({ type: "error", code: "bad_request_format" }));
            return (null);
    }
    
    if (!obj.payload.toUserId || obj.payload.toUserId === undefined)
    {
        socket.send(JSON.stringify({ type: "error", code: "bad_request_format" }));
        return (null);
    }

    if (connectionsIndex.get(socket).userId !== actualUserId)
    {
        socket.close(1008, "unauthorized");
        return (null);
    }

    const toUserId = new Number(obj.payload.toUserId)
    if (Number.isNaN(toUserId) || obj.payload.toUserId === actualUserId)
    {
        socket.send(JSON.stringify({ type: "error", code: "invalid_userId" }));
        return (null);
    }

    if (typeof obj?.payload?.content !== "string")
    {
        socket.send(JSON.stringify({ type: "error", code: "invalid_content_type" }));
        return (null);
    }

    obj.payload.content = obj.payload.content.trim();
    if (obj?.payload?.content.length === 0)
    {
        socket.send(JSON.stringify({ type: "error", code: "empty_content" }));
        return (null);
    }

    if (obj?.payload?.content.length > 4 * 1024)
    {
        socket.send(JSON.stringify({ type: "error", code: "message_too_long" }));
        return (null);
    }
    return (obj);
}


export const chatServiceCreateMessage = async function (chatObj, token) {
    const response = await fetch("http://chat-service:5000/api/v1/chat/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify(chatObj)
    });
    console.log(`\nchatserviceCreateMessage response.status: ${response.status}\n
        response.statusText: ${response.statusText}\n`);
    if (!response.ok) {
         let err = new Error(response.statusText);
         err.statusCode = response.status;
         throw err;
    }
    return (response.json());
}


export const deliverMessage = async function (chatServiceResponse, token) {
    let isUserOnline = getPresenceForUsers([chatServiceResponse.toUserId]);

    if (isUserOnline.get(chatServiceResponse.toUserId).status === "online")
    {
        console.log(`\ndeliverMessage user ${chatServiceResponse.toUserId} is online\n`);
        let event = {
            type: "chat:message",
            payload: chatServiceResponse
        }

        sessionsByUser.get(chatServiceResponse.toUserId).socketSet.forEach((socket) => {
            socket.send(JSON.stringify(event));
        });

        let response = await fetch("http://chat-service:5000/api/v1/chat/messages/delivered", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ messageId: chatServiceResponse.messageId })
        });
        console.log(`\nchatservice markAsDelivered response.status: ${response.status}\n
        response.statusText: ${response.statusText}\n`);
        if (!response.ok) {
            let err = new Error(response.statusText);
            err.statusCode = response.status;
            throw err;
    }
    }
    else
    {
        console.log(`\ndeliverMessage user ${chatServiceResponse.toUserId} is offline\n`);
    }
}


export const pushUndeliveredMessages = async function (token) {
    let response = await fetch("http://chat-service:5000/api/v1/chat/messages/undelivered", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        }
    });
    if (!response.ok) {
        let err = new Error(response.statusText);
        err.statusCode = response.status;
        throw err;
    }
    let undeliveredMessages = await response.json();
    console.log(`\npushUndeliveredMessages typeof undeliveredMessages: ${typeof undeliveredMessages}\n
        undeliveredMessages: ${JSON.stringify(undeliveredMessages)}\n`);
    if (!undeliveredMessages)
        return;
    undeliveredMessages.forEach((undeliveredMessage) => {
        console.log(`\npushUndeliveredMessage in for each, typeof : ${typeof undeliveredMessage}
            undeliveredMessage: ${JSON.stringify(undeliveredMessage)}\n`);
        deliverMessage(undeliveredMessage, token);
    });
}
