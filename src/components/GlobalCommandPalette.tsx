
import * as React from "react";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { supabase } from "@/supabase/client";
import { useAppDispatch } from "@/store/hooks";
import { startFocus } from "@/store/slices/focusSlice";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils"; // Ensure you have this utility
import { Button } from "@/components/ui/button"; // Import Button for the mobile trigger
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  User,
  LayoutDashboard,
  FileText,
  LogOut,
  Moon,
  Sun,
  Laptop,
  Plus,
  StickyNote,
  Zap,
  Home,
  Briefcase,
  PenTool,
  Copy,
  Terminal,
  Search,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { toast } from "sonner";

export default function GlobalCommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();

  // Handle Keyboard Shortcut (Cmd+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Handle Custom Event
  React.useEffect(() => {
    const handleCustomOpen = () => setOpen(true);
    document.addEventListener("open-command-palette", handleCustomOpen);
    return () =>
      document.removeEventListener("open-command-palette", handleCustomOpen);
  }, []);

  // Check Admin Status
  React.useEffect(() => {
    const checkUser = async () => {
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAdmin(!!session);
    };
    checkUser();

    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAdmin(!!session);
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/admin/login");
  };

  const copyCurrentUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("URL copied to clipboard");
  };

  const handleQuickFocus = () => {
    dispatch(
      startFocus({ durationMinutes: 25, taskTitle: "Quick Focus Session" }),
    );
    toast.success("Focus Mode Started (25m)");
  };

  return (
    <>
      {/* 
        MOBILE TRIGGER:
        Since mobile users can't press Cmd+K, we add a fixed Floating Action Button.
        Hidden on Desktop (md:hidden).
      */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg md:hidden bg-background/80 backdrop-blur-sm border-primary/20"
        aria-label="Open Command Palette"
      >
        <Search className="h-5 w-5" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        
        {/* 
           LAYOUT FIX: 
           On mobile, we use a dynamic height (60vh) so it doesn't get cut off 
           when the keyboard opens, but still leaves room. 
           On desktop, we stick to fixed pixels for a tighter look.
        */}
        <CommandList className={cn(
          "overflow-y-auto overflow-x-hidden",
          "max-h-[55vh] sm:max-h-[300px] lg:max-h-[450px]"
        )}>
          <CommandEmpty>No results found.</CommandEmpty>

          {isAdmin && (
            <>
              <CommandGroup heading="Quick Actions">
                <CommandItem
                  onSelect={() =>
                    runCommand(() => router.push("/admin/blog?create=true"))
                  }
                >
                  <PenTool className="mr-2 h-4 w-4" />
                  <span>Write New Post</span>
                  {!isMobile && <CommandShortcut>C P</CommandShortcut>}
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/admin/tasks"))}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Add Task</span>
                  {!isMobile && <CommandShortcut>C T</CommandShortcut>}
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/admin/notes"))}
                >
                  <StickyNote className="mr-2 h-4 w-4" />
                  <span>Jot Note</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(handleQuickFocus)}>
                  <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>Start Focus Timer</span>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Admin Navigation">
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/admin"))}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/admin/finance"))}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Finance</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() => router.push("/admin/calendar"))
                  }
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Calendar</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() => router.push("/admin/analytics"))
                  }
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  <span>Analytics</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() => router.push("/admin/settings"))
                  }
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/about"))}>
              <User className="mr-2 h-4 w-4" />
              <span>About</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/blog"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Blog</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/projects"))}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              <span>Projects</span>
            </CommandItem>
            {!isAdmin && (
              <CommandItem
                onSelect={() => runCommand(() => router.push("/admin/login"))}
              >
                <Terminal className="mr-2 h-4 w-4" />
                <span>Admin Login</span>
              </CommandItem>
            )}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="System">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Laptop className="mr-2 h-4 w-4" />
              <span>System Theme</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(copyCurrentUrl)}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Current URL</span>
            </CommandItem>
            {isAdmin && (
              <CommandItem
                onSelect={() => runCommand(handleLogout)}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}