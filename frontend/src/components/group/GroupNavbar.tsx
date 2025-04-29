/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { EditGroupModal } from "./EditGroupModal";
import { InviteMemberModal } from "./InviteMemberModal";
import { DeleteGroupButton } from "./DeleteGroupButton";

export const GroupNavbar = () => {
  const params = useParams();
  const groupId = params.groupId as string;

  const [groupName, setGroupName] = useState("Loading...");
  const [description, setDescription] = useState("");
  const [inviteLink, setInviteLink] = useState("");

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

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const generateInviteLink = async () => {
    const link = `${window.location.origin}/join?groupId=${groupId}`;
    setInviteLink(link);
    return link;
  };

  const copyToClipboard = async () => {
    const link = inviteLink || (await generateInviteLink());
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied!");
  };

  return (
    <div className="fixed top-4 left-0 right-0 flex justify-between items-center px-6 z-50">
      {/* Left side: Group Name */}
      <div className="text-lg font-semibold">
        {groupName === "Loading..." ? (
          <span>Loading...</span>
        ) : groupName === "Error loading name" ? (
          <span>Error</span>
        ) : (
          groupName
        )}
      </div>

      {/* Right side: Options */}
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

        {/* Delete Group */}
        <DeleteGroupButton groupId={groupId} />
      </div>
    </div>
  );
};
