import * as gdprOpts from './gdprSchema.js'

export async function gdprRoutes(app, options){
    app.get('/me', {onRequest: [app.authentificate], ...gdprOpts.getMeOpts})
}