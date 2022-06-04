import { doc, increment, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";
import { db } from "../firebaseConfig";

let socket;

enum DashboardStates {
  DASHBOARD,
  SOMEONE_WINS,
}

const Dashboard = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [id, setId] = useState([]);
  const [dashboardState, setDashboardState] = useState(DashboardStates.DASHBOARD);
  const [winner, setWinner] = useState("");
  const [losers, setLosers] = useState([]);
  const [getFucked, setGetFucked] = useState([]);

  useEffect(() => {
    socketInitializer();
  }, []);

  useEffect(() => {
    if (losers.length === users.length - 1) {
      const userScores = {};
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

      setUsers(
        users.map((user) => {
          if (!userScores[user.name]) return user;
          return { ...user, score: user.score + userScores[user.name] };
        })
      );

      setLosers([]);
      setGetFucked([]);
      setDashboardState(DashboardStates.DASHBOARD);
      socket.emit("dashboard-newgame");
    }
  }, [losers]);

  // console.log(getFucked);
  console.log("users", users);
  // console.log("losers", losers);

  const socketInitializer = useCallback(async () => {
    await fetch("https://arcane-chamber-60613.herokuapp.com/");
    socket = io("https://arcane-chamber-60613.herokuapp.com/");

    // socket.emit("new-user");

    socket.on("connect", () => {
      console.log("connected");
      socket.emit("dashboard-self");
    });

    socket.on("dashboard-self", (id) => {
      console.log(id);
      setId(id);
      socket.emit("online", id); // notice everyone about online status
    });

    socket.on("status", () => {
      setId((id) => {
        socket.emit("online", id);
        return id;
      });
    });

    socket.on("who-i-am", (name, socketId) => {
      setUsers((prevUsers) => {
        if (prevUsers.some((user) => user.name === name && user.socketId !== socketId)) {
          socket.emit("kick", socketId);
          return prevUsers;
        } else if (prevUsers.some((user) => user.name === name && user.socketId === socketId)) return prevUsers;
        return [...prevUsers, { name, socketId, score: 0 }];
      });
    });

    socket.on("dashboard-win", (name) => {
      setWinner(name);
      setDashboardState(DashboardStates.SOMEONE_WINS);
    });

    socket.on("dashboard-lose", (name, loss) => {
      setLosers((prevLosers) => [...prevLosers, { name, loss }]);
    });

    socket.on("dashboard-fucks", (name) => {
      setUsers((prevUsers) => {
        setGetFucked((prevGetFucked) => {
          // this prevents fucker clicks twice or more and append to the getFucked array
          if (prevGetFucked.length % 2 === 1 && prevGetFucked[prevGetFucked.length - 1] === name) return prevGetFucked;

          return [...prevGetFucked, name];
        });
        return prevUsers;
      });
    });

    socket.on("user-leave", (socketId) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user.socketId !== socketId));
    });

    socket.on("delete-allsockets", () => {
      router.replace("/").then(() => router.reload());
    });
  }, []);

  return (
    <div>
      <button
        onClick={() => {
          socket.emit("delete-allsockets", id);
        }}
      >
        Kick everyone
      </button>

      {dashboardState === DashboardStates.DASHBOARD ? (
        users
          .sort((user1, user2) => user2.score - user1.score)
          .map((user) => {
            return (
              <div key={user.socketId}>
                {user.name}: {user.score}
              </div>
            );
          })
      ) : (
        <p>
          {losers.length}/{users.length - 1}
        </p>
      )}
    </div>
  );
};

export default Dashboard;
