import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useSocket } from "../contexts/socket";

const GAME_STATES = {
  winning: "winning",
  losing: "losing",
  pausing: "pausing",
  playing: "playing",
};

interface GameProps {
  who: string;
}

const Game = ({ who }: GameProps) => {
  const router = useRouter();
  const { socket } = useSocket();

  const [isDashboardOnline, setIsDashboardOnline] = useState<boolean>(false);
  const [gameState, setGameState] = useState<string>(GAME_STATES.pausing);
  const [loss, setLoss] = useState<string>("");
  const [isLossSubmitted, setIsLossSubmitted] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isOnlineUsersVisible, setIsOnlineUsersVisible] = useState<boolean>(false);

  useEffect(() => {
    socket?.on("connect", () => {
      console.log("my socket id", socket?.id);
      socket.emit("new-user", who);
      socket.emit("status");
    });
  }, [who]);

  useEffect(() => {
    socket?.on("status", (isDashboardOnline, gameState, winner) => {
      setIsDashboardOnline(isDashboardOnline);
      setGameState(gameState);

      if (winner !== "") {
        if (winner !== who) {
          setGameState(GAME_STATES.losing);
        } else {
          setGameState(GAME_STATES.winning);
        }
      }
    });

    return () => {
      socket?.off("status");
    };
  }, []);

  useEffect(() => {
    socket?.on("update-users", (onlineUsers) => {
      setOnlineUsers(onlineUsers);
    });

    return () => {
      socket?.off("update-users");
    };
  }, []);

  useEffect(() => {
    socket?.on("pause", () => {
      setGameState(GAME_STATES.pausing);
    });

    socket?.on("play", () => {
      setGameState(GAME_STATES.playing);
    });

    return () => {
      socket?.off("pause");
      socket?.off("play");
    };
  }, []);

  useEffect(() => {
    socket?.on("lose", () => {
      setGameState(GAME_STATES.losing);
      setIsLossSubmitted(false);
    });

    return () => {
      socket?.off("lose");
    };
  }, []);

  useEffect(() => {
    socket?.on("cancel", () => {
      setGameState(GAME_STATES.playing);
      setLoss("");
    });

    return () => {
      socket?.off("cancel");
    };
  }, []);

  useEffect(() => {
    socket?.on("kick", () => {
      router.reload();
    });

    return () => {
      socket?.off("kick");
    };
  }, []);

  const handleWin = useCallback(() => {
    setGameState(GAME_STATES.winning);
    socket?.emit("win", who);
  }, [who]);

  const handleCancel = useCallback(() => {
    socket?.emit("cancel");
  }, []);

  const handleLossChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLoss(e.target.value);
  }, []);

  const handleSubmitLoss = useCallback(() => {
    if (!!!Number.parseInt(loss) || Number.parseInt(loss) === 0) return;

    setLoss("");
    setIsLossSubmitted(true);
    socket?.emit("loss-submit", who, Number.parseInt(loss));
  }, [loss]);

  const handleShowOnlineUsers = useCallback(() => {
    setIsOnlineUsersVisible(!isOnlineUsersVisible);
  }, [isOnlineUsersVisible]);

  const handleReportFuck = useCallback((fucker: string, fucked: string) => {
    setIsOnlineUsersVisible(false);
    socket?.emit("report-fuck", fucker, fucked);
  }, []);

  return (
    <div className="flex h-full w-full flex-col">
      <Head>
        <title>{who} - Sam Loc</title>
      </Head>

      <h2 className="m-auto mt-2">- {who} -</h2>

      <div className="m-auto flex flex-grow flex-col items-center justify-center">
        {isDashboardOnline ? (
          gameState === GAME_STATES.pausing ? (
            <p>Game Paused</p>
          ) : gameState === GAME_STATES.playing ? (
            <>
              <button onClick={handleWin} className="bg-red-400 text-8xl font-bold">
                Win 🎉
              </button>
            </>
          ) : gameState === GAME_STATES.winning ? (
            <>
              <h3>You win </h3>
              <button onClick={handleCancel}>Cancel</button>
            </>
          ) : gameState === GAME_STATES.losing ? (
            isLossSubmitted ? (
              <p>Waiting...</p>
            ) : (
              <>
                <h3>You lose</h3>
                <input type="tel" value={loss} onChange={handleLossChange} />
                <button onClick={handleSubmitLoss}>Cay</button>
              </>
            )
          ) : (
            <p>something went wrong</p>
          )
        ) : (
          <p>Game offline</p>
        )}
      </div>

      {gameState === GAME_STATES.playing && (
        <>
          <button onClick={handleShowOnlineUsers} className="mx-4 mb-0 rounded-b-none bg-green-400 text-lg font-bold">
            Chặt 🐷 zone
          </button>

          <div className="mx-4 bg-green-200">
            {isOnlineUsersVisible && (
              <>
                {onlineUsers.filter((user) => user !== who).length === 0 ? (
                  <p className="p-2 text-gray-700">No other users</p>
                ) : (
                  onlineUsers
                    .filter((user) => user !== who)
                    .map((user) => (
                      <button key={user} onClick={() => handleReportFuck(who, user)} className="bg-yellow-200">
                        {user}
                      </button>
                    ))
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Game;
