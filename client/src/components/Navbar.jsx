import { Link, useLocation } from "react-router";
import { BellIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import ProfileMenu from "./ProfileMenu";

const Navbar = () => {
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full gap-2 sm:gap-3">
          {isChatPage && (
            <div className="pl-5 mr-auto">
              <Link to="/" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-9 text-primary" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  Streamify
                </span>
              </Link>
            </div>
          )}

          <Link to={"/notifications"}>
            <button className="btn btn-ghost btn-circle">
              <BellIcon className="h-6 w-6 text-base-content opacity-70" />
            </button>
          </Link>

          <ThemeSelector />

          <ProfileMenu size="w-9" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
