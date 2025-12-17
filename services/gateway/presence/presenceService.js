import { sessionsByUser, userPresence } from "./presenceStore.js";

export const onSocketConnected = function (userId, socket, date) {
    
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
    currentUserSession.socketSet.add(socket);

    const currentUserPresence = userPresence.get(userId);
    let isOnlineNow = currentUserSession.socketSet.size > 0;
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
}



export const onSocketDisconnected = function (userId, socket, date) {

    let currentUserSession = sessionsByUser.get(userId);
    if (!currentUserSession)
        return;
    currentUserSession.socketSet.delete(socket);
    if (currentUserSession.socketSet.size === 0)
    {
        let currentUserPresence = userPresence.get(userId);
        if (!currentUserPresence)
            return;
        currentUserPresence.status = "offline";
        currentUserPresence.lastSeenAt = date;
        currentUserPresence.activeSince = null;
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