import * as chatController from './chatController.js';

export const createMessagesOpts = {
	schema: {
		body: {
			type: "object",
			properties: {
				fromUserId: { type: "integer" },
				toUserId: { type: "integer" },
				content: { type: "string" },
				requestId: { type: "string" },
				clientSentAt: { type: "string" }
			},
			required: ["fromUserId", "toUserId", "content", "requestId", "clientSentAt"]
		},
		response: {
			201: {
				type: "object",
				properties: {
					messageId: { type: "integer" },
					fromUserId: { type: "integer" },
					toUserId: { type: "integer" },
					content: { type: "string" },
					createdAt: { type: "string" },
					requestId: { type: "string" }
				}
			}
		}
	},
	handler: chatController.createMessage
}


export const markAsDeliveredOpts = {
	schema: {
		body: {
			type: "object",
			properties: {
				messageId: { type: "integer" },
			},
			required: ["messageId"]
		},
		response: {
			200: {
				type: "object",
				properties: {
					status: { type: "string" }
				}
			}
		}
	},
	handler: chatController.markAsDelivered
}


export const getUndeliveredMessagesOpts = {
	schema: {
		response: {
			200: {
				type: "array",
				properties: {
					undeliveredMessages : {
						type: "object",
						properties: {
							messageId: { type: "integer" },
							fromUserId: { type: "integer" },
							toUserId: { type: "integer" },
							content: { type: "string" },
							createdAt: { type: "string" },
							requestId: { type: "string" }
						}
					}
				}
			}
		}
	},
	handler: chatController.getUndeliveredMessages
}
