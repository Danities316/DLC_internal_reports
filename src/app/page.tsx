import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthPage from "./auth/page";
import DashboardWrapper from "@/components/DashboardWrapper";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    return <AuthPage />;
  }

  return <DashboardWrapper session={session} />;
}
