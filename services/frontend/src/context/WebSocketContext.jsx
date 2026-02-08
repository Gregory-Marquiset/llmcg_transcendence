import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { accessToken } = useAuth();
  const wsRef = useRef(null);
  const listenersRef = useRef(new Set());
  const reconnectTimer = useRef(null);
  const reconnectAttempt = useRef(0);
  const tokenRef = useRef(accessToken);

  const [status, setStatus] = useState("disconnected");
  const [presenceMap, setPresenceMap] = useState({});

  const clearReconnect = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  // Internal listener for presence events — always active
  const handleInternalMessage = useCallback((data) => {
    if (data.type === "presence:update" && data.userId) {
      setPresenceMap((prev) => ({
        ...prev,
        [data.userId]: data.payload?.status || "offline"
      }));
    }
  }, []);

  const connect = useCallback((token) => {
    if (!token) return;

    const existing = wsRef.current;
    if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;
    const wsUrl = `${protocol}://${host}/ws?token=${encodeURIComponent(token)}`;

    console.log("[WS] connecting to", wsUrl);
    setStatus("connecting");

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] connected");
      setStatus("connected");
      reconnectAttempt.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleInternalMessage(data);
        listenersRef.current.forEach((cb) => {
          try { cb(data); } catch (e) { console.error("[WS] listener error", e); }
        });
      } catch (e) {
        console.error("[WS] failed to parse message", e);
      }
    };

    ws.onclose = (evt) => {
      console.log("[WS] closed", evt.code, evt.reason);
      setStatus("disconnected");
      if (wsRef.current === ws) wsRef.current = null;

      const currentToken = tokenRef.current;
      if (currentToken && evt.code !== 1000) {
        const delay = Math.min(1000 * 2 ** reconnectAttempt.current, 30000);
        reconnectAttempt.current++;
        console.log(`[WS] reconnecting in ${delay}ms (attempt ${reconnectAttempt.current})`);
        clearReconnect();
        reconnectTimer.current = setTimeout(() => connect(currentToken), delay);
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] error", err);
    };
  }, [handleInternalMessage]);

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      console.log("[WS] no token -> closing socket");
      clearReconnect();
      reconnectAttempt.current = 0;
      const ws = wsRef.current;
      if (ws) {
        try { ws.close(1000, "logout"); } catch {}
        wsRef.current = null;
      }
      setStatus("disconnected");
      setPresenceMap({});
      return;
    }

    const ws = wsRef.current;
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      if (ws.readyState === WebSocket.OPEN) {
        console.log("[WS] token changed, sending auth:refresh");
        ws.send(JSON.stringify({
          type: "auth:refresh",
          requestId: Date.now().toString(36),
          payload: { token: accessToken }
        }));
      }
      return;
    }

    connect(accessToken);
  }, [accessToken, connect]);

  useEffect(() => {
    return () => {
      clearReconnect();
      const ws = wsRef.current;
      if (ws) {
        try { ws.close(1000, "unmount"); } catch {}
        wsRef.current = null;
      }
    };
  }, []);

  const send = useCallback((obj) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj));
      return true;
    }
    return false;
  }, []);

  const subscribe = useCallback((callback) => {
    listenersRef.current.add(callback);
    return () => listenersRef.current.delete(callback);
  }, []);

  const api = useMemo(() => ({
    status,
    isConnected: status === "connected",
    send,
    subscribe,
    presenceMap,
  }), [status, send, subscribe, presenceMap]);

  return <WebSocketContext.Provider value={api}>{children}</WebSocketContext.Provider>;
}

export function useWS() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWS must be used within WebSocketProvider");
  return ctx;
}
