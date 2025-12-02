import * as authController from "./authController.js"

export const authRegisterOpts = {
	schema: {
		body: {
			type: "object",
			required: ["username", "email", "password"],
			properties: {
				username: { type: "string" },
				email: { type: "string" },
				password: { type: "string" }
			}
		},
		response: {
			201: {
				type: "string"
			}
		}
	},
	handler: authController.authRegister
}

export const authLoginOpts = {
	schema: {
		body: {
			type: "object",
			required: ["email", "password"],
			properties: {
				email: { type: "string" },
				password: { type: "string" }
			}
		},
		response: {
			200: {
				type: "object",
				properties: {
					access_token: { type: "string" }
				},
				required: ["access_token"]
			}
		}
	},
	handler: authController.authLogin
}

export const authMeOpts = {
	schema: {
		response: {
			200: {
				type: "object",
				properties: {
					id: { type: "string" },
					username: { type: "string" },
					email: { type: "string" },
					createdAt: { type: "string" }
				}
			}
		}
	},
	handler: authController.authMe
}

export const authRefreshOpts = {
	schema: {
		response: {
			201: {
				type: "object",
				properties: {
					access_token: { type: "string" }
				},
				required: ["access_token"]
			}
		}
	},
	handler: authController.authRefresh
}

export const authLogoutOpts = {
	schema: {
		response: {
			204: {
			}
		}
	},
	handler: authController.authLogout
}

export const auth2faSetupOpts = {
	schema: {
		response: {
			201: {
				type: "object",
				properties: {
					secret: { type: "string" }
				},
				required: ["secret"]
			}
		}
	},
	handler: authController.auth2faSetup
}

export const auth2faVerifyOpts = {
	schema: {
		body: {
			type: "object",
			properties: {
				code: { type: "string" }
			},
			required: ["code"]
		},
		response: {
			201: {
				type: "object",
				properties: {
					message: { type: "string" }
				}
			}
		}
	},
	handler: authController.auth2faVerify
}
