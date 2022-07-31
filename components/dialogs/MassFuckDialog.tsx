import { Dispatch, Fragment, SetStateAction, useCallback, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { BiCheck } from "react-icons/bi";
import { useSocket } from "../../contexts/socket";

interface MassFuckDialogProps {
  who: string;
  isShowingMassFuckDialog: boolean;
  massFuckOption: "" | "hit" | "miss";
  setMassFuckOption: Dispatch<SetStateAction<"" | "hit" | "miss">>;
  onlineUsers: string[];
  numberOfPlayers: number;
}

const MassFuckDialog = ({
  who,
  isShowingMassFuckDialog,
  massFuckOption,
  setMassFuckOption,
  onlineUsers,
  numberOfPlayers,
}: MassFuckDialogProps) => {
  const { socket } = useSocket();

  const [fuckeds, setFuckeds] = useState<string[]>([]);

  const handleChooseUser = useCallback(
    (user: string) => {
      if (fuckeds.includes(user)) setFuckeds(fuckeds.filter((fuckedUser) => fuckedUser !== user));
      else setFuckeds([...fuckeds, user]);
    },
    [fuckeds]
  );

  const handleReportMassFuck = useCallback(() => {
    setMassFuckOption("");
    socket?.emit("report-mass-fuck", massFuckOption, who, fuckeds);
    setFuckeds([]);
  }, [fuckeds]);

  const handleCloseMassFuckDialog = useCallback(() => {
    setMassFuckOption("");
    setFuckeds([]);
  }, []);

  return (
    <Transition show={isShowingMassFuckDialog} as={Fragment}>
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
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="flex min-h-full flex-col items-center justify-center p-4">
              <Dialog.Panel className="flex w-full max-w-xl flex-col rounded-lg bg-slate-900 p-2 shadow-xl">
                <div className="flex w-full items-center justify-between">
                  <h2 className="p-2">{massFuckOption === "hit" ? "🤩🌪" : massFuckOption === "miss" ? "🤡🌪" : ""}</h2>
                  {fuckeds.length < numberOfPlayers - 1 && (
                    <p className="p-2 text-slate-500">Choose {numberOfPlayers - fuckeds.length - 1} more players</p>
                  )}
                </div>
                <div className="flex w-full flex-wrap">
                  {onlineUsers.filter((user) => user !== who).length === 0 ? (
                    <p className="m-2 p-2">No other users</p>
                  ) : (
                    onlineUsers
                      .filter((user) => user !== who)
                      .map((user) => (
                        <button
                          disabled={fuckeds.length === numberOfPlayers - 1 && !fuckeds.includes(user)}
                          key={user}
                          onClick={() => handleChooseUser(user)}
                          className={`flex w-fit items-center space-x-4 ${fuckeds.includes(user) ? "bg-blue-500" : ""}`}
                        >
                          <p>{user}</p>
                          {fuckeds.includes(user) && <BiCheck size={20} />}
                        </button>
                      ))
                  )}
                </div>
              </Dialog.Panel>

              <div className="flex w-full max-w-xl justify-end">
                <button
                  disabled={fuckeds.length < numberOfPlayers - 1}
                  onClick={handleReportMassFuck}
                  className="bg-blue-500"
                >
                  Submit
                </button>
                <button onClick={handleCloseMassFuckDialog} className="mr-0 bg-slate-900">
                  Close
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MassFuckDialog;
