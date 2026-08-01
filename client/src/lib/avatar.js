export const getDefaultAvatar = (seed = "streamify-user") =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(String(seed))}`;

export const getAvatarSrc = (user) => {
  if (user?.profilePic) return user.profilePic;
  return getDefaultAvatar(user?._id || user?.fullName || user?.email || "streamify-user");
};
