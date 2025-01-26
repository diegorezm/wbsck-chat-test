import {createContext, useContext, useEffect, useState, type ReactNode} from "react";
import {io, Socket} from "socket.io-client";
import {type DefaultEventsMap} from "socket.io";

interface SocketContext {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
}

const SocketContext = createContext<SocketContext | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({children}: {children: ReactNode}) => {
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const [isConnected, setIsConnected] = useState(false); // Track socket connection status

  useEffect(() => {
    const newSocket = io("http://localhost:3000");

    newSocket.on("connect", () => {
      console.log("Socket connected!");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected!");
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  if (!isConnected || !socket) {
    return <div>Connecting to server...</div>;
  }

  return (
    <SocketContext.Provider value={{socket}}>
      {children}
    </SocketContext.Provider>
  );
};
