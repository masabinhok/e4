import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Log in",
  alternates: { canonical: "/auth/login" },
};

export default function Login() {
  return <AuthForm mode="login" />;
}
