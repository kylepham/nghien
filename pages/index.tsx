import type { NextPage } from "next";
import React, { useState } from "react";
import Head from "next/head";
import UserPicker from "../components/UserPicker";
import UserRegister from "../components/UserRegister";
import Game from "../components/Game";

const Home: NextPage = () => {
  const [who, setWho] = useState<String | null>(null);

  return (
    <div className="flex flex-col items-center h-screen">
      <Head>
        <title>Sam Loc - Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {who ? (
        <Game who={who} />
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
