import { createContext, useContext, useEffect } from "react";
// import { Socket } from "socket.io";
// import { io } from "socket.io-client";
// import { DefaultEventsMap } from "socket.io/dist/typed-events";

// interface SocketProviderProps {
//   children: React.ReactNode;
// }
// const SocketContext = createContext<any>(null);

// export const SocketProvider = ({ children }: SocketProviderProps) => {
//   const socket = io("http://localhost:6969", {
//     // transports: ["websocket"],
//     // upgrade: false,
//   });
//   useEffect(() => {
//     (async () => {
//       await fetch("http://localhost:6969");
//     })();
//   }, []);
//   return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
// };

// export const useSocket = () => useContext(SocketContext);
