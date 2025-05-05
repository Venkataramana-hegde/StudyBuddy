/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { toast } from "sonner";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";

type AuthFormProps = {
  variant: "login" | "signup";
} & React.ComponentProps<"div">;

export function AuthForm({ variant, className, ...props }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams(); // ADD this

  const redirect = searchParams.get("redirect"); // ADD this

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/auth/${variant}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(
          variant === "signup"
            ? {
                name: formData.name,
                email: formData.email,
                password: formData.password,
              }
            : { email: formData.email, password: formData.password }
        ),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
      }

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Authentication failed");

      // Check for pending invite before redirecting
      const pendingRedirect = localStorage.getItem("inviteRedirect");
      if (pendingRedirect) {
        localStorage.removeItem("inviteRedirect");
        window.location.href = pendingRedirect;
      } else {
        // Use the redirect parameter if no pending invite
        window.location.href = decodeURIComponent(redirect || "/");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            {variant === "signup"
              ? "Create an account"
              : "Login to your account"}
          </CardTitle>
          <CardDescription>
            {variant === "signup"
              ? "Enter your details to sign up"
              : "Enter your email below to login to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {variant === "signup" && (
                <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" className="w-full">
                {variant === "signup" ? "Sign up" : "Login"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {variant === "signup" ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href={`/sign-in?redirect=${encodeURIComponent(
                      redirect || "/"
                    )}`}
                    className="underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href={`/sign-up?redirect=${encodeURIComponent(
                      redirect || "/"
                    )}`}
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
