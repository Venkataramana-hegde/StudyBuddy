/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useParams } from "next/navigation";

import { EditGroupModal } from "./EditGroupModal";
import { InviteMemberModal } from "./InviteMemberModal";
import { DeleteGroupButton } from "./DeleteGroupButton";
import { LeaveGroupButton } from "./LeaveGroupModal";

import io from "socket.io-client";
const socket = io("http://localhost:5000", {
  withCredentials: true,
  autoConnect: false,
}); // outside the component so it stays persistent

export default function GroupChat() {
  const params = useParams();
  const groupId = params.groupId as string;

  const [groupName, setGroupName] = React.useState("Loading...");
  const [description, setDescription] = React.useState("");
  const [currentUserId, setCurrentUserId] = React.useState("");

  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");
  const inputLength = input.trim().length;
  const messagesEndRef = React.useRef(null);

  // Add a ref to track sent messages to avoid duplicates
  const sentMessagesRef = React.useRef(new Set());

  const fetchGroupDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/group/${groupId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch group");
      }

      const data = await res.json();

      if (data.success && data.data) {
        setGroupName(data.data.name || "Unknown Name");
        setDescription(data.data.description || "");
      } else {
        setGroupName("Unknown Group");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setGroupName("Error loading name");
      toast.error("Failed to load group details");
    }
  };

  const fetchMessages = async (groupId, userId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/message/${groupId}/messages`,
        {
          credentials: "include",
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await res.json();
      if (data.success && data.data) {
        const messages = data.data || [];
        const formatted = messages.map((msg) => ({
          role: msg.senderId === userId ? "user" : "agent",
          content: msg.message || msg.content || "",
          id: msg._id || Date.now().toString(),
          senderId: msg.senderId,
        }));
        setMessages(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  // Inside your component
  React.useEffect(() => {
    if (!groupId) return;

    const setupSocket = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/current-user", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch current user");
        }

        const user = await res.json();
        console.log("Fetched current user:", user);
        const userId = user.user.id;
        setCurrentUserId(userId);

        // Fetch messages after setting user ID
        await fetchMessages(groupId, userId);

        // Only connect and emit after user is set
        socket.connect();
        socket.emit("joinGroup", groupId);

        // Debug socket connection
        socket.on("connect", () => {
          console.log("Socket connected with ID:", socket.id);
        });

        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err);
        });

        // Set up message handler
        socket.on("newGroupMessage", (message) => {
          console.log("Received message from socket:", message);

          // Handle the message processing
          processIncomingMessage(message, userId);
        });
      } catch (err) {
        console.error("Setup error:", err);
        toast.error("Failed to initialize chat");
      }
    };

    setupSocket();

    return () => {
      socket.off("newGroupMessage");
      socket.disconnect();
    };
  }, [groupId]);

  // Process incoming socket messages
  const processIncomingMessage = React.useCallback((message, userId) => {
    if (!message) {
      console.error("Received empty message object from socket");
      return;
    }

    try {
      // Extract message information
      const messageId = message._id || Date.now().toString();
      const senderId = message.senderId;

      // Skip if this is a message we've already processed
      if (sentMessagesRef.current.has(messageId)) {
        console.log("Skipping already displayed message:", messageId);
        return;
      }

      // Check if this might be a message we've already added locally (as the sender)
      // This is especially important for our own messages that we've already displayed locally
      if (senderId === userId) {
        // Check if we have any local messages with matching content
        setMessages((prev) => {
          // Try to find a local message with the same content from the same sender
          const localMessageIndex = prev.findIndex(
            (msg) =>
              msg.isLocalMessage &&
              msg.senderId === senderId &&
              msg.content ===
                (message.message || message.content || message.text || "")
          );

          // If we found a matching local message, update it with server info instead of adding a duplicate
          if (localMessageIndex >= 0) {
            console.log(
              "Found matching local message, updating instead of adding duplicate"
            );
            const updatedMessages = [...prev];
            updatedMessages[localMessageIndex] = {
              ...updatedMessages[localMessageIndex],
              id: messageId,
              isLocalMessage: false, // Mark as confirmed by server
            };

            // Add to our processed set to avoid future duplication
            sentMessagesRef.current.add(messageId);

            return updatedMessages;
          }

          // If no matching local message was found, proceed with adding the new message
          console.log(
            "No matching local message found, adding new message from socket"
          );

          // Extract content from whatever field it might be in
          let messageContent = null;
          if (typeof message === "string") {
            messageContent = message;
          } else {
            messageContent =
              message.message || message.content || message.text || "";
          }

          // Add to our processed set to avoid duplicates
          sentMessagesRef.current.add(messageId);

          return [
            ...prev,
            {
              role: senderId === userId ? "user" : "agent",
              content: messageContent,
              id: messageId,
              senderId: senderId,
              isLocalMessage: false, // This comes from server
            },
          ];
        });
      } else {
        // For messages from other users, just add them directly
        // Extract content from whatever field it might be in
        let messageContent = null;
        if (typeof message === "string") {
          messageContent = message;
        } else {
          messageContent =
            message.message || message.content || message.text || "";
        }

        console.log("Processing message from another user:", {
          messageId,
          senderId,
          content: messageContent,
        });

        // Add to the messages state
        setMessages((prev) => [
          ...prev,
          {
            role: "agent", // Always "agent" for other users
            content: messageContent,
            id: messageId,
            senderId: senderId,
            isLocalMessage: false,
          },
        ]);

        // Add to our processed set to avoid duplicates
        sentMessagesRef.current.add(messageId);
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  }, []);

  React.useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (event) => {
    event.preventDefault();

    if (!input.trim() || !currentUserId) {
      console.warn("Form submit blocked: missing input or currentUserId");
      return;
    }

    // Store message content before clearing input
    const messageContent = input;

    // Clear input field immediately for better UX
    setInput("");

    // Create a temporary ID for local message
    const tempId = `temp-${Date.now()}`;
    const localMessage = {
      role: "user",
      content: messageContent,
      id: tempId,
      senderId: currentUserId,
      // Flag this as a local message that we've added manually
      isLocalMessage: true,
    };

    // Add message locally first for immediate feedback
    setMessages((prev) => [...prev, localMessage]);

    // Add to sent message set to avoid duplication when received from server
    sentMessagesRef.current.add(tempId);

    // Prepare the message payload
    const messagePayload = {
      groupId,
      senderId: currentUserId,
      message: messageContent,
    };

    // Emit to the server via socket
    console.log("Sending message payload:", messagePayload);
    socket.emit("sendGroupMessage", messagePayload, (acknowledgement) => {
      console.log("Message acknowledgement:", acknowledgement);

      // If server returned an ID, update our tracking and the message in state
      if (acknowledgement && acknowledgement._id) {
        // Add server ID to our tracking set
        sentMessagesRef.current.add(acknowledgement._id);

        // Update the temporary message with the server's ID
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? { ...msg, id: acknowledgement._id, isLocalMessage: false }
              : msg
          )
        );

        // Remove the temp ID from the set
        sentMessagesRef.current.delete(tempId);
      }
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-white">
      {/* Header - Fixed at top */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10 bg-slate-800">
            <AvatarFallback className="bg-slate-700 text-slate-200">
              GC
            </AvatarFallback>
          </Avatar>
          <div className="text-lg font-semibold">
            {groupName === "Loading..." ? (
              <span>Loading...</span>
            ) : groupName === "Error loading name" ? (
              <span>Error</span>
            ) : (
              groupName
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-full p-1 shadow-sm">
          {/* Edit Group Sheet */}
          <EditGroupModal
            groupId={groupId}
            currentName={groupName}
            currentDescription={description}
            onSave={fetchGroupDetails} // <- pass fetchGroupDetails here to refresh after save
          />

          {/* Invite Member Dialog */}
          <InviteMemberModal groupId={groupId} />
          {/* Leave Group Dialog */}
          <LeaveGroupButton groupId={groupId} />
          {/* Delete Group */}
          <DeleteGroupButton groupId={groupId} />
        </div>
      </div>

      {/* Content wrapper - Takes remaining height */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center text-slate-500 py-10">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      message.role === "user"
                        ? "bg-blue-600 text-blue-50 rounded-tr-none"
                        : "bg-slate-800 text-slate-100 rounded-tl-none"
                    )}
                  >
                    {message.content || ""}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area - Fixed at bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center space-x-2"
            >
              <Input
                id="message"
                placeholder="Type your message..."
                className="flex-1 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:ring-offset-slate-900"
                autoComplete="off"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                disabled={inputLength === 0}
                className="bg-blue-600 hover:bg-blue-500 focus-visible:ring-blue-500"
              >
                <Send className="size-5" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
