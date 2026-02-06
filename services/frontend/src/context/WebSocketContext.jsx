import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { accessToken } = useAuth();
  const wsRef = useRef(null);

  const [status, setStatus] = useState("disconnected");
  const [lastError, setLastError] = useState(null);

  useEffect(() => {
    console.log("[WS] effect fired, accessToken:", accessToken ? "YES" : "NO");

    if (!accessToken) {
      console.log("[WS] no token -> closing socket");
      const ws = wsRef.current;
      if (ws) {
        try { ws.close(1000, "logout"); } catch {}
        wsRef.current = null;
      }
      setStatus("disconnected");
      setLastError(null);
      return;
    }

    const existing = wsRef.current;
    if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const host = window.location.hostname;
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${host}:5000/ws?token=${encodeURIComponent(accessToken)}`;

    console.log("[WS] connecting to", wsUrl);

    setStatus("connecting");
    setLastError(null);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] connected");
      setStatus("connected");
    };

    ws.onclose = (evt) => {
      console.log("[WS] closed", evt.code, evt.reason);
      setStatus("disconnected");
      if (wsRef.current === ws) wsRef.current = null;
    };

    ws.onerror = (err) => {
      console.log("[WS] error", err);
      setLastError(err);
    };

    return () => {
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        try { ws.close(1000, "unmount"); } catch {}
      }
      if (wsRef.current === ws) wsRef.current = null;
    };
  }, [accessToken]);

  const api = useMemo(() => ({
    status,
    isConnected: status === "connected",
    lastError,
  }), [status, lastError]);

  return <WebSocketContext.Provider value={api}>{children}</WebSocketContext.Provider>;
}

export function useWS() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWS must be used within WebSocketProvider");
  return ctx;
}
