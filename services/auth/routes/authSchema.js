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
				type: "object",
				properties: {
					message: { type: "string" }
				}
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

export const authLogin2faOpts = {
	schema: {
		body: {
			type: "object",
			properties: {
				temp_token: { type: "string" },
				code: { type: "string" }
			},
			required: ["temp_token", "code"]
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
	handler: authController.authLogin2fa
}

export const authMeOpts = {
	schema: {
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
					stats : {
						type : "object",
						properties : {
						rank_position: { type: "integer" },
						task_completed: { type: "integer" },
						friends_count: { type: "integer" },
						streaks_history: { type: "integer" },
						current_streak_count: { type: "integer" },
						monthly_logtime: { type: "integer" },
						monthly_logtime_month: { type: "string" },
						app_seniority: { type: "integer" },
						upload_count: { type: "integer" },
						created_at: { type: "string" },
						updated_at: { type: "string" },
						last_login: { type: "string" },
						progressbar: { type : "integer"}
					}
				}
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

export const authLogin42Opts = {
  schema: {
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
	handler: authController.authLogin42Callback
}