import { Dispatch, Fragment, SetStateAction, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface GameLogDialogProps {
  isShowingGameLogDialog: boolean;
  winner: string;
  losses: { [key: string]: number };
  fucks: string[][];
  setFucks: Dispatch<SetStateAction<string[][]>>;
}

const GameLogDialog = ({ isShowingGameLogDialog, winner, losses, fucks, setFucks }: GameLogDialogProps) => {
  const handleRemoveFuck = useCallback(
    (index: number) => {
      fucks.splice(index, 1);
      setFucks([...fucks]);
    },
    [fucks]
  );

  return (
    <Transition show={isShowingGameLogDialog} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-90" />
        </Transition.Child>

        <div className="fixed inset-0 select-none overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="flex w-full max-w-xl flex-col space-y-4 rounded-lg bg-slate-900 p-4 shadow-xl">
                {!!winner && (
                  <div className="w-full rounded-lg bg-slate-800 p-4 text-yellow-400">
                    <h1 className="m-auto w-fit text-center">{winner.toUpperCase()} wins</h1>
                  </div>
                )}

                {fucks.length !== 0 && (
                  <div className="w-full rounded-lg bg-slate-800 p-4 text-yellow-400">
                    {fucks.map(([fucker, fucked], index) => (
                      <div key={index} className="flex items-center justify-between rounded-sm">
                        <h1>{fucker}</h1>
                        <h1>🍆🍑</h1>
                        <h1>{fucked}</h1>
                        <button onClick={() => handleRemoveFuck(index)} className="bg-transparent p-2 text-lg">
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {Object.keys(losses).length !== 0 && (
                  <div className="w-full space-y-4 rounded-lg bg-slate-800 p-4 text-yellow-400">
                    {Object.entries(losses).map(([loser, loss]) => (
                      <h1 key={loser} className="m-auto w-fit">
                        {loser}: -{loss}
                      </h1>
                    ))}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GameLogDialog;
