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

// At the top of your file, outside the component
import io from "socket.io-client";

// Create socket instance but don't connect right away
const socket = io("http://localhost:5000", {
  withCredentials: true,
  autoConnect: false,
});

// Make socket globally available for other components
if (typeof window !== "undefined") {
  window.socket = socket;
}

// Add this type declaration to avoid TypeScript errors
declare global {
  interface Window {
    socket: any;
  }
}

export default function GroupChat() {
  const params = useParams();
  const groupId = params.groupId as string;

  const [groupName, setGroupName] = React.useState("Loading...");
  const [description, setDescription] = React.useState("");
  const [currentUserId, setCurrentUserId] = React.useState("");
  const [groupMembers, setGroupMembers] = React.useState({});

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

        // If members are available in the API response, store them
        if (data.data.members) {
          const membersMap = {};
          data.data.members.forEach((member) => {
            membersMap[member.userId] = member.username || "Unknown User";
          });
          setGroupMembers(membersMap);
        }
      } else {
        setGroupName("Unknown Group");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setGroupName("Error loading name");
      toast.error("Failed to load group details");
    }
  };

  // Add this new function to fetch group members
  const fetchGroupMembers = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/group/${groupId}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch group members");
      }

      const data = await res.json();
      console.log("Group members API response:", data);

      if (data.success && data.data) {
        const membersMap = {};

        // Handle different response structures
        if (Array.isArray(data.data)) {
          // If data.data is an array
          data.data.forEach((member) => {
            membersMap[member.userId || member._id] =
              member.username || member.name || "Unknown User";
          });
        } else if (typeof data.data === "object") {
          // If data.data is an object with user IDs as keys
          Object.keys(data.data).forEach((userId) => {
            const member = data.data[userId];
            membersMap[userId] =
              member.username || member.name || "Unknown User";
          });
        } else {
          console.error("Unexpected group members data structure:", data.data);
        }

        console.log("Processed members map:", membersMap);
        setGroupMembers(membersMap);
      }
    } catch (err) {
      console.error("Failed to fetch group members:", err);
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

        // Process messages and extract sender information
        const formatted = messages.map((msg) => {
          // Update our members map if the message contains sender info
          if (
            msg.sender &&
            msg.senderId &&
            (msg.sender.username || msg.sender.name)
          ) {
            const senderName = msg.sender.username || msg.sender.name;
            if (msg.senderId !== userId) {
              // Don't override current user's name
              setGroupMembers((prev) => ({
                ...prev,
                [msg.senderId]: senderName,
              }));
            }
          }

          return {
            role: msg.senderId === userId ? "user" : "agent",
            content: msg.message || msg.content || "",
            id: msg._id || Date.now().toString(),
            senderId: msg.senderId,
            // Always use "You" for current user's messages
            senderName:
              msg.senderId === userId
                ? "You"
                : groupMembers[msg.senderId] || "Unknown User",
          };
        });

        setMessages(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  // Inside your component
  // Fix for GroupChat component
  // Replace the socket event handler section in the React.useEffect where you're setting up the socket

  React.useEffect(() => {
    if (!groupId) return;

    let isComponentMounted = true;

    const setupSocket = async () => {
      try {
        // Fetch current user
        const res = await fetch("http://localhost:5000/api/auth/current-user", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch current user");
        }

        const user = await res.json();
        console.log("Fetched current user:", user);

        // Handle different user response structures
        const userId = user.user?.id || user.userId || user._id || user.id;
        if (!userId) {
          console.error("Could not determine user ID from response:", user);
          toast.error("Failed to get user information");
          return;
        }

        if (!isComponentMounted) return;

        setCurrentUserId(userId);

        // Set your own username in the members map right away
        setGroupMembers((prev) => ({
          ...prev,
          [userId]: user.user?.username || user.username || user.name || "You",
        }));

        // Fetch group members first
        try {
          await fetchGroupMembers();
        } catch (err) {
          console.error("Error fetching group members:", err);
          // Continue execution even if members fetch fails
        }

        if (!isComponentMounted) return;

        // Fetch messages after setting user ID and getting members
        await fetchMessages(groupId, userId);

        if (!isComponentMounted) return;

        // Only connect socket once
        if (!socket.connected) {
          console.log("Connecting socket...");
          socket.connect();
        }

        // Join the group room
        socket.emit("joinGroup", groupId);
        console.log("Joined group:", groupId);

        // Set up socket event handlers
        const setupEventHandlers = () => {
          // Debug connection
          socket.on("connect", () => {
            console.log("Socket connected with ID:", socket.id);
          });

          socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
          });

          // Message handler
          socket.on("newGroupMessage", (message) => {
            console.log("Received message from socket:", message);
            if (isComponentMounted) {
              processIncomingMessage(message, userId);
            }
          });

          // Group update handler
          socket.on("groupUpdated", (data) => {
            console.log("Group updated event received:", data);

            if (isComponentMounted && data.groupId === groupId) {
              setGroupName(data.name || "Unknown Name");
              setDescription(data.description || "");
              // Re-fetch members if group is updated
              fetchGroupMembers();
              toast.success("Group details have been updated");
            }
          });

          // Member joined handler
          socket.on("memberJoined", (data) => {
            console.log("Member joined event received:", data);

            if (isComponentMounted && data.groupId === groupId) {
              // Update members list
              fetchGroupMembers();
              toast.success(
                `${data.username || "A new user"} has joined the group`
              );
            }
          });

          // Group deletion handler
          socket.on("groupDeleted", (data) => {
            console.log("Group deleted event received:", data);

            if (isComponentMounted && data.groupId === groupId) {
              // Show toast with message from server if available
              toast.error(
                data.message || "This group has been deleted by the admin"
              );

              // Use a small timeout to allow the toast to show before redirecting
              setTimeout(() => {
                window.location.href = data.redirectTo || "/";
              }, 1500);
            }
          });
        };

        // Clean up old handlers before adding new ones
        socket.off("newGroupMessage");
        socket.off("groupUpdated");
        socket.off("memberJoined");
        socket.off("groupDeleted");

        // Set up new handlers
        setupEventHandlers();
      } catch (err) {
        console.error("Setup error:", err);
        if (isComponentMounted) {
          toast.error("Failed to initialize chat");
        }
      }
    };

    setupSocket();

    // Cleanup function
    return () => {
      isComponentMounted = false;

      // Remove all listeners
      socket.off("newGroupMessage");
      socket.off("groupUpdated");
      socket.off("memberJoined");
      socket.off("groupDeleted");

      // Note: We're not disconnecting socket here to allow it to persist
      // between component mounts, which is what you want for a chat app
    };
  }, [groupId]);

  // Process incoming socket messages
  const processIncomingMessage = React.useCallback(
    (message, userId) => {
      if (!message) {
        console.error("Received empty message object from socket");
        return;
      }

      try {
        // Extract message information
        const messageId = message._id || Date.now().toString();
        const senderId = message.senderId;
        const messageContent =
          message.message || message.content || message.text || "";

        // For messages from the current user, always use "You"
        let senderName = "Unknown User";
        if (senderId === userId) {
          senderName = "You";
        } else {
          // Try to get sender name from members map, fetch user info if not found
          senderName = groupMembers[senderId] || "Unknown User";

          // If we don't have this user's info, try to update our members map
          if (senderName === "Unknown User" && message.sender) {
            // Some APIs include sender info directly in the message
            const senderInfo = message.sender;
            if (senderInfo.username || senderInfo.name) {
              const newName = senderInfo.username || senderInfo.name;
              setGroupMembers((prev) => ({
                ...prev,
                [senderId]: newName,
              }));
              senderName = newName;
            }
          }
        }

        console.log("Processing incoming message:", {
          messageId,
          senderId,
          senderName,
          content: messageContent,
        });

        // Skip if we've already processed this exact message ID
        if (sentMessagesRef.current.has(messageId)) {
          console.log("Skipping already processed message ID:", messageId);
          return;
        }

        // Add to our tracking set FIRST before any state updates
        sentMessagesRef.current.add(messageId);

        setMessages((prev) => {
          // Check if we already have this message (by ID or possibly by a temp ID that matches content)
          const existingMessageIndex = prev.findIndex(
            (msg) =>
              msg.id === messageId ||
              (msg.isLocalMessage &&
                msg.senderId === senderId &&
                msg.content === messageContent)
          );

          // If message already exists, update it instead of adding a new one
          if (existingMessageIndex >= 0) {
            console.log(
              "Found existing message, updating instead of adding duplicate"
            );
            const updatedMessages = [...prev];
            updatedMessages[existingMessageIndex] = {
              ...updatedMessages[existingMessageIndex],
              id: messageId, // Ensure it has the server ID
              isLocalMessage: false, // Mark as confirmed by server
              senderName: senderName, // Add sender name
            };
            return updatedMessages;
          }

          // Otherwise, add as a new message
          console.log("Adding new message from socket");
          return [
            ...prev,
            {
              role: senderId === userId ? "user" : "agent",
              content: messageContent,
              id: messageId,
              senderId: senderId,
              senderName: senderName,
              isLocalMessage: false,
            },
          ];
        });
      } catch (err) {
        console.error("Error processing message:", err);
      }
    },
    [groupMembers]
  );

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

    // Always use "You" for current user's messages in the UI
    const senderName = "You";

    // Make sure we have our user ID in the members map
    if (!groupMembers[currentUserId]) {
      setGroupMembers((prev) => ({
        ...prev,
        [currentUserId]: "You",
      }));
    }

    const localMessage = {
      role: "user",
      content: messageContent,
      id: tempId,
      senderId: currentUserId,
      senderName: senderName,
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

  // Helper function to generate initials from name
  const getInitials = (name) => {
    if (!name || name === "Unknown User") return "?";
    return (
      name
        .split(" ")
        .map((n) => (n && n[0] ? n[0] : ""))
        .join("")
        .toUpperCase()
        .substring(0, 2) || "?"
    );
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
                  key={`${message.id}-${index}`} // Combine ID with index for guaranteed uniqueness
                  className={cn(
                    "flex flex-col",
                    message.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  {/* Sender name */}
                  <div className="px-2 mb-1 text-xs text-slate-400">
                    {message.role === "user"
                      ? "You"
                      : message.senderName || "Unknown User"}
                  </div>

                  {/* Message bubble with avatar for others */}
                  <div className="flex items-end gap-2">
                    {message.role !== "user" && (
                      <Avatar className="h-6 w-6 bg-slate-700">
                        <AvatarFallback className="text-[10px]">
                          {message.senderName === "Unknown User"
                            ? "?"
                            : getInitials(message.senderName)}
                        </AvatarFallback>
                      </Avatar>
                    )}

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

                    {message.role === "user" && (
                      <Avatar className="h-6 w-6 bg-blue-700">
                        <AvatarFallback className="text-[10px] bg-blue-600">
                          YOU
                        </AvatarFallback>
                      </Avatar>
                    )}
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
