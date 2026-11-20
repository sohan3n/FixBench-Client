"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeCheck,
  Briefcase,
  CalendarCheck,
  ClipboardCheck,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Receipt,
  Search,
  ShieldCheck,
  UserCircle,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import type { AppUserRole } from "@/lib/auth-redirect";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

export interface DashboardUserSummary {
  name: string;
  email: string;
  image?: string | null;
  role: AppUserRole;
  plan?: string;
}

interface SidebarNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

const ROLE_MENU_ITEMS: Record<AppUserRole, SidebarNavItem[]> = {
  customer: [
    {
      label: "Overview",
      href: "/dashboard/customer",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "My Bookings",
      href: "/dashboard/customer/bookings",
      icon: CalendarCheck,
    },
    {
      label: "Payment History",
      href: "/dashboard/customer/payments",
      icon: CreditCard,
    },
    {
      label: "My Profile",
      href: "/dashboard/profile",
      icon: UserCircle,
    },
  ],
  technician: [
    {
      label: "Overview",
      href: "/dashboard/technician",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Add a Service",
      href: "/dashboard/technician/add-service",
      icon: PlusCircle,
    },
    {
      label: "My Services",
      href: "/dashboard/technician/my-services",
      icon: Wrench,
    },
    {
      label: "Manage Requests",
      href: "/dashboard/technician/requests",
      icon: Briefcase,
    },
    {
      label: "My Profile",
      href: "/dashboard/profile",
      icon: UserCircle,
    },
  ],
  admin: [
    {
      label: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Manage Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      label: "Service Approval",
      href: "/dashboard/admin/services",
      icon: ClipboardCheck,
    },
    {
      label: "All Bookings",
      href: "/dashboard/admin/bookings",
      icon: CalendarCheck,
    },
    {
      label: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: Receipt,
    },
    {
      label: "My Profile",
      href: "/dashboard/profile",
      icon: UserCircle,
    },
  ],
};

function getRoleBadgeStyle(role: AppUserRole): string {
  switch (role) {
    case "admin":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    case "technician":
      return "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
  }
}

interface DashboardShellProps {
  initialUser: DashboardUserSummary;
  children: React.ReactNode;
}

export function DashboardShell({
  initialUser,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: liveSession } = authClient.useSession();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const liveUser = liveSession?.user as
    | {
        name?: string;
        email?: string;
        image?: string | null;
        role?: string;
        plan?: string;
      }
    | undefined;

  const activeName = liveUser?.name || initialUser.name;
  const activeEmail = liveUser?.email || initialUser.email;
  const activeImage =
    liveUser?.image !== undefined ? liveUser.image : initialUser.image;
  const activeRole: AppUserRole =
    liveUser?.role === "admin" ||
    liveUser?.role === "technician" ||
    liveUser?.role === "customer"
      ? liveUser.role
      : initialUser.role;
  const isProTechnician =
    activeRole === "technician" &&
    (liveUser?.plan === "pro" || initialUser.plan === "pro");

  const menuItems = ROLE_MENU_ITEMS[activeRole];

  const isItemActive = (item: SidebarNavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname?.startsWith(`${item.href}/`);
  };

  const currentSection =
    menuItems.find((item) => isItemActive(item))?.label || "Dashboard";

  const initials = (activeName || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  }

  function renderSidebarContent(isMobile = false) {
    const collapsed = !isMobile && desktopCollapsed;

    return (
      <div className="flex h-full flex-col justify-between bg-white dark:bg-slate-900">
        <div>
          {/* Sidebar Brand Header */}
          <div
            className={`flex h-16 items-center border-b border-slate-200/80 dark:border-slate-800 ${
              collapsed ? "justify-center px-2" : "justify-between px-5"
            }`}
          >
            {collapsed ? (
              <Link
                href="/"
                title="FixBench Home"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs"
              >
                <Wrench className="h-4 w-4" />
              </Link>
            ) : (
              <BrandLogo variant="navbar" />
            )}

            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close sidebar"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Role Workspace Banner */}
          {!collapsed && (
            <div className="px-4 pt-5 pb-2">
              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    {activeRole} Bench
                  </span>
                </div>
                {isProTechnician && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                    <BadgeCheck className="h-3 w-3" />
                    Pro
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Primary Role Navigation */}
          <nav
            aria-label="Dashboard Navigation"
            className="mt-3 space-y-1 px-3"
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                    collapsed ? "justify-center px-2" : "gap-3 px-3.5"
                  } ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      active
                        ? "text-white"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Public Links & Sign Out */}
        <div className="space-y-1 border-t border-slate-200/80 p-3 dark:border-slate-800">
          <Link
            href="/"
            title={collapsed ? "Back to Home" : undefined}
            className={`flex items-center rounded-xl py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 ${
              collapsed ? "justify-center px-2" : "gap-3 px-3.5"
            }`}
          >
            <Home className="h-4 w-4 shrink-0 text-slate-400" />
            {!collapsed && <span>Back to Home</span>}
          </Link>

          <Link
            href="/services"
            title={collapsed ? "Browse Services" : undefined}
            className={`flex items-center rounded-xl py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 ${
              collapsed ? "justify-center px-2" : "gap-3 px-3.5"
            }`}
          >
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            {!collapsed && <span>Browse Services</span>}
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            title={collapsed ? "Sign Out" : undefined}
            className={`flex w-full items-center rounded-xl py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 ${
              collapsed ? "justify-center px-2" : "gap-3 px-3.5"
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden transition-all duration-200 lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:flex-col lg:border-r lg:border-slate-200/80 dark:lg:border-slate-800 ${
          desktopCollapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile / Tablet Slide-Over Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[82vw] border-r border-slate-200 dark:border-slate-800">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Workspace Column */}
      <div
        className={`flex min-w-0 flex-1 flex-col transition-all duration-200 ${
          desktopCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Sticky Dashboard Top Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open dashboard menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={() => setDesktopCollapsed((prev) => !prev)}
              aria-label={
                desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              title={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 lg:inline-flex"
            >
              {desktopCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>

            <h1 className="font-heading text-base font-bold text-slate-900 dark:text-white sm:text-lg">
              {currentSection}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1.5 pr-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80"
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={activeName}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {initials}
                </span>
              )}

              <div className="hidden text-left sm:block">
                <p className="max-w-[130px] truncate text-xs font-bold text-slate-900 dark:text-white">
                  {activeName}
                </p>
                <p className="max-w-[130px] truncate text-[10px] text-slate-500 dark:text-slate-400">
                  {activeEmail}
                </p>
              </div>

              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getRoleBadgeStyle(
                  activeRole
                )}`}
              >
                {activeRole}
              </span>
            </Link>
          </div>
        </header>

        {/* Active Dashboard Page Content */}
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}