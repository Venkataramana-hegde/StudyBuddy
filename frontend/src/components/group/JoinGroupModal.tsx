/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function JoinGroupModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleJoin = async () => {
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/group/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteCode: code }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join group");

      // Redirect to the group page (assuming route is /group/:id)
      router.push(`/group/${data.group._id}`);

    } catch (err: any) {
      setError(err.message || "Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black text-white border border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            Join Group
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 items-center">
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            value={code}
            onChange={(value) => setCode(value)}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, idx) => (
                <InputOTPSlot
                  key={idx}
                  index={idx}
                  className="border-gray-600 bg-black text-white focus:border-white"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <DialogFooter className="mt-4 flex justify-center">
          <Button
            onClick={handleJoin}
            disabled={loading || code.length !== 6}
            className="w-full bg-white text-black hover:bg-gray-200"
          >
            {loading ? "Joining..." : "Join Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
