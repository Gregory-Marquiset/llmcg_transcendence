import { connectionsIndex } from "./connexionRegistry.js";
import { getPresenceForUsers } from "../presence/presenceService.js";
import { sessionsByUser } from "../presence/presenceStore.js";


const checkJSONValidity = (obj, socket, connectionsIndex, actualUserId) => {
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


const chatServiceCreateMessage = async function (chatObj, token) {
    const response = await fetch("http://chat-service:5000/messages", {
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


const deliverMessage = async function (chatServiceResponse, token) {
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

        let response = await fetch("http://chat-service:5000/messages/delivered", {
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
    console.log(`\npushUndeliveredMessages\n`);
    let response = await fetch("http://chat-service:5000/messages/undelivered", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        }
    });
    if (!response.ok) {
        console.log(`\npushUndeliveredMessages response.status: ${response.status}\n`);
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


export const handleChatSendEvent = async function (socket, obj) {
    console.log(`\nhandleChatSendEvent\n`);
    obj = checkJSONValidity(obj, socket, connectionsIndex, socket.userId);
    if (!obj)
        return;

    let chatObj = {
        fromUserId: socket.userId,
        toUserId: obj.payload.toUserId,
        content: obj.payload.content,
        requestId: obj.requestId,
        clientSentAt: new Date().toISOString()
    };

    let chatServiceResponse = await chatServiceCreateMessage(chatObj, socket.currentToken);
    console.log(`\nwebsocketHandler chat service response: ${JSON.stringify(chatServiceResponse)}\n`);
    
    let acknowledgement = {
        type: "chat:sent",
        requestId: obj.requestId,
        messageId: chatServiceResponse.messageId,
        createdAt: chatServiceResponse.createdAt
    };
    //console.log(`\nwebsocketHandler acknowledgment: ${JSON.stringify(acknowledgement)}\n`);
    socket.send(JSON.stringify(acknowledgement));
    
    await deliverMessage(chatServiceResponse, socket.currentToken);
}
