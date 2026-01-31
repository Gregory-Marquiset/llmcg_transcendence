import * as gdprController from './gdprController.js'

export const getMeOpts = {
    schema : {
        headers : {
            type : "object",
            properties : {
                authorization : {type : "string"},
            },
            required : "authorization",
        },
        response : {
            200 : {
                type : "object",
                properties : {
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
						last_login: { type: "string" }
					},
                    todo_list : {
                        type : "array",
                        items : {
                            type : "object",
                            properties : {
                                id : {type : "integer"},
                                title : {type : "string" },
                                description : {type : "string" },
                                done : {type : "boolean"},
                                deadline : {type : "string"},
                                created_at : {type : "string"}
                            }
                        }
                    },
                    history : {
                        type : "array",
                        items : {
                            type : "object",
                            properties : {
                                id : {type : "integer"},
                                title : { type : "string" },
                                description : {type : "string"},
                                createdAt : {type : "string"}
                            }
                        }
                    },
                    friendships : {
                        type : "array",
                        items : {
                            type : "object",
                            properties : {
                                id : {type : "integer"},
                                username : {type : "string"},
                                status : {
                                    type : "string",
                                    enum : ["pending", "accepted", "refused", "blocked", "removed"]
                                },
                                created_at : {type : "string" },
                                updated_at : {type : "string" }
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    handler : gdprController.getMe
}