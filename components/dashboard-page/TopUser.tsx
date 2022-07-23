import Image from "next/future/image";
import { useMemo } from "react";
import { GoPrimitiveDot } from "react-icons/go";
import _ from "lodash";
import ScoreDiffBadge from "../badges/ScoreDiffBadge";
import crown from "../../assets/crown.gif";

type User = {
  name: string;
  isOnline: boolean;
  score: number;
  scoreDiff: number;
};

interface TopUserProps {
  user?: User;
  position: 0 | 1 | 2;
}

const TopUser = ({ user, position }: TopUserProps) => {
  const positionProperties = useMemo(
    () => [
      {
        container: "h-52 w-52",
        border: "border-purple-500",
        background: "bg-purple-500",
      },
      {
        container: "h-40 w-40",
        border: "border-blue-500",
        background: "bg-blue-500",
      },
      {
        container: "h-40 w-40",
        border: "border-yellow-500",
        background: "bg-yellow-500",
      },
    ],
    []
  );

  return (
    <div className={`relative select-none ${position === 0 && "z-10"} ${!!user ? "opacity-100" : "opacity-50"}`}>
      {!!user && position === 0 && (
        <>
          <ScoreDiffBadge scoreDiff={user.scoreDiff} className="m-auto" />
          <Image src={crown} className="m-auto w-40" />
        </>
      )}

      <div className={`relative ${positionProperties[position].container}`}>
        <div
          className={`absolute h-full w-full rounded-full blur-xl ${
            position === 0
              ? "animate-spin bg-gradient-to-br from-red-500 via-green-500 to-blue-500 transition-transform"
              : positionProperties[position].background
          } ${!!user ? "opacity-100" : "opacity-0"}`}
        />

        <div
          className={`relative h-full w-full rounded-full border-4 bg-slate-900 p-2 ${positionProperties[position].border} `}
        >
          <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{user?.name || "-"}</h2>
          {!!user && position !== 0 && (
            <ScoreDiffBadge
              scoreDiff={user.scoreDiff}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[125%]"
            />
          )}
        </div>

        <div
          className={`absolute -bottom-6 left-1/2 flex -translate-x-1/2 items-center space-x-4 rounded-lg px-2 py-1 ${positionProperties[position].background}`}
        >
          <GoPrimitiveDot
            size={20}
            className={_.isBoolean(user?.isOnline) && user?.isOnline ? "fill-green-400" : "fill-red-400"}
          />
          <h2 className="text-slate-800">{_.isNumber(user?.score) ? user?.score : "-"}</h2>
        </div>
      </div>
    </div>
  );
};

export default TopUser;
