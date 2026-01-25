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