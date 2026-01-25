import { app, uploadsDir, httpError } from "../usersServer.js";
import { getRowFromDB, getAllRowsFromDb, runSql } from '../../shared/postgresFunction.js'

export const updateSeniority = async function (req, reply){
    try {
        const stats = await getRowFromDB(app.pg, `SELECT app_seniority, created_at, last_login  FROM users_stats WHERE user_id = $1`, [req.user.id]);
        if (!stats)
            throw httpError(404, 'UserStats for updating seniority not found');
        const created_at = new Date(stats.created_at);
        const now = new Date();
        const newSeniority = Math.floor((now - created_at) / (1000 * 60 * 60 * 24)) + 1;
        await runSql(app.pg, `UPDATE users_stats SET app_seniority = $1,
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