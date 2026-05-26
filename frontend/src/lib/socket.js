import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : '';

let socketInstance = null;

export function getSocket({ token, clientEmail, clientName } = {}) {
  if (socketInstance?.connected) return socketInstance;

  socketInstance = io(URL, {
    auth: { token, clientEmail, clientName },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  return socketInstance;
}

export function disconnectSocket() {
  socketInstance?.disconnect();
  socketInstance = null;
}
