/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function LeaveGroupButton({ groupId }: { groupId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const router = useRouter();

  const handleLeave = async () => {
    setIsLeaving(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/group/${groupId}/leave`,
        {
          method: "POST",
          credentials: "include", // This is key for sending cookies
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Handle HTML responses (like 404 pages)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        const text = await response.text();
        throw new Error("Server returned HTML instead of JSON");
      }

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please login again");
        router.push("/sign-in");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to leave group");
      }

      toast.success("Successfully left the group");
      router.push("/");
    } catch (error: any) {
      console.error("Leave error:", error);
      toast.error(error.message || "Failed to leave group");
    } finally {
      setIsLeaving(false);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:bg-red-50 hover:text-red-700 gap-1"
        onClick={() => setIsOpen(true)}
      >
        <LogOut className="h-4 w-4" />
        <span className="sr-only md:not-sr-only">Leave Group</span>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">Leave Group?</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave this study group? You'll need to be
            invited again to rejoin.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleLeave}
            disabled={isLeaving}
          >
            {isLeaving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">↻</span>
                Leaving...
              </span>
            ) : (
              "Leave Group"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
