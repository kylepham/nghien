import type { NextPage } from "next";
import Head from "next/head";
import React, { useState } from "react";
import UserPicker from "../components/UserPicker";
import UserRegister from "../components/UserRegister";
import Game from "../components/Game";
import { SocketProvider } from "../contexts/socket";

const Home: NextPage = () => {
  const [who, setWho] = useState<string | null>(null);

  return (
    <div className="flex h-screen flex-col items-center">
      <Head>
        <title>Login - Sam Loc</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {who ? (
        <SocketProvider>
          <Game who={who} />
        </SocketProvider>
      ) : (
        <>
          <UserPicker setWho={setWho} />
          {/* <UserRegister /> */}
        </>
      )}
    </div>
  );
};

export default Home;
