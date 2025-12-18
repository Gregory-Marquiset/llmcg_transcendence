import { getActiveSockets } from "../websocketHandler/connexionRegistry.js";

export const presenceBroadcaster = function (data) {
    const activeSockets = getActiveSockets();
    const payload = JSON.stringify(data);
    
    activeSockets.forEach((value, activeSocket) => {
        try {
            activeSocket?.send(payload);
        } catch (err) {
            console.error(`\nERROR presenceBroadcaster: ${err.message}\n`);
        }
    });

}