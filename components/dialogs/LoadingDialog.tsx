import Image from "next/future/image";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import loading from "../../assets/loading.gif";

interface LoadingDialogProps {
  isShowingConnectingDialog: boolean;
  message: string;
}

const LoadingDialog = ({ isShowingConnectingDialog, message }: LoadingDialogProps) => {
  return (
    <Transition show={isShowingConnectingDialog} as={Fragment}>
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
              <Image src={loading} alt="Loading..." className="h-52 w-52" />
              <p>{message}</p>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LoadingDialog;
