// "use client";

// import { useState, useEffect } from "react";
// import Footer from "@/components/Footer";
// import Hero from "@/components/Hero";
// import Navbar from "@/components/Navbar";
// import StartSection from "@/components/StartSection";

// export default function HomePage() {
//   const [userName, setUserName] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         setIsLoading(true);
//         const response = await fetch(
//           "http://localhost:5000/api/auth/current-user",
//           {
//             credentials: "include",
//           }
//         );

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         setUserName(data.user?.name || "Guest");
//       } catch (err) {
//         console.error("Failed to fetch user data:", err);
//         setError(err instanceof Error ? err.message : "Unknown error occurred");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchUserData();
//   }, []);

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center mt-10">
//         <p className="text-red-500 mb-4">Error: {error}</p>
//         <button
//           onClick={() => window.location.reload()}
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Navbar />
//       <main className="flex-grow">
//         <Hero />
//         <StartSection username={userName} />
//       </main>
//       <Footer />
//     </div>
//   );
// }
