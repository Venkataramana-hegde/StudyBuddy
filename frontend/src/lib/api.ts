/* eslint-disable @typescript-eslint/no-explicit-any */
// src/libs/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"; // update this!

// Helper to make API requests
const fetcher = async (url: string, method: string, body: any) => {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    credentials: "include", // if you are using cookies based auth
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

// Create group
export const createGroup = async (data: {
  name: string;
  description?: string;
}) => {
  return await fetcher(`${BASE_URL}/api/groups/create`, "POST", data);
};
