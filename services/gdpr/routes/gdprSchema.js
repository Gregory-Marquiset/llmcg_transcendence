import * as gdprController from './gdprController.js'

export const getMeOpts = {
    schema : {
        querystring : {
            type : "object",
            properties : {
                token : {type : "string"},
            }
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
						last_login: { type: "string" },
                        }
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
                daily_logtime : {
                    type : "array", 
                    items : {
                        type : "object",
                        properties : {
                            id : {type : "integer"},
                            user_id : {type : "integer"},
                            day: {type : "string"},
                            logtime_second : {type : "integer"},
                        }
                    }
                }
                },
            },
        },
    },
    handler : gdprController.getMe
}

export const deleteMeOpts = {
    schema : {
        headers : {
            type : "object",
            properties : {
                authorization : {type : "string"},
            },
            required : ["authorization"],
        },
        response : {
            204 : {
            }
        }
    },
    handler : gdprController.deleteMe
}

export const deleteDataOpts = {
    schema : {
        headers : {
            type : "object",
            properties : {
                authorization : {type : "string"},
            },
            required : ["authorization"],
        },
        response :{
            204 : {

            }
        }
    },
    handler : gdprController.deleteData
}

export const getHistoryOpts = {
    schema : {
        headers : {
            type : "object",
            properties : {
                authorization : {type : "string"},
            },
            required : ["authorization"],
        },
        response : {
            200: {
                type : "array",
                items : {
                    type : "object",
                    properties : {
                        id : { type : "integer"},
                        user_id : { type : "integer"},
                        action : { type : "string"},
                        created_at : { type : "string"},
                        executed_at : { type : "string"},
                    }
                }
            }
        }
    },
    handler : gdprController.getHistory
}

export const requestDeleteMeOpts = {
    schema : {
        headers : {
            type : "object",
            properties : {
                authorization : { type : "string"},
            },
            required : ["authorization"],
        },
        response : {
            202 : {
            }
        }
    },
    handler : gdprController.requestAccountDeletion
}

export const requestDeleteDataOpts = {
    schema : {
        headers : {
            type : "object",
            properties : {
                authorization : { type : "string"},
            },
            required : ["authorization"],
        },
        response : {
            202 : {
            }
        }
    },
    handler : gdprController.requestDataDeletion
}
export const confirmDeletionOpts = {
    schema : {
        querystring : {
            type : "object",
            properties : {
                token : {type : "string"},
            }
        },
        response : {
            202 : {
            }
        }
    },
    handler : gdprController.confirmDeletion
}

export const requestMeOpts = {
     schema : {
        headers : {
            type : "object",
            properties : {
                authorization : { type : "string"},
            },
            required : ["authorization"],
        },
        response : {
            202 : {
            }
        }
    },
    handler : gdprController.requestDataDisplay
}