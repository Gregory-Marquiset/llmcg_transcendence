import * as gdprOpts from './gdprSchema.js'

export async function gdprRoutes(app, options){
    app.get('/me', {onRequest: [app.authenticate], ...gdprOpts.getMeOpts});
    app.delete('/deleteme', {onRequest: [app.authenticate], ...gdprOpts.deleteMeOpts});
    app.delete('/deletedata', {onRequest: [app.authenticate], ...gdprOpts.deleteDataOpts})
}
