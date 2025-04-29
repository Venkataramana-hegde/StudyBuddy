// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useEffect } from "react";
// import { toast } from "sonner";

// export default function InviteGroupPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const groupId = searchParams.get("groupId");

//   useEffect(() => {
//     const processInvite = async () => {
//       if (!groupId) {
//         toast.error("Invalid invite link");
//         return router.push("/");
//       }

//       try {
//         const res = await fetch(
//           `http://localhost:5000/api/group/${groupId}/join`,
//           {
//             method: "POST",
//             credentials: "include",
//           }
//         );

//         if (res.ok) {
//           return router.push(`/group/${groupId}`);
//         }

//         if (res.status === 401) {
//           // Store both the original URL and group ID separately
//           localStorage.setItem("inviteRedirect", window.location.href);
//           localStorage.setItem("pendingGroupId", groupId);
//           return router.push(
//             `/sign-in?redirect=/invite-group?groupId=${groupId}`
//           );
//         }

//         const error = await res.json();
//         throw new Error(error.message);
//       } catch (error) {
//         toast.error(
//           error instanceof Error ? error.message : "Failed to join group"
//         );
//         router.push("/");
//       }
//     };

//     processInvite();
//   }, [groupId]);

//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="text-center">
//         <p>Processing your group invitation...</p>
//       </div>
//     </div>
//   );
// }
