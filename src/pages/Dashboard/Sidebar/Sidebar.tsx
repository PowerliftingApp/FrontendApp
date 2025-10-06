import { Collapsible } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  BicepsFlexed,
  ChevronUp,
  File,
  Home,
  SquareChartGantt,
  Users,
  Settings as SettingsIcon,
  Calendar,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";

// Menu items.
const itemsCoach = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Calendario",
    url: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Planes de entrenamiento",
    url: "/dashboard/training-plans",
    icon: SquareChartGantt,
  },
  {
    title: "Atletas",
    url: "/dashboard/athletes",
    icon: Users,
  },
  {
    title: "Plantillas",
    url: "/dashboard/templates",
    icon: File,
  },
  {
    title: "Configuración",
    url: "/dashboard/settings",
    icon: SettingsIcon,
  },
];

const itemsAthlete = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Entrenamientos",
    url: "/dashboard/plans",
    icon: BicepsFlexed,
  },
  {
    title: "Mi Coach",
    url: "/dashboard/athletes",
    icon: Users,
  },
  {
    title: "Configuración",
    url: "/dashboard/settings",
    icon: SettingsIcon,
  },
];

export function AppSidebar() {
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const location = useLocation();
  const navigate = useNavigate();

  // Function to check if a menu item is active
  const isActive = (url: string) => {
    return location.pathname === url;
  };

  if (!user || !user.role) {
    navigate("/");
    return
  }

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");

    navigate("/");
  };

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader>
        <img src="/logo.png" alt="logo" className="w-24 h-24" />
      </SidebarHeader>
      <SidebarContent className="bg-primary">
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {user.role === "coach"
                  ? itemsCoach.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`sidebar-menu-item-hover ${
                            isActive(item.url) ? "sidebar-menu-item-active" : ""
                          }`}
                        >
                          <Link to={item.url} className="text-white">
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  : itemsAthlete.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`sidebar-menu-item-hover ${
                            isActive(item.url) ? "sidebar-menu-item-active" : ""
                          }`}
                        >
                          <Link to={item.url} className="text-white">
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Collapsible>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="bg-primary">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="cursor-pointer sidebar-menu-item-hover text-white h-10">
                  <Avatar>
                    <AvatarImage src={user?.profilePicture ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000/'}${user?.profilePicture.slice(1)}` : undefined} />
                    <AvatarFallback>{user?.fullName?.split(" ")[0]?.charAt(0)}</AvatarFallback>
                  </Avatar>{" "}
                  {user?.fullName}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="text-white"
                  >
                    Cerrar sesión
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
