import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import LoadingDialog from "../dialogs/LoadingDialog";
import MassFuckDialog from "../dialogs/MassFuckDialog";
import { useSocket } from "../../contexts/socket";

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

  const [isLoading, setIsLoading] = useState(true);
  const [isDashboardOnline, setIsDashboardOnline] = useState<boolean>(false);
  const [gameState, setGameState] = useState<string>(GAME_STATES.pausing);
  const [loss, setLoss] = useState<string>("");
  const [isLossSubmitted, setIsLossSubmitted] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isOnlineUsersVisible, setIsOnlineUsersVisible] = useState<boolean>(false);
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(0);
  const [isMassFuckOptionsVisible, setIsMassFuckOptionsVisible] = useState<boolean>(false);
  const [massFuckOption, setMassFuckOption] = useState<"" | "hit" | "miss">("");

  const isShowingMassFuckDialog = useMemo(
    () => massFuckOption === "hit" || massFuckOption === "miss",
    [massFuckOption]
  );

  useEffect(() => {
    socket?.on("connect", () => {
      setIsLoading(false);
      console.log("my socket id", socket?.id);
      socket.emit("new-user", who);
      socket.emit("status");
    });
  }, [who, socket]);

  useEffect(() => {
    socket?.on("status", (isDashboardOnline, gameState, winner, losses, numberOfPlayers) => {
      setIsDashboardOnline(isDashboardOnline);
      setGameState(gameState);
      setNumberOfPlayers(numberOfPlayers);
      if (!!losses[who]) setIsLossSubmitted(true);

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
  }, [who, socket]);

  useEffect(() => {
    socket?.on("update-users", (onlineUsers) => {
      setOnlineUsers(onlineUsers);
    });

    return () => {
      socket?.off("update-users");
    };
  }, [socket]);

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
  }, [socket]);

  useEffect(() => {
    socket?.on("lose", () => {
      setGameState(GAME_STATES.losing);
      setIsLossSubmitted(false);
    });

    return () => {
      socket?.off("lose");
    };
  }, [socket]);

  useEffect(() => {
    socket?.on("cancel", () => {
      setGameState(GAME_STATES.playing);
      setLoss("");
    });

    return () => {
      socket?.off("cancel");
    };
  }, [socket]);

  useEffect(() => {
    socket?.on("kick", () => {
      router.reload();
    });

    return () => {
      socket?.off("kick");
    };
  }, [socket, router]);

  useEffect(() => {
    socket?.on("disconnect", () => {
      setIsLoading(true);
    });

    return () => {
      socket?.off("disconnect");
    };
  }, [socket]);

  const handleWin = useCallback(() => {
    setGameState(GAME_STATES.winning);
    socket?.emit("win", who);
  }, [who, socket]);

  const handleCancel = useCallback(() => {
    socket?.emit("cancel");
  }, [socket]);

  const handleLossChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLoss(e.target.value);
  }, []);

  const handleSubmitLoss = useCallback(() => {
    if (!!!Number.parseInt(loss) || Number.parseInt(loss) === 0) return;

    setLoss("");
    setIsLossSubmitted(true);
    socket?.emit("loss-submit", who, Number.parseInt(loss));
  }, [who, socket, loss]);

  const handleShowOnlineUsers = useCallback(() => {
    setIsOnlineUsersVisible(!isOnlineUsersVisible);
  }, [isOnlineUsersVisible]);

  const handleShowMassFuckOptions = useCallback(() => {
    setIsMassFuckOptionsVisible(!isMassFuckOptionsVisible);
  }, [isMassFuckOptionsVisible]);

  const handleReportFuck = useCallback(
    (fucker: string, fucked: string) => {
      setIsOnlineUsersVisible(false);
      socket?.emit("report-fuck", fucker, fucked);
    },
    [socket]
  );

  const handleClickMassFuckOption = useCallback(
    (massFuckOption: "" | "hit" | "miss") => {
      setMassFuckOption(massFuckOption);
      setIsMassFuckOptionsVisible(false);
    },
    [socket]
  );

  return (
    <div className="flex w-full flex-1 flex-col">
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
              <button onClick={handleWin} className="bg-red-400 text-8xl font-bold hover:focus:active:bg-red-700">
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
                <button disabled={loss.length === 0} onClick={handleSubmitLoss}>
                  🌶
                </button>
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
        <div className="m-auto flex w-full max-w-md items-end justify-center space-x-4">
          <div className="w-full select-none">
            <button onClick={handleShowOnlineUsers} className="m-0 w-full rounded-b-none">
              <h2>🔪🐷</h2>
            </button>
            <div className="w-full bg-slate-800">
              {isOnlineUsersVisible && (
                <div className="flex flex-wrap justify-center">
                  {onlineUsers.filter((user) => user !== who).length === 0 ? (
                    <p className="m-2 p-2">No other users</p>
                  ) : (
                    onlineUsers
                      .filter((user) => user !== who)
                      .map((user) => (
                        <button key={user} onClick={() => handleReportFuck(who, user)}>
                          {user}
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="m-0 w-full">
            <button onClick={handleShowMassFuckOptions} className="m-0 w-full rounded-b-none">
              <h2>🌪</h2>
            </button>
            <div className="flex w-full justify-center bg-slate-800">
              {isMassFuckOptionsVisible && (
                <>
                  <button onClick={() => handleClickMassFuckOption("hit")}>✅</button>
                  <button onClick={() => handleClickMassFuckOption("miss")}>❌</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <MassFuckDialog
        who={who}
        isShowingMassFuckDialog={isShowingMassFuckDialog}
        massFuckOption={massFuckOption}
        setMassFuckOption={setMassFuckOption}
        onlineUsers={onlineUsers}
        numberOfPlayers={numberOfPlayers}
      />

      <LoadingDialog isShowingConnectingDialog={isLoading} message="Getting you back to the game..." />
    </div>
  );
};

export default Game;
