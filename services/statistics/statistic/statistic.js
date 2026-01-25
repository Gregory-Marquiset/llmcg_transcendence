import * as statisticsOpts from './statisticsSchema.js'

async function statsRoutes(app, options){
    app.put('/seniority', {onRequest: [app.authenticate], ...statisticsOpts.updateSeniorityOpts});
}