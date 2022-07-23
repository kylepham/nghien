import { useMemo } from "react";
import { GoPrimitiveDot } from "react-icons/go";
import ScoreDiffBadge from "../badges/ScoreDiffBadge";
import TopUser from "./TopUser";

type AllUsersType = {
  name: string;
  isOnline: boolean;
  score: number;
  scoreDiff: number;
};

interface ScoreboardProps {
  allUsers: AllUsersType[];
}

const Scoreboard = ({ allUsers }: ScoreboardProps) => {
  const remainingUsers = useMemo(() => [...allUsers].splice(3), [allUsers]);

  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center space-y-16">
      <div className="flex w-full flex-col items-center">
        <TopUser user={allUsers[0]} position={0} />
        <div className="flex w-full justify-between">
          <TopUser user={allUsers[1]} position={1} />
          <TopUser user={allUsers[2]} position={2} />
        </div>
      </div>

      {remainingUsers.length > 0 && (
        <div className="flex w-full select-none flex-col items-center rounded-lg bg-slate-800 p-2">
          {remainingUsers.map((user) => (
            <div key={user.name} className="flex w-full justify-between rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <GoPrimitiveDot size={20} className={user.isOnline ? "fill-green-400" : "fill-red-400"} />
                <h2>{user.name}</h2>
                <ScoreDiffBadge scoreDiff={user.scoreDiff} className="border px-2" />
              </div>
              <h2>{user.score}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Scoreboard;
