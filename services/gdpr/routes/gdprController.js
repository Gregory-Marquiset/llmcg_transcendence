import { app, httpError } from "../gdprServer.js";
import { getRowFromDB, getAllRowsFromDb, runSql } from '../../shared/postgresFunction.js'

export const getMe = async function (req, reply){
    try {
        const todoResponse = await getAllRowsFromDb(app.pg, `SELECT * FROM todo_list WHERE user_id = $1`, [req.user.id]);
        if (!todoResponse)
            console.log("Error while fetching todos GDPR");
        const userInfos = await getRowFromDB(app.pg, 'SELECT id, username, email, avatar_path, twofa_enabled, createdAt FROM users WHERE id = $1', [req.user.id]);
        if (!userInfos)
            console.log("Error while fetching userinfo GDPR");
        const userStats = await getRowFromDB(app.pg, `SELECT * FROM user_stats WHERE user_id = $1`, [req.user.id]);
        if (!userStats)
            console.log("Error while fetching userStats GDPR");
        const friendshipsResponse = await getAllRowsFromDb(app.pg,`SELECT u.id, u.username, f.status, f.created_at, f.updated_at
        FROM friendships f JOIN users u
            ON (
                (f.sender_id = $1 AND u.id = f.receiver_id)
            OR (f.receiver_id = $1 AND u.id = f.sender_id)
            )
        WHERE f.sender_id = $1 OR f.receiver_id = $1`,[req.user.id]);
        if (!friendshipsResponse)
            console.log("Error while fetching friendships GDPR");
        const historyResponse = await getAllRowsFromDb(app.pg, `SELECT * from history WHERE user_id = $1`, [req.user.id]);
        if (!historyResponse)
            console.log("Error while fetching history GDPR");
        return reply.code(200).send({...userInfos, stats: userStats, todo_list : todoResponse, history: historyResponse, friendships : friendshipsResponse});
    }
    catch (err){
        console.error("FETCHING GDPR : ", err);
        return reply.code(500).send({message : "server error"});
    }
}

export const deleteMe = async function (req, reply) {
    try {
        await runSql(app.pg, `DELETE FROM users WHERE id = $1`, [req.user.id]);
        return reply.code(204).send();
    }
    catch(err) {
        console.error(err);
        return reply.code(500).send();
    }
}

export const deleteData = async function (req, reply) {
    try {
        await runSql(app.pg, `DELETE FROM todo_list WHERE user_id = $1`, [req.user.id]);
        await runSql(app.pg, `DELETE FROM history WHERE user_id = $1`, [req.user.id]);
        await runSql(app.pg, `DELETE FROM user_stats WHERE user_id = $1`, [req.user.id]);
        await runSql(app.pg, `DELETE FROM daily_logtime WHERE user_id = $1`, [req.user.id]);
        await runSql(app.pg, `DELETE FROM friendships WHERE sender_id = $1 OR receiver_id = $1`, [req.user.id]);
        await runSql(app.pg, `UPDATE users SET avatar_path = 'avatar/default.jpg' WHERE id = $1`, [req.user.id]);
        return reply.code(204).send();
    }
    catch (err) {
        console.log(err);
        return reply.code(500).send();
    }
}