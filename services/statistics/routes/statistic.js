import * as statisticsOpts from './statisticsSchema.js'

export async function statsRoutes(app, options){
    app.put('/seniority', {onRequest: [app.authenticate], ...statisticsOpts.updateSeniorityOpts});
    app.get('/todo', {onRequest: [app.authenticate], ...statisticsOpts.getAllTodoOpts});
}