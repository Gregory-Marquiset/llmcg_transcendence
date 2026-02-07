const maxChatPayloadSize = 16 * 1024;

export const checkEventType = (event, socket) => {

    if (typeof event === "string")
        return (event);
    else if (Buffer.isBuffer(event))
        return (event.toString("utf8"));
    else if (event instanceof Uint8Array)
        return (Buffer.from(event).toString("utf8"));
    else
    {
        socket.badFrames++;
        if (socket.badFrames > 5)
        {
            socket.close(1008, "too_much_bad_frames");
            return (null);
        }
        socket.send(JSON.stringify({ type: "error", code: "unsupported_frame_type" }));
        return (null);
    }
}


export const checkPayloadSize = (rawText, socket) => {
    
    const bytes = new TextEncoder().encode(rawText).length;
	if (bytes > maxChatPayloadSize)
    {
		socket.close(1009, "payload_too_large");
        return (false);
    }
    return (true);
}


export const checkAndTrimRawText = (rawText, socket) => {
    rawText = rawText.trim();
    if (rawText.length === 0)
    {
        socket.badFrames++;
        if (socket.badFrames > 5)
        {
            socket.close(1008, "too_much_bad_frames");
            return (null);
        }
        socket.send(JSON.stringify({ type: "error", code: "empty_message" }));
        return (null);
    }
    return (rawText);
}
