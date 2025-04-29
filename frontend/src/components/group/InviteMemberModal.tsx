/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Copy, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InviteMemberModalProps {
  groupId: string;
  triggerClassName?: string;
}

export function InviteMemberModal({
  groupId,
  triggerClassName,
}: InviteMemberModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInviteCode = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/group/${groupId}/inviteCode`,
        { method: "GET", credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invite code");
      }

      const data = await response.json();
      setInviteCode(data.inviteCode);
    } catch (error) {
      toast.error("Something went wrong while fetching invite code");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (!inviteCode) {
        toast.warning("No code to copy");
        return;
      }
      await navigator.clipboard.writeText(inviteCode);
      toast.success("Invite code copied!");
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-full gap-1 ${triggerClassName}`}
        >
          <UserPlus className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">Invite</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>
            Share this 6-digit code to invite others to your group
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              value={
                inviteCode ||
                (isGenerating ? "Generating code..." : "Click to generate")
              }
              readOnly
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="px-3"
            onClick={copyToClipboard}
            disabled={!inviteCode}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            variant="secondary"
            onClick={generateInviteCode}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Code"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
