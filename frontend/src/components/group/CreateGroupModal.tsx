/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/CreateGroupModal.tsx


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // using sonner for toasts


interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/group",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // if you are using cookies/session auth
          body: JSON.stringify({ name, description }),
        }
      );

      const group = await res.json();

      if (!res.ok) {
        throw new Error(group.message || "Failed to create group");
      }

      toast.success("Group created successfully!");

      router.push(`/group/${group.data._id}`); // correct path from your backend response
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Group</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Input
            placeholder="Group Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Group Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
