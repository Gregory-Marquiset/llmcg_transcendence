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

    let userId = connectionsIndex.get(socket).userId;
	if (!userId)
	{
		socket.send(JSON.stringify({ type: "error", code: "internal_server_error" }));
		return (null);
	}
    if (userId !== actualUserId)
    {
        socket.close(1008, "unauthorized");
        return (null);
    }

    const toUserId = Number(obj.payload.toUserId)
    if (!Number.isFinite(toUserId) || !Number.isInteger(toUserId) || toUserId <= 0 || toUserId === actualUserId)
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

    let status = isUserOnline?.get(chatServiceResponse.toUserId)?.status;
    if (!status)
        status = "offline";
    if (status === "online")
    {
        console.log(`\ndeliverMessage user ${chatServiceResponse.toUserId} is online\n`);
        let event = {
            type: "chat:message",
            payload: chatServiceResponse
        }

        let sockSet = sessionsByUser?.get(chatServiceResponse.toUserId)?.socketSet;
        if (!sockSet || sockSet.size === 0)
        {
            console.log(`\ndeliverMessage user ${chatServiceResponse.toUserId} is offline\n`);
            return;
        }
        sockSet.forEach((socket) => {
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
    if (!undeliveredMessages)
        return;
    console.log(`\npushUndeliveredMessages typeof undeliveredMessages: ${typeof undeliveredMessages}\n
        undeliveredMessages: ${JSON.stringify(undeliveredMessages)}\n`);

        for (let i = 0; i < undeliveredMessages.length; i++)
        {
            console.log(`\npushUndeliveredMessage in for each, typeof : ${typeof undeliveredMessages[i]}
            undeliveredMessage: ${JSON.stringify(undeliveredMessages[i])}\n`);

            try {
                await deliverMessage(undeliveredMessages[i], token);
            } catch (err) {
                if (err?.statusCode === 401)
                {
                    console.error(`ERROR pushUndeliveredMessage auth error, stopping push\n`);
                    break;
                }
                console.error(`ERROR pushUndeliveredMessage error with message id: ${undeliveredMessages[i].messageId}\n`);
                continue;
            }
        }
    // undeliveredMessages.forEach(async (undeliveredMessage) => {
    //     console.log(`\npushUndeliveredMessage in for each, typeof : ${typeof undeliveredMessage}
    //         undeliveredMessage: ${JSON.stringify(undeliveredMessage)}\n`);
    //     await deliverMessage(undeliveredMessage, token);
    // });
}


export const handleChatSendEvent = async function (socket, obj, connectionsIndex) {
    console.log(`\nhandleChatSendEvent\n`);
    obj = checkJSONValidity(obj, socket, connectionsIndex, socket.userId);
    if (!obj)
        return;

    let chatObj = {
        fromUserId: socket.userId,
        toUserId: Number(obj.payload.toUserId),
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
