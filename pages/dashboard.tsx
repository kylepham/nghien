import Head from "next/head";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { doc, increment, updateDoc } from "firebase/firestore";
import io from "socket.io-client";
import { AiOutlineClear } from "react-icons/ai";
import { db } from "../firebaseConfig";
import { Loser, User } from "../types";

let socket = io("https://arcane-chamber-60613.herokuapp.com/");

const DASHBOARD_STATES = {
  pausing: "pausing",
  playing: "playing",
  winning: "winning",
};

interface UsersListProps {
  lossChanges: {
    [key: string]: number;
  };
  title: string;
  users: any[];
}

interface GameLogProps {
  losers: Loser[];
  numberOfPlayers: number;
  getFucked: string[];
  winner: string;
  setWinner: Dispatch<SetStateAction<string>>;
  setLosers: Dispatch<SetStateAction<Loser[]>>;
}

const UsersList = ({ lossChanges, title, users }: UsersListProps) => {
  return (
    <div className="bg-yellow-200 rounded-md p-4 space-y-4 select-none">
      <h1 className="underline">{title}</h1>
      {users.length === 0 && <p className="text-gray-700">No users.</p>}
      <div className="space-y-4">
        {users.map((user, index) => {
          return (
            <div key={index} className="flex justify-between bg-white rounded-sm p-2 hover:bg-gray-100">
              <h2 className="font-bold">{user.name}</h2>
              <div className="flex items-end space-x-1">
                <h2>{user.score}</h2>
                {!isNaN(lossChanges[user.name]) && (
                  <h2 className={`${lossChanges[user.name] >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ({lossChanges[user.name]})
                  </h2>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GameLog = ({ losers, numberOfPlayers, getFucked, winner, setWinner, setLosers }: GameLogProps) => {
  return (
    <div className="bg-cyan-200 w-full rounded-md p-4 space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <h1 className="underline">Log</h1>
          <button>
            <AiOutlineClear size={40} color="#EF5656" />
          </button>
        </div>
        <h3 className="bg-green-400 p-2 rounded-md">{numberOfPlayers}</h3>
      </div>
      {!!winner && <h2 className="text-red-300">Winner: {winner}</h2>}
      {getFucked.map((user, index) =>
        index % 2 === 0 ? (
          <div key={index} className="flex justify-evenly bg-white rounded-sm p-2 hover:bg-gray-100">
            <h3 key={user}>{getFucked[index]}</h3>
            <h3>🍆🍑</h3>
            <h3>{getFucked[index + 1]}</h3>
          </div>
        ) : null
      )}
      {!!winner && (
        <div>
          <h3>
            {losers.length} / {numberOfPlayers - 1}
          </h3>
          {losers.map((loser, index) => {
            return (
              <h3 key={index}>
                {loser.name}: {loser.loss}
              </h3>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const router = useRouter();
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [offlineUsers, setOfflineUsers] = useState<User[]>([]);
  const [id, setId] = useState([]);
  const [dashboardState, setDashboardState] = useState(DASHBOARD_STATES.pausing);
  const [numberOfPlayers, setNumberOfPlayers] = useState(0);
  const [winner, setWinner] = useState("");
  const [losers, setLosers] = useState<Loser[]>([]);
  const [lossChanges, setLossChanges] = useState({});
  const [getFucked, setGetFucked] = useState<string[]>([]);

  useEffect(() => {
    // (async () => {
    //   await fetch("http://localhost:6969");
    // })();
    socket = io("https://arcane-chamber-60613.herokuapp.com/", {
      transports: ["websocket"],
      upgrade: false,
    });
    socketInitializer();

    return () => {
      socket.emit("delete-allsockets");
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (losers.length === numberOfPlayers - 1 && numberOfPlayers !== 1) {
      const userScores: { [key: string]: number } = {};
      let sumLosers = losers.reduce((prev, current) => prev + current.loss, 0);
      userScores[winner] = sumLosers;
      for (const loser of losers) userScores[loser.name] = -loser.loss;

      for (let i = 0; i < getFucked.length; i++)
        if (i % 2 === 0) userScores[getFucked[i]] += 20; // fucker
        else userScores[getFucked[i]] -= 20; // fucked

      // update in firestore
      Object.keys(userScores).map(
        async (name) => await updateDoc(doc(db, "users", name), { score: increment(userScores[name]) })
      );

      setLossChanges(userScores);

      setOnlineUsers(
        onlineUsers.map((user) => {
          if (!userScores[user.name]) return user;
          return { ...user, score: user.score + userScores[user.name] };
        })
      );

      setWinner("");
      setLosers([]);
      setGetFucked([]);
      setDashboardState(DASHBOARD_STATES.playing);
      socket.emit("dashboard-newgame");
    }
  }, [losers, numberOfPlayers, winner, getFucked]);

  useEffect(() => {
    if (dashboardState === DASHBOARD_STATES.pausing) setNumberOfPlayers(onlineUsers.length);
  }, [dashboardState, onlineUsers]);

  useEffect(() => {
    if (onlineUsers.length <= 1) {
      setWinner("");
      setLosers([]);
      setGetFucked([]);
      setDashboardState(DASHBOARD_STATES.pausing);
      if (socket) socket.emit("dashboard-statechange", DASHBOARD_STATES.pausing);
    }
  }, [onlineUsers]);

  const socketInitializer = useCallback(async () => {
    socket.on("connect", () => {
      console.log("connected");
      socket.emit("dashboard-self");
    });

    socket.on("dashboard-self", (id) => {
      console.log(id);
      setId(id);
      setDashboardState((prevDashboardState) => {
        socket.emit("online", "", false, "", "", prevDashboardState);
        return prevDashboardState;
      }); // notice everyone about online status and which dashboard state
    });

    socket.on("status", (from) => {
      setDashboardState((prevDashboardState) => {
        setWinner((prevWinner) => {
          setGetFucked((prevGetFucked) => {
            setLosers((prevLosers) => {
              const fucker = prevGetFucked.length % 2 === 1 ? prevGetFucked[prevGetFucked.length - 1] : "";
              socket.emit(
                "online",
                from,
                prevLosers.some((loser) => loser.name === from),
                prevWinner,
                fucker,
                prevDashboardState
              );

              return prevLosers;
            });
            return prevGetFucked;
          });
          return prevWinner;
        });
        return prevDashboardState;
      });
    });

    socket.on("who-i-am", (name, socketId) => {
      setOnlineUsers((prevOnlineUsers) => {
        const indexOnline = prevOnlineUsers.findIndex((user) => user.name === name);
        if (indexOnline !== -1) {
          if (prevOnlineUsers[indexOnline].socketId === socketId) return prevOnlineUsers;

          console.log(name, indexOnline);
          socket.emit("kick", prevOnlineUsers[indexOnline].socketId);
          const prevOnlineUsersClone = JSON.parse(JSON.stringify(prevOnlineUsers));
          prevOnlineUsersClone[indexOnline].socketId = socketId;
          return prevOnlineUsersClone;
        }

        let offlineUser: User | undefined;

        setOfflineUsers((prevOfflineUsers) => {
          offlineUser = prevOfflineUsers.find((user) => user.name === name);
          return prevOfflineUsers.filter((user) => user.name !== name);
        });

        if (!offlineUser) return [...prevOnlineUsers, { name, socketId, score: 0 }];

        return [...prevOnlineUsers, { name, socketId, score: offlineUser.score }];
      });
    });

    socket.on("dashboard-win", (name) => {
      setOnlineUsers((prevOnlineUsers) => {
        if (prevOnlineUsers.length !== 1) {
          setWinner(name);
          setDashboardState(DASHBOARD_STATES.winning);
        }
        return prevOnlineUsers;
      });
      setLosers([]);
    });

    socket.on("dashboard-lose", (name, loss) => {
      setLosers((prevLosers) => [...prevLosers, { name, loss }]);
    });

    socket.on("dashboard-fucks", (name) => {
      setGetFucked((prevGetFucked) => {
        // this prevents fucker clicks twice or more and append to the getFucked array
        if (prevGetFucked.length % 2 === 1 && prevGetFucked[prevGetFucked.length - 1] === name) return prevGetFucked;
        return [...prevGetFucked, name];
      });
    });

    socket.on("dismiss", () => {
      setWinner("");
      setLosers([]);
      setDashboardState(DASHBOARD_STATES.playing);
      setGetFucked((prevGetFucked) => {
        if (prevGetFucked.length % 2 === 1) prevGetFucked.pop();
        return [...prevGetFucked];
      });
    });

    socket.on("user-leave", (socketId) => {
      setOnlineUsers((prevOnlineUsers) => {
        const leftUser = prevOnlineUsers.filter((user) => user.socketId === socketId)[0];
        if (!leftUser) return prevOnlineUsers;

        setOfflineUsers((prevOfflineUsers) => [...prevOfflineUsers, leftUser]);
        return prevOnlineUsers.filter((user) => user.socketId !== socketId);
      });
    });

    socket.on("delete-allsockets", () => {
      router.replace("/").then(() => router.reload());
    });
  }, []);

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <Head>
        <title>Dashboard</title>
      </Head>
      <div
        className={`bg-green-200 rounded-sm px-4 py-1 select-none ${
          dashboardState === DASHBOARD_STATES.pausing ? "visible" : "invisible"
        }`}
      >
        <p>Game paused!</p>
      </div>

      <div className="flex space-x-4">
        <button
          className="p-1 rounded-sm hover:bg-gray-400 transition-colors duration-300"
          onClick={() => {
            socket.emit("delete-allsockets");
          }}
        >
          CHIM CÚT
        </button>
        <button
          className={`${
            dashboardState === DASHBOARD_STATES.pausing && "bg-gray-200 font-bold"
          } p-1 rounded-sm hover:bg-gray-400 transition-colors duration-300`}
          onClick={() => {
            setDashboardState(DASHBOARD_STATES.pausing);
            socket.emit("dashboard-statechange", DASHBOARD_STATES.pausing);
          }}
        >
          PAUSE
        </button>
        <button
          className={`${
            dashboardState === DASHBOARD_STATES.playing && "bg-gray-200 font-bold"
          } p-1 rounded-sm hover:bg-gray-400 transition-colors duration-300`}
          onClick={() => {
            setDashboardState(DASHBOARD_STATES.playing);
            socket.emit("dashboard-statechange", DASHBOARD_STATES.playing);
          }}
        >
          PLAY
        </button>
        <button
          className="p-1 rounded-sm hover:bg-gray-400 transition-colors duration-300"
          onClick={() => {
            socket.connect();
          }}
        >
          RECONNECT
        </button>
      </div>

      <div className="flex flex-col w-full space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="w-full space-y-4">
          <UsersList
            title="Online"
            users={onlineUsers.sort((user1, user2) => user2.score - user1.score)}
            lossChanges={lossChanges}
          />
          <UsersList
            title="Offline"
            users={offlineUsers.sort((user1, user2) => user2.score - user1.score)}
            lossChanges={lossChanges}
          />
        </div>
        <GameLog
          winner={winner}
          getFucked={getFucked}
          losers={losers}
          numberOfPlayers={numberOfPlayers}
          setWinner={setWinner}
          setLosers={setLosers}
        />
      </div>
    </div>
  );
};

export default Dashboard;
