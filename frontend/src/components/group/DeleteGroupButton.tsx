/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function DeleteGroupButton({ groupId }: { groupId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`http://localhost:5000/api/group/${groupId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401) {
        // Token might be expired - redirect to login
        localStorage.removeItem("token");
        toast.error("Session expired. Please login again");
        router.push("/sign-in");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete group");
      }

      const result = await response.json();
      toast.success(result.message);
      router.push("/");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full gap-1 text-red-600 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">Delete</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Group Deletion</DialogTitle>
          <DialogDescription>
            This will permanently delete the group and all its data. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
