"use client"; // 👈 this is important!
import { useEffect, useState, useCallback } from "react";
import { useAgoraClient } from "@/components/VideoCall/useAgoraClient";
import { useParams, useRouter } from "next/navigation";
import CallControls from "@/components/VideoCall/CallControls";

const CallPage = () => {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate a stable UID that won't change on re-renders
  const uid = useState(() => `user-${Math.floor(Math.random() * 10000)}`)[0];

  // Use useCallback to prevent function recreation on every render
  const fetchToken = useCallback(async () => {
    if (!groupId) return;

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName: groupId, uid }),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch token: ${res.status}`);
      }

      const data = await res.json();
      setToken(data.token);
    } catch (err) {
      console.error("Error fetching token:", err);
      setError(
        "Failed to connect to the video call service. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, [groupId, uid]);

  // Fetch token on initial render
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Use the fixed Agora client hook
  const { joined, remoteUsers, leaveCall, localAudioTrack, localVideoTrack } =
    useAgoraClient(groupId, uid, token);

  const handleEndCall = useCallback(() => {
    leaveCall();
    router.push(`/group/${groupId}`); // Navigate back to group chat instead of dashboard
  }, [leaveCall, router, groupId]);

  if (error) {
    return (
      <div className="p-6">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
          <button
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            onClick={() => router.push(`/group/${groupId}`)}
          >
            Back to Group Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Video Call</h1>
        <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
          {isLoading ? (
            <span className="text-yellow-600">Loading...</span>
          ) : joined ? (
            <span className="text-green-600">Connected</span>
          ) : (
            <span className="text-yellow-600">Connecting...</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Local user video */}
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <div
            id="local-player"
            className="w-full h-64 bg-gray-800 text-white flex items-center justify-center"
          >
            {!joined && "Joining call..."}
          </div>
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm text-white">
            You (Local)
          </div>
        </div>

        {/* Remote users videos */}
        {remoteUsers.map((user) => (
          <div
            key={user.uid}
            className="relative rounded-lg overflow-hidden shadow-lg"
          >
            <div
              id={`remote-player-${user.uid}`}
              className="w-full h-64 bg-gray-800 text-white flex items-center justify-center"
            >
              {!user.videoTrack && "Remote video loading..."}
            </div>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm text-white">
              {user.uid}
            </div>
          </div>
        ))}

        {/* Empty placeholders without invite message */}
        {joined && remoteUsers.length < 2 && (
          <div className="w-full h-64 bg-gray-200 text-gray-500 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <p>Waiting for participants</p>
            </div>
          </div>
        )}
      </div>

      {joined && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-green-600 font-medium">✓ Connected to call</p>
          <p className="text-gray-600">
            {remoteUsers.length} other participant
            {remoteUsers.length !== 1 ? "s" : ""} in the call
          </p>
        </div>
      )}

      {/* Call controls - Only show when joined and tracks are available */}
      {joined && (
        <CallControls
          onEndCall={handleEndCall}
          localAudioTrack={localAudioTrack}
          localVideoTrack={localVideoTrack}
        />
      )}
    </div>
  );
};

export default CallPage;
