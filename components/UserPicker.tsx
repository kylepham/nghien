import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface UserPickerProps {
  setWho: Dispatch<SetStateAction<string | null>>;
}
const UserPicker = ({ setWho }: UserPickerProps) => {
  const [existingUsers, setExistingUsers] = useState<Array<string>>([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = useCallback(async () => {
    const unsubscribe = onSnapshot(collection(db, "/users"), (docs) => {
      const usersList: string[] = [];
      docs.forEach((doc) => usersList.push(doc.id));
      setExistingUsers(usersList);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col w-80 items-center border border-black p-8 m-8 rounded">
      <p className="font-bold text-2xl">Mày là thằng nào?</p>
      <div className="flex flex-wrap justify-center">
        {existingUsers.length > 0 ? (
          existingUsers.map((user, index) => {
            return (
              <button
                className="bg-green-200 rounded p-2 m-2 text-gray-700 hover:bg-green-300"
                key={index}
                onClick={() => {
                  setWho(user);
                }}
              >
                {user}
              </button>
            );
          })
        ) : (
          <p className="text-gray-400">No registered users in DB :(</p>
        )}
      </div>
    </div>
  );
};

export default UserPicker;
