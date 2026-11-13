import { redirect } from "next/navigation";

export default function CustomPage() {
  redirect("/my-lines?tab=paste");
}
