import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = { title: "Fleeper Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session.admin) redirect("/admin-login");

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(155deg, #F0FFFA 0%, #E4FFF6 14%, #F8FFFE 30%, #EAFFF8 48%, #F4FFFC 65%, #E8FFF9 82%, #FAFFFD 100%)" }}>

      {/* Fixed ambient lighting layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Primary mint orb — top right */}
        <div style={{ position: "absolute", top: "-15%", right: "-5%", width: "900px", height: "900px", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(0,255,204,0.18) 0%, rgba(0,255,204,0.08) 35%, transparent 65%)" }} />
        {/* Secondary teal orb — bottom left */}
        <div style={{ position: "absolute", bottom: "-12%", left: "-8%", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle at 60% 55%, rgba(0,195,155,0.14) 0%, rgba(0,212,168,0.06) 40%, transparent 65%)" }} />
        {/* Accent orb — center */}
        <div style={{ position: "absolute", top: "35%", left: "38%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,204,0.06) 0%, transparent 60%)" }} />
        {/* Fine dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(0,180,130,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      <AdminSidebar admin={session.admin} />
      <main className="ml-64 min-h-screen p-8 relative" style={{ zIndex: 1 }}>
        {children}
      </main>
    </div>
  );
}
