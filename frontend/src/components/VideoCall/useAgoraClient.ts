"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export const useAgoraClient = (
  channelName: string,
  uid: string,
  token: string
) => {
  const [joined, setJoined] = useState(false);
  const [agoraRTC, setAgoraRTC] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);

  // Use refs for all items that shouldn't trigger re-renders
  const localAudioTrackRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  const clientRef = useRef<any>(null);
  const initializedRef = useRef(false);

  // Using useCallback to prevent recreation of these handlers on every render
  const handleUserPublished = useCallback(
    async (user: any, mediaType: string) => {
      if (!clientRef.current) return;

      console.log("Remote user published:", user.uid, mediaType);

      // Subscribe to the remote user
      await clientRef.current.subscribe(user, mediaType);

      // If the user published a video track
      if (mediaType === "video") {
        // Add the user to our state if not already there
        setRemoteUsers((prevUsers) => {
          if (prevUsers.find((u) => u.uid === user.uid)) {
            return prevUsers;
          }
          return [...prevUsers, user];
        });

        // Play the remote video
        setTimeout(() => {
          const playerContainer = document.getElementById(
            `remote-player-${user.uid}`
          );
          if (playerContainer && user.videoTrack) {
            user.videoTrack.play(playerContainer);
          }
        }, 200); // Short delay to ensure DOM is ready
      }

      // If the user published an audio track
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
    },
    []
  );

  const handleUserUnpublished = useCallback((user: any, mediaType: string) => {
    console.log("Remote user unpublished:", user.uid, mediaType);
    if (mediaType === "video" && user.videoTrack) {
      user.videoTrack.stop();
    }
    // We don't remove users when they unpublish media, only when they leave
  }, []);

  const handleUserLeft = useCallback((user: any) => {
    console.log("Remote user left:", user.uid);
    setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
  }, []);

  // Import Agora SDK only once
  useEffect(() => {
    if (initializedRef.current) return;

    const initAgora = async () => {
      try {
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
        setAgoraRTC(AgoraRTC);
        initializedRef.current = true;
      } catch (error) {
        console.error("Failed to import Agora SDK:", error);
      }
    };

    initAgora();
  }, []);

  // Join call effect - only run when necessary dependencies change
  useEffect(() => {
    if (!channelName || !uid || !token || !agoraRTC) return;

    // If already joined with the same parameters, don't rejoin
    if (joined && clientRef.current) return;

    const joinCall = async () => {
      try {
        // Create Agora RTC client
        const client = agoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        // Set up event listeners for remote users - use the memoized handlers
        client.on("user-published", handleUserPublished);
        client.on("user-unpublished", handleUserUnpublished);
        client.on("user-left", handleUserLeft);

        // Join the Agora channel
        await client.join(
          process.env.NEXT_PUBLIC_AGORA_APP_ID!,
          channelName,
          token,
          uid
        );
        console.log("Successfully joined channel:", channelName);

        // Create local audio and video tracks
        const audioTrack = await agoraRTC.createMicrophoneAudioTrack();
        const videoTrack = await agoraRTC.createCameraVideoTrack();

        // Store references to tracks
        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;

        // Publish the tracks
        await client.publish([audioTrack, videoTrack]);
        console.log("Published local tracks");

        // Attach local video to the DOM
        const playerContainer = document.getElementById("local-player");
        if (playerContainer) {
          videoTrack.play(playerContainer);
        }

        setJoined(true);
      } catch (err) {
        console.error("Failed to join Agora channel:", err);
      }
    };

    joinCall();

    // Cleanup function
    return () => {
      // Only perform cleanup if we've actually joined
      if (clientRef.current) {
        // Remove event listeners
        clientRef.current.off("user-published", handleUserPublished);
        clientRef.current.off("user-unpublished", handleUserUnpublished);
        clientRef.current.off("user-left", handleUserLeft);

        // Close tracks and leave channel
        if (localAudioTrackRef.current) {
          localAudioTrackRef.current.close();
        }
        if (localVideoTrackRef.current) {
          localVideoTrackRef.current.close();
        }

        clientRef.current.leave().catch((err: any) => {
          console.error("Failed to leave channel:", err);
        });

        // Reset state
        setRemoteUsers([]);
        setJoined(false);
      }
    };
  }, [
    agoraRTC,
    channelName,
    handleUserLeft,
    handleUserPublished,
    handleUserUnpublished,
    token,
    uid,
  ]);
  // Include all the dependencies, including the memoized callbacks

  // Separate function to leave call that can be called from outside
  const leaveCall = useCallback(async () => {
    if (!clientRef.current) return;

    // Remove event listeners
    clientRef.current.off("user-published", handleUserPublished);
    clientRef.current.off("user-unpublished", handleUserUnpublished);
    clientRef.current.off("user-left", handleUserLeft);

    // Close tracks
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.close();
      localAudioTrackRef.current = null;
    }
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.close();
      localVideoTrackRef.current = null;
    }

    // Leave channel
    try {
      await clientRef.current.leave();
      clientRef.current = null;
    } catch (err) {
      console.error("Failed to leave channel:", err);
    }

    setJoined(false);
    setRemoteUsers([]);
  }, [handleUserPublished, handleUserUnpublished, handleUserLeft]);

  return {
    joined,
    remoteUsers,
    leaveCall,
    localAudioTrack: localAudioTrackRef.current,
    localVideoTrack: localVideoTrackRef.current,
  };
};
