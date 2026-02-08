import * as authOpts from "./authSchema.js"

async function authRoutes(app, options) {

	app.post('/register', authOpts.authRegisterOpts);

	app.post('/login', authOpts.authLoginOpts);

	app.post('/login/2fa', authOpts.authLogin2faOpts);

	app.get('/me', { onRequest: [app.authenticate], ...authOpts.authMeOpts });

	app.post('/refresh', authOpts.authRefreshOpts);

	app.delete('/logout', authOpts.authLogoutOpts);

	app.post('/2fa/setup', { onRequest: [app.authenticate], ...authOpts.auth2faSetupOpts });

	app.post('/2fa/verify', { onRequest: [app.authenticate], ...authOpts.auth2faVerifyOpts });

	app.get('/login/42/callback', authOpts.authLogin42Opts);
}

export { authRoutes };
