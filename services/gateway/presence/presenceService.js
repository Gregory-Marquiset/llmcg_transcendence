import { sessionsByUser, userPresence } from "./presenceStore.js";
import { presenceBroadcaster } from "./presenceBroadcaster.js";

export const onSocketConnected = function (userId, socket, date) {
    console.log(`\nonSocketConnected\n`);
    let wasOnline = false;
    let currentUserSession = sessionsByUser.get(userId);
    if (!currentUserSession)
    {
        currentUserSession = {
            socketSet: new Set(),
            offlineTimer: null,
            connectedSince: date,
        };
        sessionsByUser.set(userId, currentUserSession);
    }
    else if (currentUserSession.socketSet.size > 0)
        wasOnline = true;

    // Annuler le timer offline si l'utilisateur se reconnecte
    if (currentUserSession.offlineTimer) {
        clearTimeout(currentUserSession.offlineTimer);
        currentUserSession.offlineTimer = null;
        //console.log(`\nCancelled offline timer for user ${userId}\n`);
    }

    currentUserSession.socketSet.add(socket);
    let isOnlineNow = currentUserSession.socketSet.size > 0;

    let currentUserPresence = userPresence.get(userId);
    if (!currentUserPresence)
    {
        userPresence.set(userId, {
            status: "online",
            lastSeenAt: null,
            activeSince: date
        });
    }
    else if (currentUserPresence.status === "offline" && isOnlineNow === true)
    {
        currentUserPresence.status = "online";
        currentUserPresence.lastSeenAt = null;
        currentUserPresence.activeSince = date;
    }
    if (wasOnline === false && isOnlineNow === true)
    {
        currentUserPresence = userPresence.get(userId);
        presenceBroadcaster({ 
            type: "presence:update",
            userId,
            payload: {
                status: currentUserPresence.status,
                lastSeenAt: currentUserPresence.lastSeenAt,
                activeSince: currentUserPresence.activeSince
            }
        });
        return (true);
    }
    return (false);
}



export const onSocketDisconnected = function (userId, socket, date) {
    console.log(`\nonSocketDisconnected\n`);
    let currentUserSession = sessionsByUser.get(userId);
    if (!currentUserSession)
        return;
    currentUserSession.socketSet.delete(socket);

    // Si c'était la dernière connexion, attendre avant de passer offline
    if (currentUserSession.socketSet.size === 0)
    {
        //console.log(`\nNo more sockets for user ${userId}, setting offline timer\n`);

        // Délai de 15 secondes avant de passer offline
        // Cela permet à l'utilisateur de changer de page sans perdre son statut online
        currentUserSession.offlineTimer = setTimeout(() => {
            let currentUserPresence = userPresence.get(userId);
            if (!currentUserPresence)
                return;

            // Vérifier à nouveau qu'il n'y a toujours pas de connexions
            if (currentUserSession.socketSet.size === 0) {
                currentUserPresence.status = "offline";
                currentUserPresence.lastSeenAt = new Date().toISOString();
                currentUserPresence.activeSince = null;
                presenceBroadcaster({
                    type: "presence:update",
                    userId,
                    payload: {
                        status: currentUserPresence.status,
                        lastSeenAt: currentUserPresence.lastSeenAt,
                        activeSince: currentUserPresence.activeSince
                    }
                });
                //console.log(`\nUser ${userId} is now offline after timeout\n`);
            }
        }, 15000); // 15 secondes
    }
}



export const getPresenceForUsers = function (ids) {
    let idsInfos = new Map();
    let currentUserPresence;
    ids.forEach((id) => {
        currentUserPresence = userPresence.get(id)
        if (!currentUserPresence)
        {
            idsInfos.set(id, {
                status: "offline",
                lastSeenAt: null,
                activeSince: null
            });
            return;
        }
        idsInfos.set(id, {
            status: currentUserPresence.status,
            lastSeenAt: currentUserPresence.lastSeenAt,
            activeSince: currentUserPresence.activeSince
        });
    });
    return (idsInfos);
}
