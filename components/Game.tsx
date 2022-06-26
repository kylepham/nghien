import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";

let socket = io("https://arcane-chamber-60613.herokuapp.com/");

enum GameStates {
  NEW_GAME,
  WAITING,
  LOSER,
  GET_FUCKED,
}

interface GameProps {
  who: String;
}

const Game = ({ who }: GameProps) => {
  console.log(who);
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [gameState, setGameState] = useState(GameStates.NEW_GAME);
  const [justTookAction, setJustTookAction] = useState(false);
  const [dashboardState, setDashboardState] = useState("");
  const [loss, setLoss] = useState("");

  useEffect(() => {
    if (who === null) return;
    // (async () => {
    //   await fetch("http://localhost:6969");
    // })();
    socket = io("https://arcane-chamber-60613.herokuapp.com/", {
      transports: ["websocket"],
      upgrade: false,
    });
    socketInitializer();

    return () => {
      socket.close();
    };
  }, [who]);

  const socketInitializer = useCallback(async () => {
    socket.on("connect", () => {
      console.log("connected");
      socket.emit("my-socketid");
      socket.emit("status", who);
    });

    socket.on("online", (from, isLossRegistered, winner, fucker, dashboardState) => {
      if (who !== from && from !== "") return;
      setIsOnline(true);
      setDashboardState(dashboardState);

      if (winner !== "") {
        if (who !== winner && !isLossRegistered) setGameState(GameStates.LOSER);
        else {
          setGameState(GameStates.WAITING);
          if (who === winner) setJustTookAction(true);
        }
      } else if (fucker !== "") {
        if (who !== fucker) setGameState(GameStates.GET_FUCKED);
        else {
          setGameState(GameStates.WAITING);
          setJustTookAction(true);
        }
      }

      socket.emit("who-i-am", who);
    });

    socket.on("dashboard-statechange", (dashboardState) => {
      setDashboardState(dashboardState);
      setGameState(GameStates.NEW_GAME);
    });

    socket.on("lose", (winnerName) => {
      if (winnerName !== who) setGameState(GameStates.LOSER);
    });

    socket.on("prompt-fucked", (from) => {
      if (from !== who) setGameState(GameStates.GET_FUCKED);
    });

    socket.on("dismiss", () => {
      // setJustTookAction(false);
      setGameState(GameStates.NEW_GAME);
    });

    socket.on("new-game", () => {
      setJustTookAction(false);
      setGameState(GameStates.NEW_GAME);
    });

    socket.on("kick", () => {
      router.replace("/").then(() => router.reload());
    });
  }, []);
  return (
    <>
      <Head>
        <title>Sam Loc - {who}</title>
      </Head>

      <h3 className="mt-4">- {who} -</h3>
      <div className="flex flex-col flex-1 items-center justify-center w-full max-w-lg h-sc">
        {isOnline ? (
          dashboardState === "pausing" ? (
            <p className="text-gray-700">Game paused</p>
          ) : gameState === GameStates.NEW_GAME ? (
            <>
              <button
                className="bg-red-400 p-2 m-2 rounded text-7xl font-bold"
                onClick={() => {
                  socket.emit("dashboard-win", who);
                  setJustTookAction(true);
                  setGameState(GameStates.WAITING);
                }}
              >
                Win
              </button>
              <button
                className="bg-black p-2 m-2 rounded text-7xl text-white font-bold"
                onClick={() => {
                  socket.emit("dashboard-fucks", who);
                  socket.emit("prompt-fucked", who);
                  setJustTookAction(true);
                  setGameState(GameStates.WAITING);
                }}
              >
                GET F*CKED
              </button>
            </>
          ) : gameState === GameStates.WAITING ? (
            <>
              <p className="text-gray-700">Waiting...</p>
              {justTookAction && (
                <button
                  className="bg-green-200 rounded p-2 m-2 text-gray-700 hover:bg-green-300"
                  onClick={() => {
                    socket.emit("dismiss");
                  }}
                >
                  Back
                </button>
              )}
            </>
          ) : gameState === GameStates.LOSER ? (
            <div className="flex flex-col self-center items-center">
              <p className="text-gray-700">Alo alo. Thua bao nhiêu cơ?</p>
              <input
                className="border border-black rounded p-2 text-lg text-center"
                value={loss}
                type="tel"
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
          <p className="text-gray-700">Chưa có game, đợi đê 🥱</p>
        )}
      </div>
    </>
  );
};

export default Game;
