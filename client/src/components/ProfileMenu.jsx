import { Link } from "react-router";
import { LogOutIcon, UserPenIcon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import UserAvatar from "./UserAvatar";

const ProfileMenu = ({ size = "w-9", showDetails = false, align = "dropdown-end" }) => {
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();

  return (
    <div className={`dropdown ${align}`}>
      <div
        tabIndex={0}
        role="button"
        className={`flex items-center gap-3 ${showDetails ? "w-full cursor-pointer rounded-lg p-1 hover:bg-base-300" : "btn btn-ghost btn-circle avatar"}`}
      >
        <UserAvatar user={authUser} className={size} />
        {showDetails && (
          <div className="flex-1 text-left min-w-0">
            <p className="font-semibold text-sm truncate">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        )}
      </div>

      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-50 mt-2 w-52 p-2 shadow border border-base-300"
      >
        <li>
          <Link to="/edit-profile">
            <UserPenIcon className="size-4" />
            Edit profile
          </Link>
        </li>
        <li>
          <button type="button" onClick={() => logoutMutation()}>
            <LogOutIcon className="size-4" />
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ProfileMenu;
