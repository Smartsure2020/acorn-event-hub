import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, FolderKanban, Flag, AlertTriangle, Settings, Sprout, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRole } from "@/contexts/AuthContext";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, exact: true },
  { title: "Projects", url: "/", icon: FolderKanban, exact: true },
  { title: "Milestones", url: "/milestones", icon: Flag, exact: false },
  { title: "Risks", url: "/risks", icon: AlertTriangle, exact: false },
  { title: "Settings", url: "/settings", icon: Settings, exact: false },
] as const;

const adminItems = [
  { title: "Admin Panel", url: "/admin", icon: ShieldCheck, exact: false },
] as const;

export function AppSidebar() {
  const { pathname } = useLocation();
  const { isAdmin } = useRole();

  function isActive(url: string, exact: boolean) {
    return exact ? pathname === url : pathname.startsWith(url);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">Acorn</span>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Activations</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={cn(isActive(item.url, item.exact) && "bg-sidebar-accent text-sidebar-accent-foreground font-medium")}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-[10px] uppercase tracking-wider text-muted-foreground/60">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(isActive(item.url, item.exact) && "bg-sidebar-accent text-sidebar-accent-foreground font-medium")}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
