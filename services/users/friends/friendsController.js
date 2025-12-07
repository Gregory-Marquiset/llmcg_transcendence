import { httpError } from "../usersServer.js";
import { getRowFromDB, runSql } from '../../utils/sqlFunction.js'


export const sendFriendsRequest = async function (req, reply) {
	
	try {
		const targetId = Number(req.params.targetId);
		console.log(`\nsendFriendRequest req.params: ${targetId}, req.user.id: ${req.user.id}\n`);

		if (targetId === req.user.id)
			throw httpError(400, "Can't add yourself as friend");
		const searchForTarget = await getRowFromDB('SELECT id FROM users WHERE id = ?', [targetId]);
		if (!searchForTarget)
			throw httpError(404, "User not found");
		const searchForFriendship = await getRowFromDB('SELECT * FROM friendships WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
			[req.user.id, targetId, targetId, req.user.id]);
		if (searchForFriendship?.status === "pending")
			throw httpError(400, "Friend request already sent");
		else if (searchForFriendship?.status === "accepted")
			throw httpError(400, "You are already friends");
		else if (searchForFriendship?.status === "blocked")
			throw httpError(401, "Unhautorized");
		else if (searchForFriendship?.status === "refused" || searchForFriendship?.status === "removed")
		{
			const date = new Date().toISOString();
			await runSql('UPDATE friendships SET status = ?, updated_at = ? WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
				["pending", date, req.user.id, targetId, targetId, req.user.id]);
			return (reply.code(201).send({ sender_id: req.user.id, receiver_id: targetId, status: "pending" }));
		}

		const date = new Date().toISOString();
		await runSql(`INSERT INTO friendships(sender_id, receiver_id, status, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?)`, [req.user.id, targetId, "pending", date, date]);
		return (reply.code(201).send({ sender_id: req.user.id, receiver_id: targetId, status: "pending" }));
	} catch (err)
	{
		console.error(`\nERROR sendFriendsRequest: ${err.message}\n`);
		if (err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}



export const manageFriendRequest = async function (req, reply) {
	
	try {
		const senderId = Number(req.params.senderId);
		console.log(`\nmanageFriendRequest req.params: ${senderId}, req.user.id: ${req.user.id}\n`);

		if (senderId === req.user.id)
			throw httpError(400, "Bad request");
		const searchForTarget = await getRowFromDB('SELECT id FROM users WHERE id = ?', [targetId]);
		if (!searchForTarget)
			throw httpError(404, "User not found");
		const searchForFriendship = await getRowFromDB('SELECT * FROM friendships WHERE sender_id = ? AND receiver_id = ?',
			[senderId, req.user.id]);
		if (!searchForFriendship)
			throw httpError(400, "This friend request doesn't exist");
		if (searchForFriendship.status === "accepted")
			throw httpError(400, "Already friends");
		if (searchForFriendship.status === "refused" || searchForFriendship.status === "removed" ||
			searchForFriendship.status === "blocked")
			throw httpError(400, "Already refused");

		const date = new Date().toISOString();
		let status;
		if (req.body.action === "accept")
		{
			await runSql('UPDATE friendships SET status = ?, updated_at = ? WHERE sender_id = ? AND receiver_id = ?',
				["accepted", date, senderId, req.user.id]);
			status = "accepted";
		}
		else if (req.body.action === "refuse")
		{
			await runSql('UPDATE friendships SET status = ?, updated_at = ? WHERE sender_id = ? AND receiver_id = ?',
				["refused", date, senderId, req.user.id]);
			status = "refused";
		}
		return (reply.code(200).send({ status: status }));
	} catch (err) {
		console.error(`\nERROR manageFriendRequest: ${err.message}\n`);
		if (err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}



export const deleteFriend = async function (req, reply) {
	
	try {
		const targetId = Number(req.params.targetId);
		console.log(`\ndeleteFriend req.params: ${targetId}, req.user.id: ${req.user.id}\n`);

		if (targetId === req.user.id)
			throw httpError(400, "Bad request");
		const searchForTarget = await getRowFromDB('SELECT id FROM users WHERE id = ?', [targetId]);
		if (!searchForTarget)
			throw httpError(404, "User not found");
		const searchForFriendship = await getRowFromDB('SELECT * FROM friendships WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
			[targetId, req.user.id, req.user.id, targetId]);
		if (!searchForFriendship || searchForFriendship.status === "refused" ||
			searchForFriendship.status === "pending" || searchForFriendship.status === "removed")
			throw httpError(404, "Friendships not found");
		if (searchForFriendship.status === "blocked")
			throw httpError(400, "This friendships is blocked");
		
		const date = new Date().toISOString();
		await runSql('UPDATE friendships SET status = ?, updated_at = ? WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
			["removed", date, targetId, req.user.id, req.user.id, targetId]);
		return (reply.code(200).send({ status: "removed" }));
	} catch (err) {
		console.log(`\nERROR deleteFriend: ${err.message}\n`);
		if (err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}



export const blockUser = async function (req, reply) {
	try {
		const targetId = Number(req.params.targetId);
		if (targetId === req.user.id)
			throw httpError(400, "Can't block yourself");
		const searchForTarget = await getRowFromDB('SELECT id FROM users WHERE id = ?', [targetId]);
		if (!searchForTarget)
			throw httpError(404, "User not found");
		const searchForFriendship = await getRowFromDB('SELECT * FROM friendships WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
			[targetId, req.user.id, req.user.id, targetId]);
		if (searchForFriendship?.status === "blocked")
			throw httpError(400, "User already blocked");

		const date = new Date().toISOString();
		if (!searchForFriendship)
		{
			await runSql(`INSERT INTO friendships(sender_id, receiver_id, status, blocked_by, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?)`, [req.user.id, targetId, "blocked", req.user.id, date, date]);
			return (reply.code(200).send({ status: "blocked" }));
		}
		await runSql('UPDATE friendships SET status = ?, blocked_by = ?, updated_at = ? WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
			["blocked", req.user.id, date, targetId, req.user.id, req.user.id, targetId]);
		return (reply.code(200).send({ status: "blocked" }));
	} catch (err) {
		console.error(`\nERROR blockUser: ${err.message}\n`);
		if (err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}



export const unblockUser = async function (req, reply) {

	try {
		const targetId = Number(req.params.targetId);
		if (targetId === req.user.id)
			throw httpError(400, "Bad request");
		const searchForTarget = await getRowFromDB('SELECT id FROM users WHERE id = ?', [targetId]);
		if (!searchForTarget)
			throw httpError(404, "User not found");
		const searchForFriendship = await getRowFromDB('SELECT * FROM friendships WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
			[targetId, req.user.id, req.user.id, targetId]);
		if (!searchForFriendship)
			throw httpError(400, "Bad request");
		if (searchForFriendship?.status !== "blocked")
			throw httpError(400, "User isn't blocked");
		if (searchForFriendship?.blocked_by === targetId)
			throw httpError(400, "Can't unblock someone that blocked you");
		
		const date = new Date().toISOString();
		await runSql('UPDATE friendships SET status = ?, blocked_by = ?, updated_at = ? WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
			["removed", null, date, targetId, req.user.id, req.user.id, targetId]);
		return (reply.code(200).send({ status: "unblocked/removed" }));
	} catch (err) {
		console.error(`\nERROR unblockUser: ${err.message}\n`);
		if (err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}
