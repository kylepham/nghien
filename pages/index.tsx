import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/future/image";
import React, { useState } from "react";
import { TbBrandGithub, TbChartCandle } from "react-icons/tb";
import UserPicker from "../components/home-page/UserPicker";
import UserRegister from "../components/home-page/UserRegister";
import Game from "../components/home-page/Game";
import logo from "../assets/logo.png";
import { SocketProvider } from "../contexts/socket";

const Home: NextPage = () => {
  const [who, setWho] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Head>
        <title>Login - Sam Loc</title>
      </Head>

      {who ? (
        <SocketProvider>
          <Game who={who} />
        </SocketProvider>
      ) : (
        <>
          <Image src={logo} width={100} height={100} className="my-6 rounded-full border-2 border-slate-700 p-1" />
          <div className="flex w-full max-w-sm flex-wrap justify-center">
            <a href="/dashboard" target="_blank" rel="noreferrer">
              <button>
                Dashboard <TbChartCandle size={20} className="ml-4" />
              </button>
            </a>
            <a href="https://github.com/kylepham/nghien" target="_blank" rel="noreferrer">
              <button>
                GitHub
                <TbBrandGithub size={20} className="ml-4" />
              </button>
            </a>
          </div>

          <UserPicker setWho={setWho} />
          <UserRegister />
        </>
      )}
    </div>
  );
};

export default Home;
