import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Channel,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import toast from "react-hot-toast";

import useAuthUser from "../hooks/useAuthUser";
import useStreamChatClient from "../hooks/useStreamChatClient";
import { getUserProfile, syncChatUsers } from "../lib/api";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import CustomChannelHeader from "../components/CustomChannelHeader";

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const { authUser } = useAuthUser();
  const { chatClient, connecting } = useStreamChatClient();

  const [channel, setChannel] = useState(null);
  const [loadingChannel, setLoadingChannel] = useState(true);

  const { data: otherUser } = useQuery({
    queryKey: ["userProfile", targetUserId],
    queryFn: () => getUserProfile(targetUserId),
    enabled: Boolean(targetUserId),
  });

  useEffect(() => {
    const initChannel = async () => {
      if (!chatClient || !authUser || !targetUserId || !otherUser) return;

      try {
        setLoadingChannel(true);

        // Sync both users' avatars/names into Stream (server-side)
        await syncChatUsers(targetUserId);

        // Disable slash commands in composer
        chatClient.setMessageComposerSetupFunction?.(({ composer }) => {
          try {
            composer.textComposer.middlewareExecutor.remove([
              "stream-io/text-composer/commands",
              "stream-io/text-composer/commands-middleware",
            ]);
          } catch {
            // middleware ids can vary by SDK version
          }
        });

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = chatClient.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch({ presence: true, state: true, watch: true });

        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
        setChannel(null);
      } finally {
        setLoadingChannel(false);
      }
    };

    initChannel();
  }, [chatClient, authUser, targetUserId, otherUser]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (connecting || loadingChannel || !chatClient || !channel || !otherUser) {
    return <ChatLoader />;
  }

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <CustomChannelHeader otherUser={otherUser} />
              <MessageList />
              <MessageComposer focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
