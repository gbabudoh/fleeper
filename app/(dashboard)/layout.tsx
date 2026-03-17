import { Sidebar } from "@/components/Sidebar";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.user) redirect("/login");

  return (
    <div className="min-h-screen bg-(--bg-base)">
      <Sidebar user={session.user} />
      <div className="pl-16 md:pl-64">{children}</div>
    </div>
  );
}
