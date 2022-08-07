import { Fragment, useCallback } from "react";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import { VscDebugDisconnect } from "react-icons/vsc";

interface DashboardKickedDialogProps {
  isShowingDashboardKickedDialog: boolean;
}

const DashboardKickedDialog = ({ isShowingDashboardKickedDialog }: DashboardKickedDialogProps) => {
  const router = useRouter();

  const handleReloadClick = useCallback(() => {
    router.reload();
  }, []);

  return (
    <Transition show={isShowingDashboardKickedDialog} as={Fragment}>
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
              <Dialog.Panel className="flex w-full max-w-xl flex-col items-center space-y-4 rounded-lg bg-slate-900 p-4 shadow-xl">
                <VscDebugDisconnect size={40} className="fill-red-500" />
                <p className="text-center">
                  Someone else just connected to the dashboard. Only{" "}
                  <b>
                    <u>ONE</u>
                  </b>{" "}
                  device can host the dashboard. To retake the control, simply reload this page.
                </p>
                <button onClick={handleReloadClick}>Reload</button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DashboardKickedDialog;
