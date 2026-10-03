import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  MessageSquareText,
  Settings,
  ChevronsUpDown,
  LogOut,
  UserCog,
  GripHorizontal,
  Users,
  UserCircle,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ── Types ───────────────────────────────────────────────────────────────────
export interface AdminNavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

export interface AdminSidebarUser {
  name: string;
  email: string;
}

interface SidebarProps {
  navItems?: AdminNavItem[];
  user?: AdminSidebarUser;
  onLogout?: () => void;
  onAccountSettings?: () => void;
}

interface LayoutProps extends SidebarProps {
  title?: string;
  children: React.ReactNode;
}

// ── Admin nav items ──────────────────────────────────────────────────────────
const ADMIN_NAV: AdminNavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Cohorts", url: "/courses", icon: Layers },
  { title: "Admins", url: "/admin/admins", icon: ShieldCheck },
  { title: "Students", url: "/admin/students", icon: GraduationCap },
  { title: "Courses", url: "/admin/courses", icon: BookOpen },
  { title: "Feedback", url: "/admin/feedback", icon: MessageSquareText },
];

// ── Student nav items ────────────────────────────────────────────────────────
const USER_NAV: AdminNavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Courses", url: "/courses", icon: BookOpen },
  { title: "My Teams", url: "/teams", icon: Users },
  { title: "Peers", url: "/peers", icon: Sparkles },
  { title: "Profile", url: "/profile", icon: UserCircle },
];

const initialsOf = (name: string) =>
  name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "U";

// ── Shared user footer ───────────────────────────────────────────────────────
function SidebarUserFooter({
  user,
  onLogout,
  onAccountSettings,
}: Pick<SidebarProps, "user" | "onLogout" | "onAccountSettings">) {
  if (!user) return null;
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg">
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary/15 text-xs font-bold text-primary">
                    {initialsOf(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" side="top" align="start">
              <DropdownMenuItem onClick={onAccountSettings}>
                <UserCog />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

// ── Admin Sidebar content ────────────────────────────────────────────────────
export function AdminSidebarContent({
  navItems = ADMIN_NAV,
  user,
  onLogout,
  onAccountSettings,
}: SidebarProps) {
  const location = useLocation();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GripHorizontal className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Console</span>
                  <span className="truncate text-xs text-muted-foreground">Control Center</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.url === "/dashboard"
                    ? location.pathname === "/dashboard"
                    : location.pathname === item.url || location.pathname.startsWith(`${item.url}/`);
                return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith("/admin/settings")}
                  tooltip="Settings"
                >
                  <Link to="/admin/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarUserFooter user={user} onLogout={onLogout} onAccountSettings={onAccountSettings} />
    </Sidebar>
  );
}

// ── Student Sidebar content ──────────────────────────────────────────────────
export function UserSidebarContent({
  navItems = USER_NAV,
  user,
  onLogout,
  onAccountSettings,
}: SidebarProps) {
  const location = useLocation();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-purple-600 text-white">
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">TeamBuilder</span>
                  <span className="truncate text-xs text-muted-foreground">Student Workspace</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.url === "/dashboard"
                    ? location.pathname === "/dashboard"
                    : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarUserFooter user={user} onLogout={onLogout} onAccountSettings={onAccountSettings} />
    </Sidebar>
  );
}

// ── Admin Layout wrapper ─────────────────────────────────────────────────────
export function AdminLayout({ title, children, ...sidebarProps }: LayoutProps) {
  return (
    <SidebarProvider>
      <AdminSidebarContent {...sidebarProps} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-foreground">
              {title || "Admin Dashboard"}
            </h1>
            <Badge className="text-[10px] bg-amber-500/20 text-amber-600 border-amber-300/40 dark:text-amber-400">
              Admin
            </Badge>
          </div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ── User Layout wrapper ──────────────────────────────────────────────────────
export function UserLayout({ title, children, ...sidebarProps }: LayoutProps) {
  return (
    <SidebarProvider>
      <UserSidebarContent {...sidebarProps} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-foreground">
              {title || "My Workspace"}
            </h1>
            <Badge className="text-[10px] bg-purple-500/20 text-purple-600 border-purple-300/40 dark:text-purple-400">
              Student
            </Badge>
          </div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AdminLayout;