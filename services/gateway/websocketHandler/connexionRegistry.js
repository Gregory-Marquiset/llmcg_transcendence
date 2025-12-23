export const connectionsIndex = new Map();

/* struct connectionsIndex :
{
	userId,
	connectionId,
	ip
	isAlive
}
*/

export const getActiveSockets = function () {
    return (connectionsIndex);
}