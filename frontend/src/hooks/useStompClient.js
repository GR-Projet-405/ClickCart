import { useEffect, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from '../config/api';

export const useStompClient = () => {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    
    // Convert API_BASE_URL to WS endpoint for SockJS
    const socketUrl = API_BASE_URL.replace('/api', '/ws');
    
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = (frame) => {
      console.log('STOMP connected');
      setConnected(true);
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP error', frame.headers['message']);
    };
    
    stompClient.onWebSocketClose = () => {
      setConnected(false);
    };

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
      setConnected(false);
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

  return { client, connected, subscribe, send };
};
