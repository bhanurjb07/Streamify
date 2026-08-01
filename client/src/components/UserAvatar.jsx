import { useEffect, useState } from "react";
import { getAvatarSrc, getDefaultAvatar } from "../lib/avatar";

const UserAvatar = ({ user, className = "w-9", alt = "User Avatar" }) => {
  const [src, setSrc] = useState(() => getAvatarSrc(user));

  useEffect(() => {
    setSrc(getAvatarSrc(user));
  }, [user?.profilePic, user?._id, user?.fullName]);

  return (
    <div className="avatar">
      <div className={`${className} rounded-full overflow-hidden bg-base-300`}>
        <img
          src={src}
          alt={alt}
          onError={() => setSrc(getDefaultAvatar(user?._id || "streamify-user"))}
        />
      </div>
    </div>
  );
};

export default UserAvatar;
