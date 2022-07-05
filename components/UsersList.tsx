import _ from "lodash";
import useLocalStorage from "../hooks/useLocalStorage";

interface UsersListProps {
  title: string;
  users: string[];
  scores: { [key: string]: number };
  scoreDiffs: { [key: string]: number };
}

const UsersList = ({ title, users, scores, scoreDiffs }: UsersListProps) => {
  return (
    <div className="bg-yellow-200 rounded-md p-4 space-y-4 select-none">
      <h1 className="underline">{title}</h1>
      {users.length === 0 && <p className="text-gray-700">No users.</p>}
      <div className="space-y-4">
        {users.map((user, index) => {
          return (
            <div key={index} className="flex justify-between bg-white rounded-sm p-2 hover:bg-gray-100">
              <h2 className="font-bold">{user}</h2>
              <div className="flex items-end space-x-1">
                <h2>{_.isFinite(scores[user]) ? scores[user] : 0}</h2>
                {_.isFinite(scoreDiffs[user]) && scoreDiffs[user] !== 0 && (
                  <h2 className={`${scoreDiffs[user] >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ({scoreDiffs[user]})
                  </h2>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UsersList;
