import { useRouter } from "next/router";
import { Home, Search, Plus, Menu, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

interface MobileBottomNavProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
  onAddClick: () => void;
  className?: string;
  customItems?: NavItem[];
}

export default function MobileBottomNav({
  onMenuClick,
  onSearchClick,
  onAddClick,
  className,
  customItems,
}: MobileBottomNavProps) {
  const router = useRouter();
  const isHome = router.pathname === "/admin";

  const defaultItems: NavItem[] = [
    {
      icon: Home,
      label: "Home",
      href: "/admin",
      active: isHome,
    },
    {
      icon: Search,
      label: "Search",
      onClick: onSearchClick,
    },
    {
      icon: Plus,
      label: "Add",
      onClick: onAddClick,
    },
    {
      icon: Menu,
      label: "Menu",
      onClick: onMenuClick,
    },
  ];

  const items = customItems || defaultItems;

  const handleClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "safe-area-inset-bottom",
        className
      )}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {items.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 h-12 rounded-lg",
              item.active && "text-primary"
            )}
            onClick={() => handleClick(item)}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
