/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";

interface EditGroupModalProps {
  groupId: string;
  currentName: string;
  currentDescription: string;
  onSave?: () => void;
}

export function EditGroupModal({
  groupId,
  currentName,
  currentDescription,
  onSave,
}: EditGroupModalProps) {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/group/${groupId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update group");
      }

      toast.success("Group updated successfully!");
      if (onSave) onSave();
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="rounded-full gap-1">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">Edit</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Group</SheetTitle>
          <SheetDescription>Update your group details</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSaveChanges} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
