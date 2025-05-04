import * as React from "react";
import { EditGroupModal } from "./EditGroupModal";
import { InviteMemberModal } from "./InviteMemberModal";
import { LeaveGroupButton } from "./LeaveGroupModal";
import { DeleteGroupButton } from "./DeleteGroupButton";

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
  return (
    <div className="flex items-center gap-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-full p-1 shadow-sm">
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
