import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar/Sidebar";
import { Outlet } from "react-router";

export default function Dashboard() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />

      {/* Contenido principal */}
      <main className="flex-1 p-6">
        <SidebarTrigger />
        <div className="mx-auto max-w-8xl">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
