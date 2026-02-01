import * as gdprOpts from './gdprSchema.js'

export async function gdprRoutes(app, options){
    app.get('/me', {onRequest: [app.authenticate], ...gdprOpts.getMeOpts});
    app.post('/me', {onRequest: [app.authenticate], ...gdprOpts.requestDeleteMeOpts})
    app.delete('/me', {onRequest: [app.authenticate], ...gdprOpts.deleteMeOpts});
    app.delete('/data', {onRequest: [app.authenticate], ...gdprOpts.deleteDataOpts});
    app.get('/history', {onRequest: [app.authenticate], ...gdprOpts.getHistoryOpts});
}
