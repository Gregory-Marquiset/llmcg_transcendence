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
					id: { type: "integer" },
					username: { type: "string" },
					email: { type: "string" },
					avatar_path: { type: "string" },
					twofa_enabled: { type: "integer" },
					createdAt: { type: "string" },
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

export const userProfilOpts = {
	schema: {
		response: {
			200: {
				type: "object",
				properties: {
					id: { type: "integer" },
					username: { type: "string" },
					avatar_path: { type: "string" },
					friendshipsStatus: { type: "string" },
					blockedBy: { type: "integer" }
				}
			}
		}
	},
	handler: userController.userProfil
}
