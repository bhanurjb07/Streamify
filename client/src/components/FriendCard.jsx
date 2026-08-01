import { Link } from "react-router";
import { UserMinusIcon } from "lucide-react";
import { LANGUAGE_TO_FLAG } from "../constants";

const FriendCard = ({ friend, showRemove = false, onRemove, removing = false }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <div className="rounded-full overflow-hidden">
              <img
                src={friend.profilePic || `https://api.dicebear.com/9.x/avataaars/svg?seed=${friend._id}`}
                alt={friend.fullName}
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold truncate">{friend.fullName}</h3>
            {(friend.city || friend.country || friend.location) && (
              <p className="text-xs opacity-60 truncate">
                {friend.city && friend.country
                  ? `${friend.city}, ${friend.country}`
                  : friend.country || friend.location}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
            Message
          </Link>
          {showRemove && (
            <button
              type="button"
              className="btn btn-error btn-outline btn-sm w-full"
              onClick={onRemove}
              disabled={removing}
            >
              <UserMinusIcon className="size-4 mr-1" />
              Remove Friend
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
