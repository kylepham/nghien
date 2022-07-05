import _ from "lodash";
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { BiCheck } from "react-icons/bi";

interface GameLogProps {
  losses: { [key: string]: number };
  winner: string;
  numberOfPlayers: number;
  handleChangeNumberOfPlayers: (e: ChangeEvent<HTMLInputElement>) => void;
  fucks: string[][];
  setFucks: Dispatch<SetStateAction<string[][]>>;
}

const GameLog = ({ losses, winner, numberOfPlayers, handleChangeNumberOfPlayers, fucks, setFucks }: GameLogProps) => {
  const [isEditingNumberOfPlayers, setIsEditingNumberOfPlayers] = useState<boolean>(false);

  const handleRemoveFuck = useCallback(
    (index: number) => {
      fucks.splice(index, 1);
      setFucks([...fucks]);
    },
    [fucks]
  );

  const handleEditNumberOfPlayers = useCallback(() => {
    setIsEditingNumberOfPlayers(!isEditingNumberOfPlayers);
  }, [isEditingNumberOfPlayers]);

  return (
    <div className="w-full select-none space-y-4 rounded-md bg-cyan-200 p-4">
      <div className="flex h-fit w-full justify-between">
        <h1 className="underline">Log</h1>
        <div className="flex space-x-4">
          <input
            disabled={!isEditingNumberOfPlayers}
            value={numberOfPlayers}
            onChange={handleChangeNumberOfPlayers}
            className="m-0 h-full w-16 border-none p-1 text-2xl font-semibold disabled:bg-gray-400 disabled:text-gray-700"
          />
          <button onClick={handleEditNumberOfPlayers} className="m-0 bg-transparent hover:bg-cyan-400">
            {isEditingNumberOfPlayers ? <BiCheck size={30} /> : <AiOutlineEdit size={30} />}
          </button>
        </div>
      </div>

      {!!winner && <h2 className="text-red-300">Winner: {winner}</h2>}

      {fucks.map(([fucker, fucked], index) => (
        <div key={index} className="flex items-center justify-evenly rounded-sm bg-white p-2 hover:bg-gray-100">
          <h2>{fucker}</h2>
          <h2>🍆🍑</h2>
          <h2>{fucked}</h2>
          <button onClick={() => handleRemoveFuck(index)} className="bg-transparent p-2 text-lg hover:bg-gray-200">
            ❌
          </button>
        </div>
      ))}

      {!!winner && (
        <div>
          {Object.entries(losses).map(([loser, loss]) => (
            <h3 key={loser}>
              {loser}: -{loss}
            </h3>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameLog;
