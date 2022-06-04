import { doc, setDoc } from "firebase/firestore";
import { useCallback, useState } from "react";
import { db } from "../firebaseConfig";

const UserRegister = () => {
  const [name, setName] = useState("");
  const registerUser = useCallback(async () => {
    await setDoc(doc(db, "users", name), {
      score: 0,
    });
    setName("");
  }, [name]);

  return (
    <div className="flex flex-col w-80 items-center border border-black p-8 space-y-8 rounded">
      <p className="font-bold text-2xl">UserRegister</p>
      <input
        className="border border-black rounded p-2 text-lg text-center"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
      />
      <button className="bg-sky-200 rounded p-2 text-gray-700 hover:bg-sky-300" onClick={registerUser}>
        Register
      </button>
    </div>
  );
};

export default UserRegister;
