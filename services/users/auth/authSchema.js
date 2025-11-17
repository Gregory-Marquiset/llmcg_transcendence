import * as authController from "./authController.js"

export const authRegisterOpts = {
	schema: {
		body: {
			type: "object",
			required: ["username", "email", "password"],
			properties: {
				username: {type: "string"},
				email: {type: "string"},
				password: {type: "string"}
			}
		},
		response: {
			200: {
				type: "object",
				properties: {
					id: {type: "string"},
					username: {type: "string"},
					email: {type: "string"},
					password: {type: "string"},
					creationDate: {type: "string"}
				}
			}
		}
	},
	handler: authController.authRegister
}


