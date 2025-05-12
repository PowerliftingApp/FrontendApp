import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar/Sidebar";

export default function Dashboard() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar/>

      {/* Contenido principal */}
      <main className="flex-1 p-6">
        <SidebarTrigger />
        <div className="mx-auto max-w-7xl"></div>
      </main>
    </SidebarProvider>
  );
}
