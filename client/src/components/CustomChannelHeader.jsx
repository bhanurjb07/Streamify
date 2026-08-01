import { useEffect, useState } from "react";
import { useChannelStateContext, useChatContext } from "stream-chat-react";
import { getAvatarSrc } from "../lib/avatar";

const CustomChannelHeader = ({ otherUser }) => {
  const { channel } = useChannelStateContext();
  const { client } = useChatContext();
  const [isOnline, setIsOnline] = useState(false);

  const otherUserId = otherUser?._id;
  const displayName = otherUser?.fullName || "Chat";
  const image = getAvatarSrc(otherUser);

  useEffect(() => {
    if (!client || !otherUserId || !channel) return;

    const readOnlineStatus = () => {
      const member = channel.state.members?.[otherUserId];
      const fromMember = member?.user?.online;
      const fromClient = client.state.users?.[otherUserId]?.online;
      setIsOnline(Boolean(fromMember ?? fromClient));
    };

    readOnlineStatus();

    const subs = [
      client.on("user.presence.changed", (event) => {
        if (event.user?.id === otherUserId) {
          setIsOnline(Boolean(event.user.online));
        }
      }),
      client.on("user.updated", (event) => {
        if (event.user?.id === otherUserId) {
          setIsOnline(Boolean(event.user.online));
        }
      }),
      channel.on("member.updated", readOnlineStatus),
    ];

    return () => {
      subs.forEach((sub) => sub.unsubscribe());
    };
  }, [client, channel, otherUserId]);

  return (
    <div className="str-chat__header-livestream streamify-chat-header">
      <div className="streamify-chat-header__user">
        <div className={`streamify-chat-header__avatar ${isOnline ? "is-online" : ""}`}>
          <img src={image} alt={displayName} />
          <span
            className={`streamify-chat-header__dot ${isOnline ? "online" : "offline"}`}
            aria-hidden
          />
        </div>
        <div className="streamify-chat-header__meta">
          <p className="streamify-chat-header__name">{displayName}</p>
          <p className={`streamify-chat-header__status ${isOnline ? "online" : "offline"}`}>
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomChannelHeader;
