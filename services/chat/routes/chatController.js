import { app, httpError } from '../chatServer.js';
import { getRowFromDB, getAllRowsFromDb, runSql } from '../../shared/postgresFunction.js'

export const createMessage = async function (req, reply) {
	try {
        let date = new Date().toISOString();
        console.log(`\ncreateMessage: typeof req.body: ${typeof req.body}\nreq.body: ${JSON.stringify(req.body)}\n`);
        let chatObj = req.body;

        if (typeof chatObj?.content !== "string")
            throw httpError(400, "Bad request");

        const areUsersInDB = await getAllRowsFromDb(app.pg, 'SELECT id FROM users WHERE id = $1 OR id = $2', [req.user.id, chatObj.toUserId]);
        if (!areUsersInDB || areUsersInDB.length !== 2)
            throw httpError(404, "User not found");

        const areUsersFriends = await getRowFromDB(app.pg, `SELECT status FROM friendships WHERE (sender_id = $1 AND receiver_id = $2)
            OR (sender_id = $2 AND receiver_id = $1)`, [req.user.id, chatObj.toUserId]);
        if (!areUsersFriends || areUsersFriends.status !== "accepted")
            throw httpError(403, "Users are not friends");

        let isMessageAlreadyInDB = await getRowFromDB(app.pg, `SELECT * FROM chat_history WHERE request_id = $1`, [chatObj.requestId]);
        if (!isMessageAlreadyInDB)
        {
            const rowCount = await runSql(app.pg, `INSERT INTO chat_history (from_user_id, to_user_id, content, request_id, client_sent_at, created_at, delivered_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`, [req.user.id, chatObj.toUserId, chatObj.content, chatObj.requestId, chatObj.clientSentAt, date, null]);
            if (rowCount !== 1)
                throw httpError(500, "Database inserting error");
            isMessageAlreadyInDB = await getRowFromDB(app.pg, `SELECT * FROM chat_history WHERE request_id = $1`, [chatObj.requestId]);
            if (!isMessageAlreadyInDB)
                throw httpError(500, "Database select error");
        }
        else
        {
            if (isMessageAlreadyInDB.content !== chatObj.content)
                throw httpError(409, "Conflict");
        }
        console.log(`\ncreateMessage isMessageAlreadyInDB element:\n
            id: ${isMessageAlreadyInDB.id}\n
            from_user_id: ${isMessageAlreadyInDB.from_user_id}\n
            to_user_id: ${isMessageAlreadyInDB.to_user_id}\n
            content: ${isMessageAlreadyInDB.content}\n
            requestId: ${isMessageAlreadyInDB.request_id}\n`);

        let responseObj = {
            messageId: isMessageAlreadyInDB.id,
            fromUserId: isMessageAlreadyInDB.from_user_id,
            toUserId: isMessageAlreadyInDB.to_user_id,
            content: isMessageAlreadyInDB.content,
            clientSentAt: isMessageAlreadyInDB.client_sent_at,
            createdAt: isMessageAlreadyInDB.created_at,
            requestId: isMessageAlreadyInDB.request_id,
            deliveredAt: isMessageAlreadyInDB.delivered_at 
        };
        // responseObj.messageId = isMessageAlreadyInDB.id;
        // responseObj.fromUserId = isMessageAlreadyInDB.from_user_id;
        // responseObj.toUserId = isMessageAlreadyInDB.to_user_id;
        // responseObj.content = isMessageAlreadyInDB.content;
        // responseObj.createMessage = new Date().toISOString();
        // responseObj.requestId = isMessageAlreadyInDB.request_id;
        console.log(`\ncreateMessage responseObj: ${JSON.stringify(responseObj)}\n`);
        
        return (reply.code(201).send(responseObj));
    
    } catch (err) {
        console.error(`\nERROR createMessage: ${err.message}\n`);
        if (err.statusCode)
            throw err;
        err.statusCode = 500;
        throw err;
    }
}


export const markAsDelivered = async function (req, reply) {
    try {
        const checkUser = await getRowFromDB(app.pg, `SELECT * FROM chat_history WHERE id = $1 AND to_user_id = $2`,
            [req.body.messageId, req.user.id]);
        if (!checkUser)
            throw httpError(403, "Bad messageId");

        if (checkUser.delivered_at !== null)
        {
            reply.code(200).send({ status: "marked as delivered" });
            return;
        }
        
        const date = new Date().toISOString();
        const rowCount = await runSql(app.pg, `UPDATE chat_history SET delivered_at = $1 WHERE id = $2`,
            [date, req.body.messageId]);
        if (rowCount !== 1)
            throw httpError(500, "Database update error");

        reply.code(200).send({ status: "marked as delivered" });
    } catch (err) {
        console.error(`\nERROR markAsDelivered: ${err.message}\n`);
        if (err.statusCode)
            throw err;
        err.statusCode = 500;
        throw err;
    }
}


export const getUndeliveredMessages = async function (req, reply) {
    try {
        const undeliveredMessages = await getAllRowsFromDb(app.pg, `SELECT * FROM chat_history WHERE to_user_id = $1 AND
            delivered_at IS NULL`, [req.user.id]);

        let undeliveredMessagesRewrite = [];
        if (!undeliveredMessages)
            return (undeliveredMessagesRewrite);

        undeliveredMessages.forEach(undeliveredMessage => {
            console.log(`\ngetUndeliveredMessage foreach: ${JSON.stringify(undeliveredMessage)}\n`);
            undeliveredMessagesRewrite.push({
                messageId: undeliveredMessage.id,
                fromUserId: undeliveredMessage.from_user_id,
                toUserId: undeliveredMessage.to_user_id,
                content: undeliveredMessage.content,
                clientSentAt: undeliveredMessage.client_sent_at,
                requestId: undeliveredMessage.request_id 
            });
        });


        reply.code(200).send(undeliveredMessagesRewrite);
    } catch (err) {
        console.error(`\nERROR getUndeliveredMessages: ${err.message}\n`);
        if (err.statusCode)
            throw err;
        err.statusCode = 500;
        throw err;
    }
}


export const getMessagesHistory = async function (req, reply) {
    try {
        if (req.user.id === Number(req.params.userId))
            throw httpError(400, "Can't research conversation with yourself");
        const areUsersInDB = await getAllRowsFromDb(app.pg, 'SELECT id FROM users WHERE id = $1 OR id = $2', [req.user.id, req.params.userId]);
        if (!areUsersInDB || areUsersInDB.length !== 2)
            throw httpError(404, "User not found");

        const messagesHistory = await getAllRowsFromDb(app.pg, `SELECT * FROM chat_history WHERE (from_user_id = $1 AND to_user_id = $2)
            OR (from_user_id = $2 AND to_user_id = $1) ORDER BY created_at ASC`, [req.user.id, req.params.userId]);

        let history = [];
        if (messagesHistory) {
            messagesHistory.forEach((message) => {
                history.push({
                    messageId: message.id,
                    fromUserId: message.from_user_id,
                    toUserId: message.to_user_id,
                    content: message.content,
                    createdAt: message.created_at,
                    clientSentAt: message.client_sent_at,
                    requestId: message.request_id
                });
            });
        }

        reply.code(200).send(history);
    } catch (err) {
        console.error(`\nERROR getMessagesHistory: ${err.message}\n`);
        if (err.statusCode)
            throw err;
        err.statusCode = 500;
        throw err;
    }
}
