import * as friendsController from './friendsController.js'

export const sendFriendRequestOpts = {
	schema: {
		response: {
			201: {
				type: "object",
				properties: {
					sender_id: { type: "integer" },
					receiver_id: { type: "integer" },
					status: { type: "string" }
				}
			}
		}
	},
	handler: friendsController.sendFriendsRequest
}

export const manageFriendRequestOpts = {
	schema: {
		body: {
			type: "object",
			properties: {
				action: { type: "string" }
			},
			required: ["action"]
		},
		response: {
			200: {
				type: "object",
				properties: {
					status: { type: "string" }
				},
				required: ["status"]
			}
		}
	},
	handler: friendsController.manageFriendRequest
}

export const deleteFriendOpts = {
	schema: {
		response: {
			200: {
				type: "object",
				properties: {
					status: { type: "string" }
				},
				required: ["status"]
			}
		}
	},
	handler: friendsController.deleteFriend
}

export const blockUserOpts = {
	schema: {
		response: {
			200: {
				type: "object",
				properties: {
					status: { type: "string" }
				},
				required: ["status"]
			}
		}
	},
	handler: friendsController.blockUser
}

export const unblockUserOpts = {
	schema: {
		response: {
			200: {
				type: "object",
				properties: {
					status: { type: "string" }
				},
				required: ["status"]
			}
		}
	},
	handler: friendsController.unblockUser
}

export const friendsListOpts = {
	schema: {
		response: {
			200: {
				type: "array",
				properties: {
					friends: {
						type: "object",
						properties: {
							id: { type: "integer" },
							username: { type: "string" },
							avatar_path: { type: "string" }
						}
					}
				}
			}
		}
	},
	handler: friendsController.friendsList
}
