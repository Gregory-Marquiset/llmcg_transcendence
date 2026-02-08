import { app, httpError } from "../gdprServer.js";
import { getRowFromDB, getAllRowsFromDb, runSql } from '../../shared/postgresFunction.js'
import crypto from 'crypto'
import nodemailer from "nodemailer"

// creating dev account for mail confirmation
const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass
  }
});

async function sendConfirmationMailAccount({ to, link, action }) {
  const info = await transporter.sendMail({
    from: '"Transcendence App" <noreply@transcendence.app>',
    to: to,
    subject: 'Confirmation de suppression de compte',
    html: `
      <h2>Confirmation requise</h2>
      <p>Cliquez sur le lien pour confirmer :</p>
      <a href="${link}">${link}</a>
    `
  });
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

async function sendConfirmationMailDisplay({ to, link, action }) {
  const info = await transporter.sendMail({
    from: '"Transcendence App" <noreply@transcendence.app>',
    to: to,
    subject: 'Consulter mes datas',
    html: `
      <h2>Confirmation requise</h2>
      <p>Cliquez sur le lien pour confirmer :</p>
      <a href="${link}">${link}</a>
    `
  });
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

async function sendConfirmationMailData({ to, link, action }) {
  const info = await transporter.sendMail({
    from: '"Transcendence App" <noreply@transcendence.app>',
    to: to,
    subject: 'Confirmation de suppression de data',
    html: `
      <h2>Cliquer sur le lien pour consulter</h2>
      <a href="${link}">${link}</a>
    `
  });
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

export const requestAccountDeletion = async function (req, reply){
    try {
        const host = req.headers.host;
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await runSql(app.pg, `INSERT INTO gdpr_history (user_id, action, status, token, expires_at)
            VALUES ($1, 'delete_account', 'requested', $2, $3)`, [req.user.id, token, expiresAt]);
        const confirmUrl = `https://localhost:8001/gdpr/confirm?token=${token}`;
        const mail = await getRowFromDB(app.pg, `SELECT email FROM users WHERE id = $1`, [req.user.id]);
        await sendConfirmationMailAccount({
            to: mail.email,
            link: confirmUrl,
            action: 'delete_account'
        });
        return reply.code(202).send({ message: 'Confirmation email sent'});
    }
    catch (err){
        console.log(err);
        return reply.code(500).send();
    }
}

export const requestDataDeletion = async function (req, reply){
    try {
        const host = req.headers.host;
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await runSql(app.pg, `INSERT INTO gdpr_history (user_id, action, status, token, expires_at)
            VALUES ($1, 'delete_data', 'requested', $2, $3)`, [req.user.id, token, expiresAt]);
        const confirmUrl = `https://localhost:8001/gdpr/confirm?token=${token}`;
        const mail = await getRowFromDB(app.pg, `SELECT email FROM users WHERE id = $1`, [req.user.id]);
        await sendConfirmationMailData({
            to: mail.email,
            link: confirmUrl,
            action: 'delete_data'
        });
        return reply.code(202).send({ message: 'Confirmation email sent'});
    }
    catch (err){
        console.log(err);
        return reply.code(500).send();
    }
}

export const requestDataDisplay = async function (req, reply) {
    try {
        const host = req.headers.host;
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await runSql(app.pg, `INSERT INTO gdpr_history (user_id, action, status, token, expires_at)
            VALUES ($1, 'request_data', 'requested', $2, $3)`, [req.user.id, token, expiresAt]);
        const confirmUrl = `https://localhost:8001/gdpr/me?token=${token}`;
        const mail = await getRowFromDB(app.pg, `SELECT email FROM users WHERE id = $1`, [req.user.id]);
        await sendConfirmationMailDisplay({
            to: mail.email,
            link: confirmUrl,
            action: 'request_data'
        });
        return reply.code(202).send({ message: 'Confirmation email sent'});
    }
    catch (err){
        console.error('Error requestDataDisplay:', err);
        return reply.code(500).send({message: 'Server error'});
    }
}

export const deleteMe = async function (req, reply) {
    try {
        await runSql(app.pg, `INSERT INTO gdpr_history (user_id, action, executed_at, status) VALUES ($1, $2, NOW(), $3)`, [req.user.id, 'Deleted account', 'executed']);
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
        await runSql(app.pg, `INSERT INTO gdpr_history (user_id, action, executed_at, status) VALUES ($1, $2, NOW(), $3)`, [req.user.id, 'Deleted all data', 'executed']);
        await runSql(app.pg, `DELETE FROM todo_list WHERE user_id = $1`, [req.user.id]);
        await runSql(app.pg, `DELETE FROM user_history WHERE user_id = $1`, [req.user.id]);
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

export const confirmDeletion = async function (req, reply){
    try {
        const token = req.query.token;
        if (!token)
                return reply.code(400).send({message : 'token missing'});
        const action = await getRowFromDB(app.pg, `SELECT action, user_id FROM gdpr_history WHERE token = $1 AND status = 'requested'
            AND (expires_at IS NULL OR expires_at > NOW())`, [token]);
        if (!action)
            return reply.code(404).send({message : 'invalid or expired token'});
        req.user = { id: action.user_id };
        if (action.action === "delete_data")
            return (deleteData(req, reply));
        if (action.action === "delete_account")
            return (deleteMe(req, reply));
        return reply.code(404).send({message : 'action impossible'});
    }
    catch (err){
        console.log('While confirm deletion', err);
        return reply.code(500).send();
    }
} 

export const getMe = async function (req, reply){
    try {
        const token = req.query.token;
        if (!token) {
            return reply.code(400).send({message: 'Token missing'});
        }
        const gdprRequest = await getRowFromDB(app.pg, 
            `SELECT user_id FROM gdpr_history WHERE token = $1 AND action = 'request_data' AND (expires_at IS NULL OR expires_at > NOW())`, 
            [token]);
        if (!gdprRequest) {
            return reply.code(404).send({message: 'Invalid or expired token'});
        }
        const userId = gdprRequest.user_id;
        await runSql(app.pg, `UPDATE gdpr_history SET status = 'executed', executed_at = NOW() WHERE token = $1`, [token]);
        
        // fetching all data
        const todoResponse = await getAllRowsFromDb(app.pg, `SELECT * FROM todo_list WHERE user_id = $1`, [userId]);
        const userInfos = await getRowFromDB(app.pg, 'SELECT id, username, email, avatar_path, twofa_enabled, createdAt FROM users WHERE id = $1', [userId]);
        const userStats = await getRowFromDB(app.pg, `SELECT * FROM user_stats WHERE user_id = $1`, [userId]);
        const friendshipsResponse = await getAllRowsFromDb(app.pg,`SELECT u.id, u.username, f.status, f.created_at, f.updated_at
            FROM friendships f JOIN users u
            ON ((f.sender_id = $1 AND u.id = f.receiver_id) OR (f.receiver_id = $1 AND u.id = f.sender_id))
            WHERE f.sender_id = $1 OR f.receiver_id = $1`,[userId]);
        const historyResponse = await getAllRowsFromDb(app.pg, `SELECT * FROM user_history WHERE user_id = $1`, [userId]);
        const dailyLogtime = await getAllRowsFromDb(app.pg, `SELECT * FROM daily_logtime WHERE user_id = $1`, [userId]);
        ///
        return reply.code(200).send({
            ...userInfos, 
            stats: userStats,   
            todo_list: todoResponse, 
            history: historyResponse, 
            friendships: friendshipsResponse,
            daily_logtime: dailyLogtime 
        });
    }
    catch (err){
        console.error("ERROR FETCHING GDPR:", err);
        return reply.code(500).send({message: "server error"});
    }
}

export const getHistory = async function (req, reply) {
    try{
        const response = await getAllRowsFromDb(app.pg, `SELECT * FROM gdpr_history WHERE user_id = $1`, [req.user.id]);
        return (reply.code(200).send(response));
    }
    catch (err){
        console.log(err);
        return reply.code(500).send();
    }
}
