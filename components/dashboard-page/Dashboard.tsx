import Head from "next/head";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { GoPrimitiveDot } from "react-icons/go";
import _ from "lodash";
import Scoreboard from "./Scoreboard";
import GameLogDialog from "../dialogs/GameLogDialog";
import LoadingDialog from "../dialogs/LoadingDialog";
import { useSocket } from "../../contexts/socket";
import useLocalStorage from "../../hooks/useLocalStorage";

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

  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useLocalStorage<string[]>("onlineUsers", []);
  const [offlineUsers, setOfflineUsers] = useLocalStorage<string[]>("offlineUsers", []);
  const [scores, setScores] = useLocalStorage<NumberObject>("scores", {});
  const [scoreDiffs, setScoreDiffs] = useLocalStorage<NumberObject>("scoreDiffs", {});
  const [gameState, setGameState] = useLocalStorage("gameState", GAME_STATES.pausing);
  const [winner, setWinner] = useLocalStorage("winner", "");
  const [losses, setLosses] = useLocalStorage<NumberObject>("losses", {});
  const [fucks, setFucks] = useLocalStorage<string[][]>("fucks", []);
  const [numberOfPlayers, setNumberOfPlayers] = useLocalStorage("numberOfPlayers", 5);
  const [numberOfRounds, setNumberOfRounds] = useLocalStorage("numberOfRounds", 0);

  const allUsers = useMemo(() => {
    const result = [
      ...onlineUsers
        .map((user) => ({
          name: user,
          isOnline: true,
          score: scores[user] ?? 0,
          scoreDiff: scoreDiffs[user] ?? 0,
        }))
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
      ...offlineUsers
        .map((user) => ({
          name: user,
          isOnline: false,
          score: scores[user] ?? 0,
          scoreDiff: scoreDiffs[user] ?? 0,
        }))
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    ];

    return result;
  }, [onlineUsers, offlineUsers, scores, scoreDiffs]);

  const numberOfPlayersOptions = useMemo(() => [2, 3, 4, 5], []);

  const isShowingGameLogDialog = useMemo(
    () => winner.length !== 0 || Object.keys(losses).length !== 0 || fucks.length !== 0,
    [winner, losses, fucks]
  );

  useEffect(() => {
    socket?.on("connect", () => {
      setIsLoading(false);
      console.log("my socket id", socket.id);
    });
  }, [socket]);

  useEffect(() => {
    socket?.emit("dashboard", gameState, winner, numberOfPlayers);
  }, [socket, isLoading, gameState, winner, numberOfPlayers]); // emit all updates to prevent sending the default values

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
  }, [socket, onlineUsers, offlineUsers, scores]);

  useEffect(() => {
    socket?.on("win", (winner) => {
      setWinner(winner);
    });

    return () => {
      socket?.off("win");
    };
  }, [socket]);

  useEffect(() => {
    socket?.on("cancel", () => {
      setGameState(GAME_STATES.playing);
      setWinner("");
      setLosses({});
    });

    return () => {
      socket?.off("cancel");
    };
  }, [socket]);

  useEffect(() => {
    socket?.on("loss-submit", (losses: NumberObject, numberOfPlayers) => {
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
        setNumberOfRounds(numberOfRounds + 1);
        return;
      }

      setLosses(losses);
    });

    return () => {
      socket?.off("loss-submit");
    };
  }, [socket, winner, scores, fucks, numberOfRounds]);

  useEffect(() => {
    socket?.on("report-fuck", (fucker: string, fucked: string) => {
      setFucks([...fucks, [fucker, fucked]]);
    });

    return () => {
      socket?.off("report-fuck");
    };
  }, [socket, fucks]);

  useEffect(() => {
    socket?.on("report-mass-fuck", (massFuckOption: string, fucker: string, fuckeds: string[]) => {
      let newScoreDiffs: NumberObject = { [fucker]: fuckeds.length * 20 };
      fuckeds.forEach((fucked) => {
        if (!_.isFinite(newScoreDiffs[fucked])) newScoreDiffs[fucked] = 0;
        newScoreDiffs[fucked] -= 20;
      });
      if (massFuckOption === "miss") newScoreDiffs = _.mapValues(newScoreDiffs, (scoreDiff) => (scoreDiff *= -1));
      setScoreDiffs(newScoreDiffs);

      const newScores = { ...scores };
      Object.entries(newScoreDiffs).forEach(([user, scoreDiff]) => {
        if (!_.isFinite(newScores[user])) newScores[user] = 0;
        newScores[user] += scoreDiff;
      });
      setScores(newScores);

      setNumberOfRounds(numberOfRounds + 1);
    });

    return () => {
      socket?.off("report-mass-fuck");
    };
  }, [socket, scores, numberOfRounds]);

  useEffect(() => {
    socket?.on("disconnect", () => {
      setIsLoading(true);
    });

    return () => {
      socket?.off("disconnect");
    };
  }, [socket]);

  useEffect(() => {
    if (winner !== "") {
      setGameState(GAME_STATES.scoring);
    }
  }, [socket, winner]);

  const handlePause = useCallback(() => {
    setGameState(GAME_STATES.pausing);
    socket?.emit("pause");
  }, [socket]);

  const handlePlay = useCallback(() => {
    setGameState(GAME_STATES.playing);
    setWinner("");
    setLosses({});
    socket?.emit("play");
  }, [socket]);

  const handleResetScores = useCallback(() => {
    setGameState(GAME_STATES.playing);
    setWinner("");
    setScores(_.mapValues(scores, () => 0));
    setScoreDiffs(_.mapValues(scoreDiffs, () => 0));
    setLosses({});
    setNumberOfRounds(0);
  }, [socket, scores, scoreDiffs]);

  const handleKickAll = useCallback(() => {
    setOnlineUsers([]);
    setOfflineUsers([]);
    setScores({});
    setScoreDiffs({});
    setGameState(GAME_STATES.playing);
    setWinner("");
    setLosses({});
    setNumberOfRounds(0);

    socket?.emit("kick-all");
  }, [socket]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <Head>
        <title>Dashboard - Sam Loc</title>
      </Head>

      <div className="flex w-full flex-col sm:flex-row sm:justify-center">
        <button onClick={handlePause} className={gameState === GAME_STATES.pausing ? "bg-blue-500" : ""}>
          Pause
        </button>
        <button onClick={handlePlay} className={gameState === GAME_STATES.playing ? "bg-blue-500" : ""}>
          Play
        </button>
        <button onClick={handleResetScores}>Reset scores</button>
        <button onClick={handleKickAll}>Kick all</button>
        <Listbox value={numberOfPlayers} onChange={setNumberOfPlayers}>
          <div className="relative m-2">
            <div className="absolute z-0 h-full w-full bg-blue-700 blur-md" />
            <div className="relative">
              <Listbox.Button className="m-0 w-full bg-blue-700">Number of players: {numberOfPlayers}</Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute right-0 top-full mt-2 select-none overflow-auto rounded-md bg-slate-700 py-1 shadow-lg focus:outline-none">
                  {numberOfPlayersOptions.map((option, optionId) => (
                    <Listbox.Option
                      key={optionId}
                      className={({ active }) =>
                        `flex items-center justify-between space-x-4 px-2 py-2 ${active ? "bg-blue-500" : ""}`
                      }
                      value={option}
                    >
                      {({ selected }) => (
                        <>
                          {selected ? <GoPrimitiveDot size={20} className="fill-yellow-400" /> : <div />}
                          <p>{option}</p>
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </div>
        </Listbox>
        <button>Rounds: {numberOfRounds}</button>
      </div>

      <Scoreboard allUsers={allUsers} />

      <GameLogDialog
        isShowingGameLogDialog={isShowingGameLogDialog}
        winner={winner}
        losses={losses}
        fucks={fucks}
        setFucks={setFucks}
      />

      <LoadingDialog isShowingConnectingDialog={isLoading} message="Reconnecting the dashboard..." />
    </div>
  );
};

export default Dashboard;
