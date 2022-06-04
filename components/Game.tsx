import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import io from "socket.io-client";

let socket;

enum GameStates {
  NEW_GAME,
  WAITING,
  LOSER,
  GET_FUCKED,
}

const Game = ({ who, setWho }) => {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [gameState, setGameState] = useState(GameStates.NEW_GAME);
  const [loss, setLoss] = useState("");

  useEffect(() => {
    if (who === null) return;
    socketInitializer();
  }, [who]);

  const socketInitializer = useCallback(async () => {
    await fetch("https://arcane-chamber-60613.herokuapp.com/");
    socket = io("https://arcane-chamber-60613.herokuapp.com/");

    socket.on("connect", () => {
      console.log("connected");
      socket.emit("my-socketid");
      socket.emit("status");
    });

    socket.on("online", (dashboardId) => {
      setIsOnline((_) => true);
      socket.emit("who-i-am", who);
    });

    socket.on("lose", (winnerName) => {
      if (winnerName !== who) setGameState(GameStates.LOSER);
    });

    socket.on("prompt-fucked", () => {
      setGameState(GameStates.GET_FUCKED);
    });

    socket.on("new-game", () => {
      setGameState((_) => GameStates.NEW_GAME);
    });

    // socket.on("user-leave", (user) => {
    //   setDashboardIds((prevDashboardIds) => {
    //     if (prevDashboardIds.includes(user)) return prevDashboardIds.filter((dashboardId) => dashboardId !== user);
    //     return prevDashboardIds;
    //   });
    // });

    socket.on("kick", () => {
      router.replace("/").then(() => router.reload());
    });

    socket.on("delete-allsockets", () => {
      router.replace("/").then(() => router.reload());
    });
  }, []);
  return (
    <div className="flex flex-col justify-center w-full min-h-screen max-w-lg">
      <p className="self-center">{who}</p>
      {isOnline ? (
        gameState === GameStates.NEW_GAME ? (
          <>
            <button
              className="bg-red-400 p-2 m-2 rounded text-7xl font-bold"
              onClick={() => {
                socket.emit("dashboard-win", who);
                setGameState(GameStates.WAITING);
              }}
            >
              Win
            </button>
            <button
              className="bg-black p-2 m-2 rounded text-7xl text-white font-bold"
              onClick={() => {
                socket.emit("dashboard-fucks", who);
                socket.emit("prompt-fucked");
              }}
            >
              GET F*CKED
            </button>
          </>
        ) : gameState === GameStates.WAITING ? (
          <p>Waiting...</p>
        ) : gameState === GameStates.LOSER ? (
          <div className="flex flex-col self-center items-center">
            <p>Alo alo. Thua bao nhiêu cơ?</p>
            <input
              className="border border-black rounded p-2 text-lg text-center"
              value={loss}
              onChange={(e) => {
                setLoss(e.target.value);
              }}
            />
            <button
              className="bg-green-200 rounded p-2 m-2 text-gray-700 text-5xl hover:bg-green-300"
              onClick={() => {
                if (!!!Number.parseInt(loss)) return;
                socket.emit("dashboard-lose", who, Number.parseInt(loss));
                setLoss("");
                setGameState(GameStates.WAITING);
              }}
            >
              🌶
            </button>
          </div>
        ) : (
          <button
            className="bg-black p-2 m-2 rounded text-7xl text-white font-bold"
            onClick={() => {
              socket.emit("dashboard-fucks", who);
              socket.emit("dashboard-newgame");
            }}
          >
            I&apos;M F*CKED
          </button>
        )
      ) : (
        <p>No game :(</p>
      )}
    </div>
  );
};

export default Game;
