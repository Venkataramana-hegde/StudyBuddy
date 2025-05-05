"use client";
import { useState } from "react";
import { Mic, Phone, Video } from "lucide-react";

interface CallControlsProps {
  onEndCall: () => void;
  localAudioTrack: any;
  localVideoTrack: any;
}

const CallControls = ({
  onEndCall,
  localAudioTrack,
  localVideoTrack,
}: CallControlsProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const toggleMute = () => {
    if (localAudioTrack) {
      if (isMuted) {
        localAudioTrack.setEnabled(true);
      } else {
        localAudioTrack.setEnabled(false);
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      if (isVideoOff) {
        localVideoTrack.setEnabled(true);
      } else {
        localVideoTrack.setEnabled(false);
      }
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 p-4">
      <div className="flex justify-center space-x-6">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full ${
            isMuted
              ? "bg-red-500 hover:bg-red-600"
              : "bg-gray-600 hover:bg-gray-700"
          } text-white transition-colors`}
          aria-label={isMuted ? "Unmute mic" : "Mute mic"}
        >
          <Mic size={24} />
          {isMuted && (
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-white transform rotate-45"></div>
            </div>
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${
            isVideoOff
              ? "bg-red-500 hover:bg-red-600"
              : "bg-gray-600 hover:bg-gray-700"
          } text-white transition-colors`}
          aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
        >
          <Video size={24} />
          {isVideoOff && (
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-white transform rotate-45"></div>
            </div>
          )}
        </button>

        <button
          onClick={onEndCall}
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          aria-label="End call"
        >
          <Phone size={24} />
        </button>
      </div>
    </div>
  );
};

export default CallControls;
