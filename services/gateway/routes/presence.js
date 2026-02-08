import { getPresenceForUsers } from "../presence/presenceService.js";

export async function presenceRoutes(app, options) {
	app.get('/api/v1/presence', {
		preHandler: app.authenticate
	}, async (req, reply) => {
		try {
			const idsParam = req.query.ids;
			if (!idsParam) {
				return reply.code(400).send({ message: "Missing 'ids' query parameter" });
			}

			const ids = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

			if (ids.length === 0) {
				return reply.code(400).send({ message: "No valid IDs provided" });
			}

			const presenceMap = getPresenceForUsers(ids);

			const presenceObj = {};
			presenceMap.forEach((value, key) => {
				presenceObj[key] = value;
			});

			return reply.code(200).send(presenceObj);
		} catch (err) {
			console.error(`\nERROR presenceRoutes: ${err.message}\n`);
			return reply.code(500).send({ message: "Internal server error" });
		}
	});
}
