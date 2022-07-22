import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

interface UserPickerProps {
  setWho: Dispatch<SetStateAction<string | null>>;
}
const UserPicker = ({ setWho }: UserPickerProps) => {
  const [existingUsers, setExistingUsers] = useState<Array<string>>([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, "/users"));

    const usersList: string[] = [];
    querySnapshot.forEach((doc) => {
      usersList.push(doc.id);
    });
    setExistingUsers(usersList);
  }, []);

  return (
    <div className="m-8 flex w-80 flex-col items-center rounded border border-slate-200 p-8">
      <p className="text-2xl font-bold">Mày là thằng nào?</p>
      <div className="flex flex-wrap justify-center">
        {existingUsers.length > 0 ? (
          existingUsers.map((user, index) => {
            return (
              <button
                className="m-2 rounded p-2"
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
