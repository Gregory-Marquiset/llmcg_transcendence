import * as statisticsOpts from './statisticsSchema.js'

export async function statsRoutes(app, options){
    app.get('/todo', {onRequest: [app.authenticate], ...statisticsOpts.getAllTodoOpts});
    app.post('/todo', {onRequest: [app.authenticate], ...statisticsOpts.postNewTodoOpts});
    app.delete('/todo/:id', {onRequest: [app.authenticate], ...statisticsOpts.deleteTodoOpts});
    app.patch('/todo/:id', {onRequest: [app.authenticate], ...statisticsOpts.markAsDoneOpts});
    app.get('/history', {onRequest: [app.authenticate], ...statisticsOpts.getHistoryOpts});
    app.get('/weeklylogtime', {onRequest : [app.authenticate], ...statisticsOpts.getWeeklyLogtimeOpts})
}