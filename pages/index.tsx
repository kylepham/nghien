import type { NextPage } from "next";
import Head from "next/head";
import React, { useState } from "react";
import UserPicker from "../components/home-page/UserPicker";
import Game from "../components/home-page/Game";
import { SocketProvider } from "../contexts/socket";
import UserRegister from "../components/home-page/UserRegister";

const Home: NextPage = () => {
  const [who, setWho] = useState<string | null>(null);

  return (
    <div className="flex h-screen flex-col items-center justify-center px-4">
      <Head>
        <title>Login - Sam Loc</title>
      </Head>

      {who ? (
        <SocketProvider>
          <Game who={who} />
        </SocketProvider>
      ) : (
        <>
          <UserPicker setWho={setWho} />
          <UserRegister />
        </>
      )}
    </div>
  );
};

export default Home;
