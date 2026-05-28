import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function RootPage() {
  const user = await getCurrentUser();

  // Redirect authenticated users to dashboard, others to login
  if (user) {
    redirect("/documents");
  } else {
    redirect("/login");
  }
}
