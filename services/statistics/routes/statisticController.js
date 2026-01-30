import { app, httpError } from "../statisticsServer.js";
import { getRowFromDB, getAllRowsFromDb, runSql } from '../../shared/postgresFunction.js'

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

export const postNewTodo = async function (req, reply) {
    try {
        const newTodo = await getRowFromDB(app.pg, `INSERT INTO todo_list (user_id, title, description)
                VALUES ($1, $2, $3) RETURNING *`, [req.user.id, req.body.title, req.body.description]);
        const updateHistory = await runSql(app.pg, `INSERT INTO history (user_id, title, description)
                VALUES ($1, $2, $3)`, [req.user.id, "Added new task :", req.body.title]);
        return reply.code(201).send(newTodo.id);
    }
    catch (err){
        console.error("ERROR: posting new todo :" , err)
        return reply.code(500).send({ error: 'Failed to create todo' });
    }
}

export const deleteTodo = async function (req, reply) {
    try {
        const title = await getRowFromDB(app.pg, `SELECT title FROM todo_list WHERE id = $1 AND user_id = $2`,
             [req.params.id, req.user.id]);
        const response = await getRowFromDB(app.pg, `DELETE FROM todo_list WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
        const updateHistory = await runSql(app.pg, `INSERT INTO history (user_id, title, description)
            VALUES ($1, $2, $3)`, [req.user.id, "Deleted task :", title.title]);
        return reply.code(204).send();
    }
    catch (err){
        console.error("ERROR: deleting new todo :" , err);
        return reply.code(500).send({ error: 'Failed to delete todo' });
    }
}

export const markAsDone = async function (req, reply) {
    try {
        const title = await getRowFromDB(app.pg, `SELECT title FROM todo_list WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.id]);
        if (!title)
            return reply.code(404).send({error : "todo not found in data base"});
        const id = await runSql(app.pg, `UPDATE todo_list SET done = $1 WHERE id = $2 AND user_id = $3 RETURNING *`, 
            [req.body.done, req.params.id, req.user.id]);
            if (req.body.done){
                await runSql(app.pg, `INSERT INTO history (user_id, title, description)
                VALUES ($1, $2, $3)`, [req.user.id, "Has finished :", title.title]);
                await runSql(app.pg, `UPDATE user_stats SET task_completed = task_completed + 1 WHERE user_id = $1`,
                    [req.user.id]);
            }
            else {
                await runSql(app.pg, `INSERT INTO history (user_id, title, description)
                VALUES ($1, $2, $3)`, [req.user.id, "Has unset marked as done for :", title.title]);
                await runSql(app.pg, `UPDATE user_stats SET task_completed = task_completed - 1 WHERE user_id = $1`,
                    [req.user.id]);
            }
        return reply.code(204).send();
    }
    catch (err) {
        console.error("ERROR : mark as don todo :", err);
        return reply.code(500).send({ error : "Fail to mark as done"});
    }
}

export const getHistory = async function (req, reply) {
    try {
        const history = await getAllRowsFromDb(app.pg, `SELECT * FROM history WHERE user_id = $1`, [req.user.id]);
        return reply.code(200).send(history);
    }
    catch (err){
        console.error("ERROR : ", err);
        return reply.code(500).send({ error : "Failed to fetch user's history"})
    }
}