import React, { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Timer,
  Loader2,
  Home,
  ChevronRight,
  Plus,
  StickyNote,
  ListTodo,
  Banknote,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/store/hooks";
import {
  useGetLearningDataQuery,
  useSignOutMutation,
} from "@/store/api/adminApi";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FocusTimer from "./focus/FocusTimer";
import Head from "next/head";
import { isSupabaseConfigured } from "@/lib/config";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "admin_sidebar_collapsed";

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const Breadcrumbs = () => {
  const router = useRouter();
  const cleanPath = router.asPath.split("?")[0];
  const pathSegments = cleanPath.split("/").filter((segment) => segment);

  if (pathSegments.length <= 1) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Home className="h-4 w-4" />
        <span>Dashboard</span>
      </div>
    );
  }

  return (
    <>
      <div className="md:hidden font-semibold text-lg capitalize tracking-tight truncate max-w-[200px]">
        {pathSegments[pathSegments.length - 1].replace(/-/g, " ")}
      </div>
      <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Admin
        </Link>
        {pathSegments.slice(1).map((segment, index) => {
          const isLast = index === pathSegments.slice(1).length - 1;
          const href = "/admin/" + pathSegments.slice(1, index + 2).join("/");

          return (
            <React.Fragment key={href}>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              {isLast ? (
                <span className="font-semibold text-foreground capitalize">
                  {segment.replace(/-/g, " ")}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-muted-foreground hover:text-foreground transition-colors capitalize"
                >
                  {segment.replace(/-/g, " ")}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
};

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // State for sidebar logic
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarInitialized, setIsSidebarInitialized] = useState(false);

  const { session, isLoading } = useAuthGuard();

  const pageTitle = title ? `${title} | Admin Panel` : "Admin Panel";

  const { activeSession, elapsedTime } = useAppSelector(
    (state) => state.learningSession,
  );
  
  const { data: learningData } = useGetLearningDataQuery(undefined, {
    skip: !isSupabaseConfigured,
  });
  const [signOut] = useSignOutMutation();

  // Load sidebar state on mount
  useEffect(() => {
    const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (savedState === "true") {
      setIsSidebarCollapsed(true);
    }
    // Mark as initialized to enable CSS transitions after initial paint
    // This prevents the sidebar from "animating" to closed state on refresh
    setTimeout(() => setIsSidebarInitialized(true), 100);
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newState));
  };

  const handleLogout = async () => {
    await signOut().unwrap();
    router.replace("/admin/login");
  };

  const triggerCommandPalette = () => {
    document.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  const currentTopicName = activeSession
    ? learningData?.topics.find((t) => t.id === activeSession.topic_id)?.title
    : null;

  if (!isSupabaseConfigured) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-secondary/30 flex flex-col">
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
      </Head>
      {/* GlobalCommandPalette is rendered in _app.tsx to avoid duplicates during page transitions */}
      <FocusTimer />

      <div
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col border-r border-border bg-background",
          // Only animate width changes after initialization
          isSidebarInitialized && "transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        <Sidebar
          className="border-r-0"
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={toggleSidebar}
        />
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar onLinkClick={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex flex-col min-h-[100dvh]",
          // Only animate padding changes after initialization
          isSidebarInitialized && "transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "lg:pl-16" : "lg:pl-64",
        )}
      >
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/80 px-4 shadow-sm backdrop-blur-sm sm:gap-x-6 sm:px-6 lg:px-8 justify-between lg:justify-start">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden -ml-2"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open sidebar</span>
            </Button>
            <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-x-2 lg:gap-x-6 lg:ml-auto">
            {activeSession && (
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/learning")}
                className="flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1.5 text-xs lg:text-sm font-semibold text-primary transition-colors hover:bg-primary/20 lg:px-3"
              >
                <Timer className="size-4 animate-pulse" />
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline truncate max-w-[100px] lg:max-w-[150px]">
                    {currentTopicName || "Session"}
                  </span>
                  {elapsedTime === null ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <span className="font-mono tracking-wider">
                      {formatTime(elapsedTime)}
                    </span>
                  )}
                </div>
              </Button>
            )}

            <Separator orientation="vertical" className="h-6 hidden lg:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-1 lg:px-4"
                >
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarFallback>
                      {session?.user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium">
                    {session?.user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Back to Portfolio
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 py-4 lg:py-6 pb-20 lg:pb-6">
          <div className="px-4 lg:px-6 h-full">{children}</div>
        </main>
      </div>

      {/* Desktop FAB - Quick Add */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="hidden lg:flex fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 text-primary-foreground"
            size="icon"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Quick Add</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="mb-2 w-48">
          <DropdownMenuLabel>Quick Add</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/admin/tasks")}>
            <ListTodo className="mr-2 h-4 w-4" /> New Task
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/admin/notes")}>
            <StickyNote className="mr-2 h-4 w-4" /> New Note
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/admin/finance")}>
            <Banknote className="mr-2 h-4 w-4" /> New Transaction
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mobile Bottom Navigation */}
      {/* <MobileBottomNav
        onMenuClick={() => setMobileSidebarOpen(true)}
        onSearchClick={triggerCommandPalette}
        onAddClick={() => setQuickAddOpen(!quickAddOpen)}
      /> */}

      {/* Mobile Quick Add Dropdown - appears above bottom nav */}
      {quickAddOpen && (
        <div className="fixed bottom-16 left-0 right-0 z-50 p-4 lg:hidden">
          <div className="bg-background border border-border rounded-lg shadow-lg p-2 space-y-1">
            <button
              onClick={() => {
                router.push("/admin/tasks");
                setQuickAddOpen(false);
              }}
              className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-secondary text-left"
            >
              <ListTodo className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">New Task</span>
            </button>
            <button
              onClick={() => {
                router.push("/admin/notes");
                setQuickAddOpen(false);
              }}
              className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-secondary text-left"
            >
              <StickyNote className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">New Note</span>
            </button>
            <button
              onClick={() => {
                router.push("/admin/finance");
                setQuickAddOpen(false);
              }}
              className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-secondary text-left"
            >
              <Banknote className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">New Transaction</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay for quick add dropdown */}
      {quickAddOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setQuickAddOpen(false)}
        />
      )}
    </div>
  );
}