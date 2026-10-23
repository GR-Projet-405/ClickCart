import { getAccessToken, refreshSession } from "../services/authService";
import { useEffect, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from '../config/api';

export const CONNECTION_STATE = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  OFFLINE: 'offline',
};

// After this many consecutive failed connection attempts we report "offline"
const MAX_RECONNECT_ATTEMPTS_BEFORE_OFFLINE = 3;

export const useStompClient = () => {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connectionState, setConnectionState] = useState(CONNECTION_STATE.CONNECTING);

  useEffect(() => {
    const token = getAccessToken();
    
    // Convert API_BASE_URL to WS endpoint for SockJS
    const socketUrl = API_BASE_URL.replace('/api', '/ws');
    
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      beforeConnect: async () => {
        let expiresAt = 0;
        try { expiresAt = JSON.parse(atob(getAccessToken().split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000; } catch { /* No usable session yet. */ }
        if (expiresAt <= Date.now() + 30000) await refreshSession();
        stompClient.connectHeaders = { Authorization: `Bearer ${getAccessToken()}` };
      },
      debug: function (str) {
        if (import.meta.env.DEV) {
          console.log(str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    let failedAttempts = 0;

    stompClient.onConnect = () => {
      if (import.meta.env.DEV) {
        console.log('STOMP connected');
      }
      failedAttempts = 0;
      setConnected(true);
      setConnectionState(CONNECTION_STATE.CONNECTED);
    };

    stompClient.onStompError = (frame) => {
      if (import.meta.env.DEV) {
        console.error('STOMP error', frame?.headers?.['message']);
      }
      failedAttempts += 1;
      setConnected(false);
      setConnectionState(
        failedAttempts >= MAX_RECONNECT_ATTEMPTS_BEFORE_OFFLINE
          ? CONNECTION_STATE.OFFLINE
          : CONNECTION_STATE.RECONNECTING
      );
    };

    stompClient.onWebSocketError = () => {
      failedAttempts += 1;
      setConnected(false);
      setConnectionState(
        failedAttempts >= MAX_RECONNECT_ATTEMPTS_BEFORE_OFFLINE
          ? CONNECTION_STATE.OFFLINE
          : CONNECTION_STATE.RECONNECTING
      );
    };
    
    stompClient.onWebSocketClose = () => {
      failedAttempts += 1;
      setConnected(false);
      setConnectionState(
        failedAttempts >= MAX_RECONNECT_ATTEMPTS_BEFORE_OFFLINE
          ? CONNECTION_STATE.OFFLINE
          : CONNECTION_STATE.RECONNECTING
      );
    };

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
      setConnected(false);
      setConnectionState(CONNECTION_STATE.OFFLINE);
    };
  }, []);

  const subscribe = useCallback((destination, callback) => {
    if (!client || !connected) return null;
    return client.subscribe(destination, (msg) => {
      callback(JSON.parse(msg.body));
    });
  }, [client, connected]);

  const send = useCallback((destination, body) => {
    if (!client || !connected) return false;
    client.publish({
      destination,
      body: JSON.stringify(body)
    });
    return true;
  }, [client, connected]);

  return { client, connected, connectionState, subscribe, send };
};
