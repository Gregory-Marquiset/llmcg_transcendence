import { app, httpError } from "../statisticsServer.js";
import { getRowFromDB, getAllRowsFromDb, runSql } from '../../shared/postgresFunction.js'

export const updateSeniority = async function (req, reply){
    try {
        let stats = await getRowFromDB(app.pg, `SELECT app_seniority, created_at, last_login  FROM user_stats WHERE user_id = $1`, [req.user.id]);
        if (!stats){
            throw httpError(404, 'UserStats for updating seniority not found');
        }
        const created_at = new Date(stats.created_at);
        const now = new Date();
        const newSeniority = Math.floor((now - created_at) / (1000 * 60 * 60 * 24)) + 1;
        await runSql(app.pg, `UPDATE user_stats SET app_seniority = $1,
                                last_login = $2,
                                updated_at = NOW()
                                WHERE user_id = $3`,
                            [newSeniority, now, req.user.id]);
        return reply.code(200).send({
            current_seniority : newSeniority
        })
    }
    catch (err){
        console.error("ERROR updating seniority : ", err);
    }
}

export const getAllTodo = async function (req, reply) {
    try {
        const list = await getAllRowsFromDb(
            app.pg, `SELECT * FROM todo_list WHERE user_id = $1`, [req.user.id]);
        console.log(`Todo list for user ${req.user.id}:`, list);
        return reply.code(200).send(list);
    }
    catch (err) {
        console.error("Error getting todo list:", err);
        return reply.code(500).send({ error: 'Failed to fetch todos' });
    }
}