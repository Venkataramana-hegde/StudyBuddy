
import * as React from "react";
import { EditGroupModal } from "./EditGroupModal";
import { InviteMemberModal } from "./InviteMemberModal";
import { LeaveGroupButton } from "./LeaveGroupModal";
import { DeleteGroupButton } from "./DeleteGroupButton";

import { FiVideo } from "react-icons/fi"; // ✅ Add this import
import { useRouter } from "next/navigation";

interface NavOptionsProps {
  groupId: string;
  groupName: string;
  description: string;
  onRefresh: () => void;
}

export function NavOptions({
  groupId,
  groupName,
  description,
  onRefresh,
}: NavOptionsProps) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-full p-1 shadow-sm">
      {/* ✅ Add Video Call Button (New) */}
      <button
        onClick={() => router.push(`/call/${groupId}`)}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
      >
        <FiVideo className="mr-2" />
        Call
      </button>
      {/* Edit Group Sheet */}
      <EditGroupModal
        groupId={groupId}
        currentName={groupName}
        currentDescription={description}
        onSave={onRefresh} // Refresh group details after save
      />

      {/* Invite Member Dialog */}
      <InviteMemberModal groupId={groupId} />

      {/* Leave Group Dialog */}
      <LeaveGroupButton groupId={groupId} />

      {/* Delete Group */}
      <DeleteGroupButton groupId={groupId} />
    </div>
  );
}
