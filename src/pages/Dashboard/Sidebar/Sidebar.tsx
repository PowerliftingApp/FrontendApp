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
  User2,
  Users,
  Settings as SettingsIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

// Menu items.
const itemsCoach = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: Home,
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

  const navigate = useNavigate();

  if (!user) {
    navigate("/");
  }

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");

    navigate("/");
  };

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader />
      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {user.role === "coach"
                  ? itemsCoach.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  : itemsAthlete.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
              </SidebarMenu>

              {/* <SidebarMenu>
                <Collapsible className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton asChild>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Usuarios
                          </div>
                          <ChevronDown className="w-4 h-4 transition-transform" />
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem className="hover:bg-gray-900 px-2 py-1 rounded-md group/subitem cursor-pointer">
                          <Link
                            to="/dashboard/users/create"
                            className="flex items-center gap-2 group-hover/subitem:text-white"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Crear</span>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem className="hover:bg-gray-900 px-2 py-1 rounded-md group/subitem cursor-pointer">
                          <Link
                            to="/dashboard/users/search"
                            className="flex items-center gap-2 group-hover/subitem:text-white"
                          >
                            <Search className="w-4 h-4" />
                            <span>Buscar</span>
                          </Link>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
              <SidebarMenu>
                <Collapsible className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton asChild>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Evaluaciones
                          </div>
                          <ChevronDown className="w-4 h-4 transition-transform" />
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem className="hover:bg-gray-900 px-2 py-1 rounded-md group/subitem cursor-pointer">
                          <Link
                            to="/dashboard/evaluations-list"
                            className="flex items-center gap-2 group-hover/subitem:text-white"
                          >
                            <List className="w-4 h-4" />
                            <span>Listado</span>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem className="hover:bg-gray-900 px-2 py-1 rounded-md group/subitem cursor-pointer">
                          <Link
                            to="/dashboard/evaluation"
                            className="flex items-center gap-2 group-hover/subitem:text-white"
                          >
                            <FilePlus2 className="w-4 h-4" />
                            <span>Crear</span>
                          </Link>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>  */}
            </SidebarGroupContent>
          </SidebarGroup>
        </Collapsible>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="cursor-pointer">
                  <User2 /> {user?.fullName}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <Button onClick={handleLogout} variant="destructive">
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
