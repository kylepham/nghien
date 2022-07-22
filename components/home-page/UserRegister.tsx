import { doc, setDoc } from "firebase/firestore";
import { useCallback, useState } from "react";
import { db } from "../../firebaseConfig";

const UserRegister = () => {
  const [name, setName] = useState("");
  const [isInfoTextVisible, setIsInfoTextVisible] = useState(false);

  const registerUser = useCallback(async () => {
    await setDoc(doc(db, "users", name), {
      score: 0,
    });
    setName("");
    setIsInfoTextVisible(true);
  }, [name]);

  return (
    <div className="hidden w-80 items-center space-y-4 rounded border p-8">
      <p className="m-auto text-center text-2xl font-bold">UserRegister</p>

      <input
        className="m-auto w-full rounded border p-2 text-center text-lg"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setIsInfoTextVisible(false);
        }}
      />

      <button disabled={name.length === 0} className="m-auto w-full" onClick={registerUser}>
        Register
      </button>

      <p className={`m-0 select-none p-0 text-center ${isInfoTextVisible ? "text-green-500" : "text-slate-900"}`}>
        Reload the page plz
      </p>
    </div>
  );
};

export default UserRegister;
