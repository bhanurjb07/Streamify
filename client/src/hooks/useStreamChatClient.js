import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import { getStreamToken } from "../lib/api";
import useAuthUser from "./useAuthUser";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

let sharedClient = null;

const useStreamChatClient = () => {
  const { authUser } = useAuthUser();
  const [chatClient, setChatClient] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: Boolean(authUser?.isOnboarded),
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    let active = true;

    const connect = async () => {
      if (!authUser?.isOnboarded || !tokenData?.token || !STREAM_API_KEY) {
        setChatClient(null);
        return;
      }

      try {
        setConnecting(true);
        const client = StreamChat.getInstance(STREAM_API_KEY);
        sharedClient = client;

        if (client.userID === authUser._id) {
          if (active) setChatClient(client);
          return;
        }

        if (client.userID) {
          await client.disconnectUser();
        }

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic || "",
          },
          tokenData.token
        );

        if (active) setChatClient(client);
      } catch (error) {
        console.error("Error connecting Stream chat client:", error);
        if (active) setChatClient(null);
      } finally {
        if (active) setConnecting(false);
      }
    };

    connect();

    return () => {
      active = false;
    };
  }, [authUser, tokenData]);

  useEffect(() => {
    if (authUser) return undefined;

    const disconnect = async () => {
      if (sharedClient?.userID) {
        await sharedClient.disconnectUser();
      }
      setChatClient(null);
    };

    disconnect();
    return undefined;
  }, [authUser]);

  return { chatClient, connecting };
};

export default useStreamChatClient;
