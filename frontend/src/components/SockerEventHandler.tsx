import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// This component doesn't render anything but handles socket events
export function SocketEventHandler() {
  const router = useRouter();

  useEffect(() => {
    if (!window.socket) return;

    // Listen for group updates
    window.socket.on("groupUpdated", (data) => {
      console.log("Group updated event received:", data);
      // Refresh the page to show updated data
      // For a better UX, you could update the UI directly without refreshing
      router.refresh();
      toast.info(`Group "${data.name}" has been updated`);
    });

    // Listen for group deletions
    window.socket.on("groupDeleted", (data) => {
      console.log("Group deleted event received:", data);

      // Check if user is currently viewing the deleted group
      const currentPath = window.location.pathname;
      const groupIdInPath = currentPath.includes(`/group/${data.groupId}`);

      if (groupIdInPath) {
        toast.error(`This group has been deleted`);
        // Navigate to home page
        router.push("/");
      } else {
        // Just refresh the groups list
        router.refresh();
        toast.info(`A group has been deleted`);
      }
    });

    // Cleanup function to remove event listeners
    return () => {
      window.socket.off("groupUpdated");
      window.socket.off("groupDeleted");
    };
  }, [router]);

  // This component doesn't render anything
  return null;
}
