import * as chatOpts from './chatSchema.js';


async function chatRoutes (app, options) {

	app.post('/messages', { onRequest: [app.authenticate], ...chatOpts.createMessagesOpts });
}

export { chatRoutes };
