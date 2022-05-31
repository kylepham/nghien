import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";
import Head from "next/head";

let socket;

const Home: NextPage = () => {
  const [users, setUsers] = useState<Array<String>>([]);

  useEffect(() => {
    socketInitializer();
  }, []);

  const socketInitializer = useCallback(async () => {
    await fetch("http://150.136.63.106:6969");
    socket = io("http://150.136.63.106:6969/");

    // socket.emit("new-user");

    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("user-join", (users) => {
      setUsers(users);
    });

    socket.on("user-leave", (user) => {
      setUsers((prevUsers) => prevUsers.filter((userId) => userId !== user));
    });
  }, []);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>{JSON.stringify(users)}</h1>
      <button
        onClick={() => {
          socket.emit("click");
        }}
      >
        sf
      </button>
    </div>
  );
};

export default Home;
