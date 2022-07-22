import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketContext = createContext<{ socket: Socket | null }>({ socket: null });

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const URL = useMemo(
    () =>
      process.env.NEXT_PUBLIC_VERCEL_URL ? "https://arcane-chamber-60613.herokuapp.com/" : "http://localhost:6969",
    []
  );

  const [socket, setSocket] = useState(
    io(URL, {
      transports: ["websocket"],
      upgrade: false,
    })
  );

  useEffect(() => {
    (async () => {
      await fetch(URL);
    })();

    if (socket.disconnected) {
      socket.disconnect();
      setSocket(
        io(URL, {
          transports: ["websocket"],
          upgrade: false,
        })
      );
    }

    return () => {
      socket.disconnect();
    };
  }, [socket.disconnected]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
