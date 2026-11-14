import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About and credits",
  description:
    "Who made e4.learnchess, and the pieces, opening names and fonts it uses.",
  alternates: { canonical: "/credit" },
};

export default function CreditLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
