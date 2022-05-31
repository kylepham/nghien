import { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
    // console.log(res.socket.server.io);
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    io.on("connection", async (socket) => {
      io.emit("user-join", Array.from(await io.allSockets()));

      socket.on("click", () => {
        io.emit("handle-click", "fuck");
      });

      socket.on("disconnect", () => {
        socket.broadcast.emit("user-leave", socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;
