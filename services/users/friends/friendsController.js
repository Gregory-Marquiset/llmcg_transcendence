import { app, uploadsDir, httpError } from "../usersServer.js";
import { getRowFromDB, getAllRowsFromDb, runSql } from '../../shared/postgresFunction.js'
//import { getPresenceForUsers } from "../../gateway/presence/presenceService.js";


export const sendFriendsRequest = async function (req, reply) {
	
	try {
		const targetId = Number(req.params.targetId);
		const date = new Date().toISOString();
		console.log(`\nsendFriendRequest req.params: ${targetId}, req.user.id: ${req.user.id}\n`);

		if (targetId === req.user.id)
			throw httpError(400, "Can't add yourself as friend");

		const searchForTarget = await getRowFromDB(app.pg, 'SELECT id FROM users WHERE id = $1', [targetId]);
		if (!searchForTarget)
			throw httpError(404, "User not found");

		const searchForFriendship = await getRowFromDB(app.pg, 'SELECT * FROM friendships WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $3 AND receiver_id = $4)',
			[req.user.id, targetId, targetId, req.user.id]);

		if (searchForFriendship?.status === "pending" && searchForFriendship?.sender_id === req.user.id)
			throw httpError(400, "Friend request already sent");
		else if (searchForFriendship?.status === "pending" && searchForFriendship?.sender_id === targetId)
			throw httpError(400, "This user already sent you a friend request");
		else if (searchForFriendship?.status === "accepted")
			throw httpError(400, "You are already friends");
		else if (searchForFriendship?.status === "blocked")
			throw httpError(401, "Unhautorized");
		else if (searchForFriendship?.status === "refused" || searchForFriendship?.status === "removed")
		{
			if (searchForFriendship?.sender_id === req.user.id)
				await runSql(app.pg, `UPDATE friendships SET status = $1, updated_at = $2 WHERE (sender_id = $3 AND receiver_id = $4)`,
					["pending", date, req.user.id, targetId]);
			else
				await runSql(app.pg, 'UPDATE friendships SET status = $1, sender_id = $2, receiver_id = $3, updated_at = $4 WHERE (sender_id = $3 AND receiver_id = $2)',
					["pending", req.user.id, targetId, date]);
			return (reply.code(201).send({ sender_id: req.user.id, receiver_id: targetId, status: "pending" }));
		}

		await runSql(app.pg, `INSERT INTO friendships(sender_id, receiver_id, status, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5)`, [req.user.id, targetId, "pending", date, date]);
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
		const searchForTarget = await getRowFromDB(app.pg, 'SELECT id FROM users WHERE id = $1', [senderId]);
		if (!searchForTarget)
			throw httpError(404, "User not found");
		const searchForFriendship = await getRowFromDB(app.pg, 'SELECT * FROM friendships WHERE sender_id = $1 AND receiver_id = $2',
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
			await runSql(app.pg, 'UPDATE friendships SET status = $1, updated_at = $2 WHERE sender_id = $3 AND receiver_id = $4',
				["accepted", date, senderId, req.user.id]);
			status = "accepted";
			await runSql(app.pg, 'UPDATE user_stats SET friends_count = friends_count + 1, updated_at = $1 WHERE user_id = $2',
				[date, senderId]);
			await runSql(app.pg, 'UPDATE user_stats SET friends_count = friends_count + 1, updated_at = $1 WHERE user_id = $2',
				[date, req.user.id]);
		}
		else if (req.body.action === "refuse")
		{
			await runSql(app.pg, 'UPDATE friendships SET status = $1, updated_at = $2 WHERE sender_id = $3 AND receiver_id = $4',
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
		const searchForTarget = await getRowFromDB(app.pg, 'SELECT id FROM users WHERE id = $1', [targetId]);
		if (!searchForTarget)
			throw httpError(404, "User not found");
		const searchForFriendship = await getRowFromDB(app.pg, 'SELECT * FROM friendships WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $3 AND receiver_id = $4)',
			[targetId, req.user.id, req.user.id, targetId]);
		if (!searchForFriendship || searchForFriendship.status === "refused" ||
			searchForFriendship.status === "removed")
			throw httpError(404, "Friendships not found");
		if (searchForFriendship.status === "blocked")
			throw httpError(400, "This friendships is blocked");
		
		const date = new Date().toISOString();
		await runSql(app.pg, 'UPDATE friendships SET status = $1, updated_at = $2 WHERE (sender_id = $3 AND receiver_id = $4) OR (sender_id = $5 AND receiver_id = $6)',
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
		const searchForTarget = await getRowFromDB(app.pg, 'SELECT id FROM users WHERE id = $1', [targetId]);
		if (!searchForTarget)
			throw httpError(404, "User not found");
		const searchForFriendship = await getRowFromDB(app.pg, 'SELECT * FROM friendships WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $3 AND receiver_id = $4)',
			[targetId, req.user.id, req.user.id, targetId]);
		if (searchForFriendship?.status === "blocked")
			throw httpError(400, "User already blocked");

		const date = new Date().toISOString();
		if (!searchForFriendship)
		{
			await runSql(app.pg, `INSERT INTO friendships(sender_id, receiver_id, status, blocked_by, created_at, updated_at)
				VALUES ($1, $2, $3, $4, $5, $6)`, [req.user.id, targetId, "blocked", req.user.id, date, date]);
			return (reply.code(200).send({ status: "blocked" }));
		}
		await runSql(app.pg, 'UPDATE friendships SET status = $1, blocked_by = $2, updated_at = $3 WHERE (sender_id = $4 AND receiver_id = $5) OR (sender_id = $6 AND receiver_id = $7)',
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
		const searchForTarget = await getRowFromDB(app.pg, 'SELECT id FROM users WHERE id = $1', [targetId]);
		if (!searchForTarget)
			throw httpError(404, "User not found");
		const searchForFriendship = await getRowFromDB(app.pg, 'SELECT * FROM friendships WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $3 AND receiver_id = $4)',
			[targetId, req.user.id, req.user.id, targetId]);
		if (!searchForFriendship)
			throw httpError(400, "Bad request");
		if (searchForFriendship.status !== "blocked")
			throw httpError(400, "User isn't blocked");
		if (searchForFriendship.blocked_by === targetId)
			throw httpError(400, "Can't unblock someone that blocked you");
		
		const date = new Date().toISOString();
		await runSql(app.pg, 'UPDATE friendships SET status = $1, blocked_by = $2, updated_at = $3 WHERE (sender_id = $4 AND receiver_id = $5) OR (sender_id = $6 AND receiver_id = $7)',
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



export const friendsList = async function (req, reply) {

	try {
		const friendships = await getAllRowsFromDb(app.pg, 'SELECT * FROM friendships WHERE status = $1 AND (sender_id = $2 OR receiver_id = $2)',
			["accepted", req.user.id]);
		let friendsIds = [];
		friendships.forEach(friend => {
			//console.log(`\nfriendsList friendships: ${JSON.stringify(friend)}\n`);
			if (friend.sender_id !== req.user.id)
				friendsIds.push(friend.sender_id);
			else
				friendsIds.push(friend.receiver_id);
		});

		//let friendsStatusMap = getPresenceForUsers(friendsIds);
		let friends = await Promise.all(
			friendsIds.map(friendId => {
				return getRowFromDB(app.pg, 'SELECT id, username, avatar_path FROM users WHERE id = $1', [friendId]);
			})
		);
		friends.forEach(friend => {
			// let friendStatus = friendsStatusMap.get(friend.id);
			// friend.status = friendStatus.status;
			// friend.lastSeenAt = friendStatus.lastSeenAt;
			// friend.activeSince = friendStatus.activeSince;
			//friend.avatar_path = uploadsDir.replace + friend.avatar_path;
			console.log(`\nfriendList friend infos: ${JSON.stringify(friend)}\n`);
		});
		return (reply.code(200).send(friends));
	} catch (err) {
		console.log(`\nERROR friendsList: ${err.message}\n`);
		if (err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}


export const friendsRequestList = async function (req, reply) {
	try {
		const friendships = await getAllRowsFromDb(app.pg, 'SELECT * FROM friendships WHERE status = $1 AND (receiver_id = $2)',
			["pending", req.user.id]);
		let friendsIds = [];
		friendships.forEach(friend => {
			//console.log(`\nfriendsList friendships: ${JSON.stringify(friend)}\n`);
			if (friend.sender_id !== req.user.id)
				friendsIds.push(friend.sender_id);
			else
				friendsIds.push(friend.receiver_id);
		});

		//let friendsStatusMap = getPresenceForUsers(friendsIds);
		let friends = await Promise.all(
			friendsIds.map(friendId => {
				return getRowFromDB(app.pg, 'SELECT id, username, avatar_path FROM users WHERE id = $1', [friendId]);
			})
		);
		friends.forEach(friend => {
			// let friendStatus = friendsStatusMap.get(friend.id);
			// friend.status = friendStatus.status;
			// friend.lastSeenAt = friendStatus.lastSeenAt;
			// friend.activeSince = friendStatus.activeSince;
			//friend.avatar_path = uploadsDir.replace + friend.avatar_path;
			console.log(`\nrequestList user infos: ${JSON.stringify(friend)}\n`);
		});
		return (reply.code(200).send(friends));
	} catch (err) {
		console.log(`\nERROR requestList: ${err.message}\n`);
		if (err.statusCode)
			throw err;
		err.statusCode = 500;
		throw err;
	}
}