import * as userController from './userController.js';

export const userMeOpts = {
	schema: {
		body: {
			type: "object",
			properties: {
				new_username: { type: "string" },
				new_email: { type: "string" }
			}
		},
		response: {
			200: {
				type: "object",
				properties: {
					id: { type: "string" },
					username: { type: "string" },
					email: { type: "string" },
					avatar_path: { type: "string" },
					twofa_enabled: { type: "integer" },
					createdAt: { type: "string" },
					status: { type: "string" }
				}
			}
		}
	},
	handler: userController.userMe
}

export const userMeAvatarOpts = {
	schema: {
		consumes: ["multipart/form-data"],
		response: {
			200: {
				type: "object",
				properties: {
					avatar_url: { type: "string" }
				}
			}
		}
	},
	handler: userController.userMeAvatar
}
