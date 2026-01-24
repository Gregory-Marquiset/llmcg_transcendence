import * as chatOpts from './chatSchema.js';

async function chatRoutes (app, options) {

	app.post('/messages', { onRequest: [app.authenticate], ...chatOpts.createMessagesOpts });

	app.post('/messages/delivered', { onRequest: [app.authenticate], ...chatOpts.markAsDeliveredOpts });

	app.get('/messages/undelivered', { onRequest: [app.authenticate], ...chatOpts.getUndeliveredMessagesOpts });
}

export { chatRoutes };
