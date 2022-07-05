import Head from "next/head";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { doc, increment, updateDoc } from "firebase/firestore";
import io from "socket.io-client";
import { AiOutlineClear } from "react-icons/ai";
import { db } from "../firebaseConfig";
import { Loser, User } from "../types";
import { SocketProvider } from "../contexts/socket";
import Dashboard from "../components/Dashboard";

// let socket = io("https://arcane-chamber-60613.herokuapp.com/");

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

const DashboardPage = () => {
  return (
    <SocketProvider>
      <Dashboard />
    </SocketProvider>
  );
};

export default DashboardPage;
