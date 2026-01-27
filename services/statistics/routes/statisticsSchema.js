import * as statisticsController from './statisticController.js'

export const updateSeniorityOpts = {
    schema : {
        response : {
            200 : {
                type: "object",
                properties : {
                    current_seniority : {type: "integer"}
                }
            }
        }
    },
    handler: statisticsController.updateSeniority
}

export const getAllTodoOpts = {
    schema: {
        headers: {
            type: 'object',
            properties: {
                authorization: { type: 'string' }
            },
            required: ['authorization']
        },
        response : {
            200 : {
                type : 'array',
                items : {
                    type : 'object',
                    properties : {
                        id : {type : "integer"},
                        title : {type : "string" },
                        description : {type : "string" },
                        done : {type : "boolean"},
                        deadline : {type : "string"}
                    }
                }
            },
        },
    },
    handler: statisticsController.getAllTodo
}