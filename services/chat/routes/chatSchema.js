import * as chatController from './chatController.js';

export const createMessagesOpts = {
	schema: {
		body: {
			type: "object",
			properties: {
				fromUserId: "integer",
				toUserId: "integer",
				content: "string",
				requestId: "integer"
			}
		},
		response: {
			201: {
				type: "object",
				properties: {
					status: "string"
				}
			}
		}
	},
	handler: chatController.createMessage
}
