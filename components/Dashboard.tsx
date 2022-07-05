import Head from "next/head";
import { ChangeEvent, useCallback, useEffect } from "react";
import _ from "lodash";
import UsersList from "./UsersList";
import GameLog from "./GameLog";
import { useSocket } from "../contexts/socket";
import useLocalStorage from "../hooks/useLocalStorage";

type NumberObject = {
  [key: string]: number;
};

const GAME_STATES = {
  scoring: "scoring",
  pausing: "pausing",
  playing: "playing",
};

const Dashboard = () => {
  const { socket } = useSocket();

  const [onlineUsers, setOnlineUsers] = useLocalStorage<string[]>("onlineUsers", []);
  const [offlineUsers, setOfflineUsers] = useLocalStorage<string[]>("offlineUsers", []);
  const [scores, setScores] = useLocalStorage<NumberObject>("scores", {});
  const [scoreDiffs, setScoreDiffs] = useLocalStorage<NumberObject>("scoreDiffs", {});
  const [gameState, setGameState] = useLocalStorage("gameState", GAME_STATES.pausing);
  const [winner, setWinner] = useLocalStorage("winner", "");
  const [losses, setLosses] = useLocalStorage<NumberObject>("losses", {});
  const [fucks, setFucks] = useLocalStorage<string[][]>("fucks", []);
  const [numberOfPlayers, setNumberOfPlayers] = useLocalStorage("numberOfPlayers", 0);

  useEffect(() => {
    socket?.on("connect", () => {
      console.log("my socket id", socket.id);
    });
  }, []);

  useEffect(() => {
    socket?.emit("dashboard", gameState, winner, numberOfPlayers);
  }, [gameState, winner, numberOfPlayers]); // emit all updates to prevent sending the default values

  useEffect(() => {
    socket?.on("update-users", (newOnlineUsers: string[]) => {
      // update offline list
      let newOfflineUsers = [...offlineUsers];
      // online -> offline
      onlineUsers.forEach((user) => {
        if (!newOnlineUsers.includes(user)) newOfflineUsers.push(user);
      });
      // offline -> online
      newOnlineUsers.forEach((user) => {
        if (newOfflineUsers.includes(user)) newOfflineUsers = _.without(newOfflineUsers, user);
      });
      setOfflineUsers(newOfflineUsers);

      // update online list
      setOnlineUsers(newOnlineUsers);
    });

    return () => {
      socket?.off("update-users");
    };
  }, [onlineUsers, offlineUsers, scores]);

  useEffect(() => {
    socket?.on("win", (winner) => {
      setWinner(winner);
    });

    return () => {
      socket?.off("win");
    };
  }, []);

  useEffect(() => {
    socket?.on("cancel", () => {
      setGameState(GAME_STATES.playing);
      setWinner("");
      setLosses({});
    });

    return () => {
      socket?.off("cancel");
    };
  }, []);

  useEffect(() => {
    socket?.on("loss-submit", (losses: { [key: string]: number }, numberOfPlayers) => {
      if (Object.keys(losses).length === numberOfPlayers - 1 && winner !== "") {
        const newScoreDiffs = _.mapValues(losses, (loss) => (loss *= -1));
        const gain = -Object.values(newScoreDiffs).reduce((prev, current) => prev + current, 0);
        newScoreDiffs[winner] = gain;
        fucks.forEach(([fucker, fucked]) => {
          newScoreDiffs[fucker] += 20;
          newScoreDiffs[fucked] -= 20;
        });
        setScoreDiffs(newScoreDiffs);

        const newScores = { ...scores };
        Object.entries(newScoreDiffs).forEach(([user, scoreDiff]) => {
          if (!_.isFinite(newScores[user])) newScores[user] = 0;
          newScores[user] += scoreDiff;
        });
        setScores(newScores);

        setGameState(GAME_STATES.playing);
        setWinner("");
        setLosses({});
        setFucks([]);
        return;
      }

      setLosses(losses);
    });

    return () => {
      socket?.off("loss-submit");
    };
  }, [winner, scores, fucks]);

  useEffect(() => {
    socket?.on("report-fuck", (fucker: string, fucked: string) => {
      setFucks([...fucks, [fucker, fucked]]);
    });

    return () => {
      socket?.off("report-fuck");
    };
  }, [fucks]);

  useEffect(() => {
    if (winner !== "") {
      setGameState(GAME_STATES.scoring);
    }
  }, [winner]);

  const handlePause = useCallback(() => {
    setGameState(GAME_STATES.pausing);
    socket?.emit("pause");
  }, []);

  const handlePlay = useCallback(() => {
    setGameState(GAME_STATES.playing);
    setWinner("");
    setLosses({});
    socket?.emit("play");
  }, []);

  const handleResetScores = useCallback(() => {
    setGameState(GAME_STATES.playing);
    setWinner("");
    setScores(_.mapValues(scores, () => 0));
    setScoreDiffs(_.mapValues(scoreDiffs, () => 0));
    setLosses({});
    socket?.emit("reset-scores");
  }, [scores, scoreDiffs]);

  const handleKickAll = useCallback(() => {
    socket?.emit("kick-all");
  }, []);

  const handleChangeNumberOfPlayers = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setNumberOfPlayers(Number(e.target.value) || 0);
    socket?.emit("update-number-of-players", Number(e.target.value));
  }, []);

  return (
    <div className="flex w-full flex-col px-4">
      <Head>
        <title>Dashboard - Sam Loc</title>
      </Head>

      <div className="flex flex-col sm:flex-row sm:justify-center">
        <button onClick={handlePause} className={gameState === GAME_STATES.pausing ? "bg-green-400" : ""}>
          Pause
        </button>
        <button onClick={handlePlay} className={gameState === GAME_STATES.playing ? "bg-green-400" : ""}>
          Play
        </button>
        <button onClick={handleResetScores}>Reset scores</button>
        <button onClick={handleKickAll}>Kick all</button>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="flex w-full flex-grow flex-col space-y-4">
          <UsersList title="Online" users={onlineUsers} scores={scores} scoreDiffs={scoreDiffs} />
          <UsersList title="Offline" users={offlineUsers} scores={scores} scoreDiffs={scoreDiffs} />
        </div>

        <GameLog
          losses={losses}
          winner={winner}
          numberOfPlayers={numberOfPlayers}
          handleChangeNumberOfPlayers={handleChangeNumberOfPlayers}
          fucks={fucks}
          setFucks={setFucks}
        />
      </div>
    </div>
  );
};

export default Dashboard;
