
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EmojiPicker from "emoji-picker-react";
import { BsFiletypeGif } from "react-icons/bs";

interface EmojiGifPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onGifSelect: (gifUrl: string) => void;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}

export function EmojiGifPicker({
  onEmojiSelect,
  onGifSelect,
  input,
  setInput,
}: EmojiGifPickerProps) {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [showGifPicker, setShowGifPicker] = React.useState(false);
  const [gifSearchTerm, setGifSearchTerm] = React.useState("");
  const [gifs, setGifs] = React.useState([]);
  const tenorApiKey = process.env.NEXT_PUBLIC_TENOR_API_KEY;

  // Function to search for GIFs
  const searchGifs = async (searchTerm = "") => {
    try {
      const searchQuery = searchTerm || "trending";
      const limit = 20;

      const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
        searchQuery
      )}&key=${tenorApiKey}&client_key=my_app&limit=${limit}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch GIFs");
      }

      const data = await response.json();
      setGifs(data.results || []);
    } catch (error) {
      console.error("Error fetching GIFs:", error);
      toast.error("Failed to load GIFs");
    }
  };

  // Handle adding emoji to the input
  const handleEmojiSelect = (emojiObject) => {
    onEmojiSelect(emojiObject.emoji);
  };

  // Show GIF picker and search for trending GIFs initially
  const handleGifClick = () => {
    if (!showGifPicker) {
      searchGifs(); // Search for trending GIFs when opening the picker
    }
    setShowGifPicker(!showGifPicker);
    setShowEmojiPicker(false); // Close emoji picker if open
  };

  // Toggle emoji picker
  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
    setShowGifPicker(false); // Close GIF picker if open
  };

  return (
    <>
      {/* Emoji button */}
      <button
        type="button"
        onClick={handleEmojiClick}
        className="text-xl p-2 hover:bg-slate-800 rounded-full transition"
      >
        😄
      </button>
      {/* Emoji Picker */}
      {/* @ts-ignore */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 z-50">
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              handleEmojiSelect(emojiData);
            }}
            theme="dark"
          />
        </div>
      )}
      {/* GIF button */}
      <button
        type="button"
        onClick={handleGifClick}
        className="text-xl p-2 hover:bg-slate-800 rounded-full transition"
      >
        <BsFiletypeGif />
      </button>
      {/* GIF Picker */}
      {showGifPicker && (
        <div className="w-full absolute bottom-16 left-0 px-4 py-2 border-t border-slate-800 bg-slate-900 z-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search for GIFs..."
                  value={gifSearchTerm}
                  onChange={(e) => setGifSearchTerm(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchGifs(gifSearchTerm);
                    }
                  }}
                />
                <Button
                  onClick={() => searchGifs(gifSearchTerm)}
                  className="bg-blue-600 hover:bg-blue-500"
                  size="sm"
                >
                  Search
                </Button>
                <Button
                  onClick={() => setShowGifPicker(false)}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-100"
                >
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto">
                {gifs.map((gif, index) => (
                  <div
                    key={index}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      onGifSelect(gif.media_formats.gif.url);
                      setShowGifPicker(false);
                    }}
                  >
                    <img
                      src={gif.media_formats.tinygif.url}
                      alt={gif.content_description || "GIF"}
                      className="rounded-md w-full h-auto"
                    />
                  </div>
                ))}
              </div>

              {gifs.length === 0 && (
                <div className="text-center text-slate-400 py-4">
                  No GIFs found. Try another search!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
