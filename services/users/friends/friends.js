import * as friendsOpts from './friendsSchema.js'

async function friendsRoutes(app, options) {
	app.post('/friends/:targetId/request', { onRequest: [app.authenticate], ...friendsOpts.sendFriendRequestOpts });

	app.patch('/friends/:senderId', { onRequest: [app.authenticate], ...friendsOpts.manageFriendRequestOpts });

	app.delete('/friends/:targetId/delete', { onRequest: [app.authenticate], ...friendsOpts.deleteFriendOpts });

	app.post('/friends/:targetId/block', { onRequest: [app.authenticate], ...friendsOpts.blockUserOpts });

	app.post('/friends/:targetId/unblock', { onRequest: [app.authenticate], ...friendsOpts.unblockUserOpts });

	app.get('/friends/list', { onRequest: [app.authenticate], ...friendsOpts.friendsListOpts });

	app.get('/friends/requestList', { onRequest: [app.authenticate], ...friendsOpts.friendsRequestListOpts });
}

export { friendsRoutes };
