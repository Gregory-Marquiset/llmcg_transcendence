import * as gdprOpts from './gdprSchema.js'

export async function gdprRoutes(app, options){
    app.get('/me', {onRequest: [app.authenticate], ...gdprOpts.getMeOpts});
    app.post('/me', {onRequest: [app.authenticate], ...gdprOpts.requestDeleteMeOpts});
    app.post('/data', {onRequest: [app.authenticate], ...gdprOpts.requestDeleteDataOpts});
    app.post('/confirm', ...gdprOpts.confirmDeletionOpts);
    app.get('/history', {onRequest: [app.authenticate], ...gdprOpts.getHistoryOpts});
}
