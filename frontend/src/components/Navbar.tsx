"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { FiVideo } from "react-icons/fi"; // ✅ Import the icon

const Navbar = () => {
  const [user, setUser] = React.useState<{
    name: string;
    email: string;
  } | null>(null);
  const [groupId, setGroupId] = React.useState("default-group-id"); // ✅ Replace with actual groupId logic

  const router = useRouter();

  // Fetch user details on mount
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/current-user", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser({
            name: data.user.name,
            email: data.user.email,
          });

          // Optionally fetch or set groupId here if available
          setGroupId(data.user.groupId || "default-group-id");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Logout failed");
      }

      router.push("/sign-in");
      router.refresh(); // Clear client cache
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  const handleVideoCallClick = () => {
    router.push(`/call/${groupId}`);
  };

  return (
    <nav className="w-full py-4 px-6 bg-bgDarkViolet text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="StudyBuddy Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <h1 className="text-2xl font-bold tracking-wide">StudyBuddy</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* ✅ Video Call Button */}
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={handleVideoCallClick}
          >
            <FiVideo className="mr-2" />
            Video Call
          </Button>

          {/* Dropdown/Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-bgDarkViolet"
              >
                Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              {user && (
                <DropdownMenuGroup>
                  <DropdownMenuItem className="flex flex-col items-start">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
