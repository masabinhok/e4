import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign up",
  description:
    "Create a free e4.learnchess account to learn and review chess openings.",
  alternates: { canonical: "/auth/signup" },
};

export default function Signup() {
  return <AuthForm mode="signup" />;
}
