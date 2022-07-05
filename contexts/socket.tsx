import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketContext = createContext<{ socket: Socket | null }>({ socket: null });

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, _] = useState(
    io("https://arcane-chamber-60613.herokuapp.com/", {
      transports: ["websocket"],
      upgrade: false,
    })
  );

  useEffect(() => {
    (async () => {
      await fetch("https://arcane-chamber-60613.herokuapp.com/");
    })();

    if (socket.disconnected) socket.connect();

    return () => {
      socket.close();
    };
  }, [socket.disconnected]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
