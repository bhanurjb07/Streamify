import { useCallback, useEffect, useRef, useState } from "react";
import { ICE_SERVERS } from "../config/constants";

export function useWebRTC(socket, callState, setCallState, setCallType) {
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const pendingOfferRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const cleanupMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsCameraOff(false);
  }, []);

  const cleanupPeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.close();
      peerRef.current = null;
    }
    pendingCandidatesRef.current = [];
    pendingOfferRef.current = null;
    cleanupMedia();
  }, [cleanupMedia]);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("webrtc-ice-candidate", { candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        cleanupPeer();
        setCallState("idle");
        setCallType(null);
      }
    };

    peerRef.current = pc;
    return pc;
  }, [socket, cleanupPeer, setCallState, setCallType]);

  const getMediaStream = useCallback(async (type) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const addLocalTracks = useCallback((pc, stream) => {
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  }, []);

  const flushPendingCandidates = useCallback(async (pc) => {
    for (const candidate of pendingCandidatesRef.current) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
    pendingCandidatesRef.current = [];
  }, []);

  const processOffer = useCallback(
    async (offer) => {
      const pc = peerRef.current;
      if (!pc) {
        pendingOfferRef.current = offer;
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      await flushPendingCandidates(pc);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc-answer", { answer });
      setCallState("in-call");
    },
    [socket, flushPendingCandidates, setCallState]
  );

  const startCall = useCallback(
    async (type) => {
      if (!socket) return;

      try {
        setCallType(type);
        setCallState("calling");
        const stream = await getMediaStream(type);
        const pc = createPeerConnection();
        addLocalTracks(pc, stream);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("call-start", { callType: type });
        socket.emit("webrtc-offer", { offer });
      } catch (err) {
        console.error("Failed to start call:", err);
        cleanupPeer();
        setCallState("idle");
        setCallType(null);
      }
    },
    [socket, getMediaStream, createPeerConnection, addLocalTracks, cleanupPeer, setCallState, setCallType]
  );

  const acceptCall = useCallback(
    async (type) => {
      if (!socket) return;

      try {
        setCallType(type);
        const stream = await getMediaStream(type);
        const pc = createPeerConnection();
        addLocalTracks(pc, stream);

        socket.emit("call-accept", { callType: type });

        if (pendingOfferRef.current) {
          const offer = pendingOfferRef.current;
          pendingOfferRef.current = null;
          await processOffer(offer);
        }
      } catch (err) {
        console.error("Failed to accept call:", err);
        cleanupPeer();
        setCallState("idle");
        setCallType(null);
      }
    },
    [socket, getMediaStream, createPeerConnection, addLocalTracks, processOffer, cleanupPeer, setCallState, setCallType]
  );

  const rejectCall = useCallback(() => {
    socket?.emit("call-reject");
    cleanupPeer();
    setCallState("idle");
    setCallType(null);
  }, [socket, cleanupPeer, setCallState, setCallType]);

  const endCall = useCallback(() => {
    socket?.emit("call-end");
    cleanupPeer();
    setCallState("idle");
    setCallType(null);
  }, [socket, cleanupPeer, setCallState, setCallType]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    });
  }, []);

  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsCameraOff(!track.enabled);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleOffer = async ({ offer }) => {
      if (callState === "ringing" && !peerRef.current) {
        pendingOfferRef.current = offer;
        return;
      }

      if (peerRef.current) {
        await processOffer(offer);
      } else {
        pendingOfferRef.current = offer;
      }
    };

    const handleAnswer = async ({ answer }) => {
      try {
        const pc = peerRef.current;
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushPendingCandidates(pc);
        setCallState("in-call");
      } catch (err) {
        console.error("Failed to handle answer:", err);
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      const pc = peerRef.current;
      if (!pc || !candidate) return;

      if (pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    };

    const handleCallAccepted = () => {
      if (callState === "calling") {
        setCallState("in-call");
      }
    };

    const handleCallRejected = () => {
      cleanupPeer();
      setCallState("idle");
      setCallType(null);
    };

    const handleCallEnded = () => {
      cleanupPeer();
      setCallState("idle");
      setCallType(null);
    };

    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("webrtc-ice-candidate", handleIceCandidate);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-rejected", handleCallRejected);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("webrtc-ice-candidate", handleIceCandidate);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("call-rejected", handleCallRejected);
      socket.off("call-ended", handleCallEnded);
    };
  }, [
    socket,
    callState,
    processOffer,
    flushPendingCandidates,
    cleanupPeer,
    setCallState,
    setCallType,
  ]);

  useEffect(() => () => cleanupPeer(), [cleanupPeer]);

  return {
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    cleanupPeer,
  };
}
