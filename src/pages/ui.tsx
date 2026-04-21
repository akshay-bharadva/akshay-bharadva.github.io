import Layout from "@/components/layout";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- Icon Imports ---
import {
  Terminal,
  Settings,
  User as UserIcon,
  CreditCard,
  CalendarIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Palette,
  ChevronsUpDown,
  Link2,
  ImageIcon,
  AlignLeft,
  Bold,
  Italic,
  Underline,
  CheckCircle,
  XCircle,
  Info,
  MessageSquare,
  Code,
  List,
  ListOrdered,
  AlertTriangle,
  Loader2,
  Github,
  LogOut,
  PlusCircle,
  User,
  Home,
  Search,
  X,
} from "lucide-react";

// --- UI Component Imports ---
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, Line, LineChart } from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { toast as sonnerToast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast as useShadcnToast, useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// DYNAMICALLY IMPORT THE CALENDAR for client-side only rendering
const Calendar = dynamic(
  () => import("@/components/ui/calendar").then((mod) => mod.Calendar),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-md border p-4">Loading Calendar...</div>
    ),
  },
);

interface Variation {
  id: string;
  name: string;
}
interface ComponentDocSectionItem {
  id: string;
  name: string;
  icon: JSX.Element;
  variations?: Variation[];
}

const ComponentDocSectionsList: ComponentDocSectionItem[] = [
  {
    id: "accordion",
    name: "Accordion",
    icon: <AlignLeft className="mr-2 size-4" />,
    variations: [
      { id: "accordion-basic", name: "Basic" },
      { id: "accordion-multiple", name: "Multiple Open" },
    ],
  },
  {
    id: "alertDialog",
    name: "Alert Dialog",
    icon: <MessageSquare className="mr-2 size-4" />,
    variations: [{ id: "alertDialog-confirm", name: "Confirmation" }],
  },
  {
    id: "alert",
    name: "Alert",
    icon: <Info className="mr-2 size-4" />,
    variations: [
      { id: "alert-default", name: "Default" },
      { id: "alert-destructive", name: "Destructive" },
    ],
  },
  {
    id: "aspectRatio",
    name: "Aspect Ratio",
    icon: <ImageIcon className="mr-2 size-4" />,
  },
  { id: "avatar", name: "Avatar", icon: <User className="mr-2 size-4" /> },
  {
    id: "badge",
    name: "Badge",
    icon: <Palette className="mr-2 size-4" />,
    variations: [{ id: "badge-variants", name: "Variants" }],
  },
  {
    id: "breadcrumb",
    name: "Breadcrumb",
    icon: <Home className="mr-2 size-4" />,
  },
  {
    id: "button",
    name: "Button",
    icon: <Palette className="mr-2 size-4" />,
    variations: [
      { id: "button-variants", name: "Variants" },
      { id: "button-sizes", name: "Sizes" },
      { id: "button-states", name: "States" },
    ],
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: <CalendarIcon className="mr-2 size-4" />,
  },
  {
    id: "card",
    name: "Card",
    icon: <Palette className="mr-2 size-4" />,
    variations: [
      { id: "card-basic", name: "Basic Card" },
      { id: "card-form", name: "With Form" },
    ],
  },
  {
    id: "carousel",
    name: "Carousel",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "checkbox",
    name: "Checkbox",
    icon: <CheckCircle className="mr-2 size-4" />,
    variations: [
      { id: "checkbox-basic", name: "Basic" },
      { id: "checkbox-disabled", name: "Disabled" },
    ],
  },
  {
    id: "collapsible",
    name: "Collapsible",
    icon: <ChevronsUpDown className="mr-2 size-4" />,
  },
  {
    id: "command",
    name: "Command",
    icon: <Search className="mr-2 size-4" />,
    variations: [{ id: "command-dialog", name: "Dialog" }],
  },
  {
    id: "contextMenu",
    name: "Context Menu",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "dialog",
    name: "Dialog",
    icon: <MessageSquare className="mr-2 size-4" />,
  },
  { id: "drawer", name: "Drawer", icon: <Palette className="mr-2 size-4" /> },
  {
    id: "dropdownMenu",
    name: "Dropdown Menu",
    icon: <ChevronsUpDown className="mr-2 size-4" />,
  },
  {
    id: "hoverCard",
    name: "Hover Card",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "input",
    name: "Input",
    icon: <Palette className="mr-2 size-4" />,
    variations: [
      { id: "input-basic", name: "Text" },
      { id: "input-disabled", name: "Disabled" },
    ],
  },
  {
    id: "inputOtp",
    name: "Input OTP",
    icon: <Code className="mr-2 size-4" />,
    variations: [{ id: "inputOtp-6digit", name: "6-Digit" }],
  },
  { id: "label", name: "Label", icon: <Palette className="mr-2 size-4" /> },
  { id: "menubar", name: "Menubar", icon: <Palette className="mr-2 size-4" /> },
  {
    id: "navigationMenu",
    name: "Navigation Menu",
    icon: <Link2 className="mr-2 size-4" />,
  },
  {
    id: "pagination",
    name: "Pagination",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "popover",
    name: "Popover",
    icon: <MessageSquare className="mr-2 size-4" />,
  },
  {
    id: "progress",
    name: "Progress",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "radioGroup",
    name: "Radio Group",
    icon: <ListOrdered className="mr-2 size-4" />,
  },
  {
    id: "resizable",
    name: "Resizable",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "scrollArea",
    name: "Scroll Area",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "select",
    name: "Select",
    icon: <ChevronsUpDown className="mr-2 size-4" />,
    variations: [{ id: "select-basic", name: "Basic" }],
  },
  {
    id: "separator",
    name: "Separator",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "sheet",
    name: "Sheet",
    icon: <Palette className="mr-2 size-4" />,
    variations: [{ id: "sheet-sides", name: "All Sides" }],
  },
  {
    id: "skeleton",
    name: "Skeleton",
    icon: <Palette className="mr-2 size-4" />,
  },
  { id: "slider", name: "Slider", icon: <Palette className="mr-2 size-4" /> },
  {
    id: "sonner",
    name: "Sonner Toasts",
    icon: <MessageSquare className="mr-2 size-4" />,
  },
  { id: "switch", name: "Switch", icon: <Palette className="mr-2 size-4" /> },
  { id: "table", name: "Table", icon: <List className="mr-2 size-4" /> },
  { id: "tabs", name: "Tabs", icon: <Palette className="mr-2 size-4" /> },
  {
    id: "textarea",
    name: "Textarea",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "toastShadcn",
    name: "Toast (Shadcn)",
    icon: <MessageSquare className="mr-2 size-4" />,
  },
  {
    id: "toggle",
    name: "Toggle",
    icon: <Palette className="mr-2 size-4" />,
    variations: [{ id: "toggle-variants", name: "Variants" }],
  },
  {
    id: "toggleGroup",
    name: "Toggle Group",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "tooltip",
    name: "Tooltip",
    icon: <MessageSquare className="mr-2 size-4" />,
  },
];

const ComponentDocSection: React.FC<{
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ id, title, children, className }) => (
  <section
    id={id}
    className={cn(
      "mb-16 scroll-mt-24 rounded-lg bg-blueprint-bg p-6",
      className,
    )}
  >
    <header className="mb-6 border-b pb-4">
      <h2 className="font-mono text-2xl font-bold text-foreground">{title}</h2>
    </header>
    <div className="space-y-10">{children}</div>
  </section>
);

const VariationDisplay: React.FC<{
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ id, title, description, children, className }) => (
  <div
    id={id}
    className={cn(
      "scroll-mt-28 rounded-md border bg-background/50 p-4",
      className,
    )}
  >
    <h3 className="mb-1 text-lg font-semibold">{title}</h3>
    {description && (
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
    )}
    <div className="flex flex-wrap items-center gap-4">{children}</div>
  </div>
);

interface SidebarProps {
  ComponentDocSectionsList: ComponentDocSectionItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ ComponentDocSectionsList }) => {
  const [mounted, setMounted] = useState(false);
  const [activeSidebarSection, setActiveSidebarSection] = useState<
    string | null
  >(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch before mount
  if (!mounted) return null;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSidebarSection(id);
    }
  };

  return (
    <div className="space-y-2 h-screen overflow-y-scroll">
      {ComponentDocSectionsList.map((section, idx) => (
        <div key={`${section.id}-${idx}`}>
          <Button
            variant={
              activeSidebarSection === section.id ? "secondary" : "ghost"
            }
            className="w-full justify-start"
            onClick={() => scrollToSection(section.id)}
          >
            {/* Ensure icon element is stable — cloneElement ensures consistent keys */}
            {React.cloneElement(section.icon, { className: "mr-2 h-4 w-4" })}
            {section.name}
          </Button>

          {section.variations && activeSidebarSection === section.id && (
            <div className="ml-4 pl-4 border-l my-1 space-y-1">
              {section.variations.map((variation, vIdx) => (
                <div
                  key={`${variation.id}-${vIdx}`}
                  className="w-full justify-start text-xs h-8"
                >
                  {variation.name}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
export default function UiPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progress, setProgress] = useState(13);
  const [activeSidebarSection, setActiveSidebarSection] = useState<
    string | null
  >(ComponentDocSectionsList[0]?.id || null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { toast: shadcnToast } = useShadcnToast();

  useEffect(() => {
    const timer = setTimeout(() => setProgress(77), 500);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            const mainComponent = ComponentDocSectionsList.find(
              (c) =>
                c.id === sectionId ||
                c.variations?.some((v) => v.id === sectionId),
            );
            if (mainComponent) setActiveSidebarSection(mainComponent.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0.1 },
    );

    const elements = ComponentDocSectionsList.flatMap((s) => [
      document.getElementById(s.id),
      ...(s.variations?.map((v) => document.getElementById(v.id)) ?? []),
    ]).filter(Boolean);
    elements.forEach((el) => observer.observe(el!));

    return () => {
      clearTimeout(timer);
      elements.forEach((el) => observer.unobserve(el!));
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 120; // Adjust for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + mainContentRef.current!.scrollTop - headerOffset;
      mainContentRef.current!.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <header className="mb-16 text-center">
          <h1 className="font-mono text-5xl font-black tracking-tighter text-foreground">
            [UI_BLUEPRINT]
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            A showcase of all available components with the "Digital Blueprint"
            theme.
          </p>
        </header>

        <div className="flex flex-col md:flex-row md:gap-12">
          <aside className="w-full md:w-64 md:sticky top-28 h-fit mb-12">
            <h2 className="font-mono text-sm uppercase text-muted-foreground mb-4">
              Components
            </h2>
            <div className="flex flex-col gap-1">
              <Sidebar ComponentDocSectionsList={ComponentDocSectionsList} />
            </div>
          </aside>

          <main ref={mainContentRef} className="w-full">
            <ComponentDocSection id="accordion" title="Accordion">
              <VariationDisplay
                id="accordion-basic"
                title="Single Item"
                description="Only one item can be open at a time."
              >
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>System Check</AccordionTrigger>
                    <AccordionContent>
                      All systems operational.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Logs</AccordionTrigger>
                    <AccordionContent>No new errors reported.</AccordionContent>
                  </AccordionItem>
                </Accordion>
              </VariationDisplay>
              <VariationDisplay
                id="accordion-multiple"
                title="Multiple Items"
                description="Multiple items can be open simultaneously."
              >
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Dependencies</AccordionTrigger>
                    <AccordionContent>
                      React, TailwindCSS, Framer Motion.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Dev Dependencies</AccordionTrigger>
                    <AccordionContent>
                      ESLint, Prettier, TypeScript.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="alertDialog" title="Alert Dialog">
              <VariationDisplay
                id="alertDialog-confirm"
                title="Confirmation Prompt"
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Project</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action is irreversible. All project data will be
                        permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Confirm & Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="alert" title="Alert">
              <VariationDisplay id="alert-default" title="Informational Alert">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>System Update</AlertTitle>
                  <AlertDescription>
                    A new version of the CLI is available. Run `npm i -g
                    @latest`.
                  </AlertDescription>
                </Alert>
              </VariationDisplay>
              <VariationDisplay
                id="alert-destructive"
                title="Destructive/Error Alert"
              >
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>API Error</AlertTitle>
                  <AlertDescription>
                    Failed to fetch data from the endpoint. Please try again.
                  </AlertDescription>
                </Alert>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="aspectRatio" title="Aspect Ratio">
              <VariationDisplay title="16:9 Container">
                <div className="w-full">
                  <AspectRatio
                    ratio={16 / 9}
                    className="bg-muted rounded-md flex items-center justify-center"
                  >
                    <p className="font-mono text-muted-foreground">16:9</p>
                  </AspectRatio>
                </div>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="avatar" title="Avatar">
              <VariationDisplay title="User Avatar">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@demouser"
                  />
                  <AvatarFallback>DU</AvatarFallback>
                </Avatar>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="badge" title="Badge">
              <VariationDisplay id="badge-variants" title="Badge Variants">
                <Badge>Active</Badge>
                <Badge variant="secondary">Beta</Badge>
                <Badge variant="destructive">Deprecated</Badge>
                <Badge variant="outline">Read-Only</Badge>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="breadcrumb" title="Breadcrumb">
              <VariationDisplay title="File Path Navigation">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">/home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/ui">/ui</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>breadcrumb</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="button" title="Button">
              <VariationDisplay id="button-variants" title="Variants">
                <Button>Default</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </VariationDisplay>
              <VariationDisplay id="button-sizes" title="Sizes">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
              </VariationDisplay>
              <VariationDisplay id="button-states" title="States">
                <Button size="icon">
                  <Settings className="size-4" />
                </Button>
                <Button disabled>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Loading
                </Button>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="calendar" title="Calendar">
              <VariationDisplay title="Date Picker">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="card" title="Card">
              <VariationDisplay id="card-basic" title="Basic Card">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Project Card</CardTitle>
                    <CardDescription>
                      A standard card component.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Use cards to group related information.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary">View</Button>
                  </CardFooter>
                </Card>
              </VariationDisplay>
              <VariationDisplay id="card-form" title="Card with Form">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Login</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-card-ui">Email</Label>
                      <Input id="email-card-ui" type="email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pass-card-ui">Password</Label>
                      <Input id="pass-card-ui" type="password" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Sign In</Button>
                  </CardFooter>
                </Card>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="carousel" title="Carousel">
              <VariationDisplay title="Image Gallery">
                <Carousel className="w-full max-w-xs">
                  <CarouselContent>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <CarouselItem key={i}>
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6 bg-secondary">
                            <span className="text-3xl font-semibold">
                              {i + 1}
                            </span>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="checkbox" title="Checkbox">
              <VariationDisplay id="checkbox-basic" title="Standard Checkbox">
                <div className="flex items-center space-x-2">
                  <Checkbox id="cb-ui-1" />
                  <Label htmlFor="cb-ui-1">Enable feature</Label>
                </div>
              </VariationDisplay>
              <VariationDisplay
                id="checkbox-disabled"
                title="Disabled Checkbox"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox id="cb-ui-2" disabled />
                  <Label htmlFor="cb-ui-2">Feature disabled</Label>
                </div>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="collapsible" title="Collapsible">
              <VariationDisplay title="Expandable Section">
                <Collapsible className="w-full">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      Show Advanced <ChevronsUpDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 rounded-md border p-4 bg-background">
                    Advanced configuration options.
                  </CollapsibleContent>
                </Collapsible>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="command" title="Command">
              <VariationDisplay id="command-dialog" title="Command Palette">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Command</Button>
                  </DialogTrigger>
                  <DialogContent className="p-0">
                    <div className="p-4 border-b">
                      <Input placeholder="Search..." />
                    </div>
                    <p className="p-4 text-sm text-muted-foreground">
                      Command items would go here.
                    </p>
                  </DialogContent>
                </Dialog>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="contextMenu" title="Context Menu">
              <VariationDisplay title="Right-Click Menu">
                <ContextMenu>
                  <ContextMenuTrigger className="flex h-[150px] w-full items-center justify-center rounded-md border border-dashed text-sm">
                    Right-click here
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-64">
                    <ContextMenuItem>Profile</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem>Logout</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="dialog" title="Dialog">
              <VariationDisplay title="Modal Dialog">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>System Configuration</DialogTitle>
                    </DialogHeader>
                    Your settings go here.
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">Close</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="drawer" title="Drawer">
              <VariationDisplay title="Bottom Sheet">
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline">Open Drawer</Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Mobile Menu</DrawerTitle>
                    </DrawerHeader>
                    <p className="p-4">Menu items...</p>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="dropdownMenu" title="Dropdown Menu">
              <VariationDisplay title="User Profile Menu">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">User Profile</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Demo User</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Github className="mr-2 h-4 w-4" />
                      <span>GitHub</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="hoverCard" title="Hover Card">
              <VariationDisplay title="Profile Preview">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="link">@demouser</Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>DU</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">Demo User</h4>
                        <p className="text-sm text-muted-foreground">
                          Full-Stack Developer
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="input" title="Input">
              <VariationDisplay id="input-basic" title="Text Input">
                <Input type="text" placeholder="API Key..." />
              </VariationDisplay>
              <VariationDisplay id="input-disabled" title="Disabled Input">
                <Input type="text" placeholder="Read-only value" disabled />
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="inputOtp" title="Input OTP">
              <VariationDisplay id="inputOtp-6digit" title="6-Digit Code">
                <InputOTP maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="label" title="Label">
              <VariationDisplay title="Form Label">
                <div className="w-full space-y-2">
                  <Label htmlFor="labeled-input-ui">Server Name</Label>
                  <Input
                    id="labeled-input-ui"
                    placeholder="production-server-1"
                  />
                </div>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="menubar" title="Menubar">
              <VariationDisplay title="Application Menu">
                <Menubar>
                  <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>New</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>Save</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger>Edit</MenubarTrigger>
                  </MenubarMenu>
                </Menubar>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="navigationMenu" title="Navigation Menu">
              <VariationDisplay title="Main Navigation">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/ui"
                                className={cn(
                                  navigationMenuTriggerStyle(),
                                  "flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md",
                                )}
                              >
                                Home
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link href="/" legacyBehavior passHref>
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          Documentation
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="pagination" title="Pagination">
              <VariationDisplay title="Page Controls">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        2
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="popover" title="Popover">
              <VariationDisplay title="Popover Menu">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Settings</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Dimensions</h4>
                        <p className="text-sm text-muted-foreground">
                          Set the dimensions for the layer.
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="progress" title="Progress">
              <VariationDisplay title="Loading Bar">
                <Progress value={progress} className="w-full" />
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="radioGroup" title="Radio Group">
              <VariationDisplay title="Deployment Region">
                <RadioGroup defaultValue="us-east">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="us-east" id="rg1" />
                    <Label htmlFor="rg1">US-East</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="eu-west" id="rg2" />
                    <Label htmlFor="rg2">EU-West</Label>
                  </div>
                </RadioGroup>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="resizable" title="Resizable">
              <VariationDisplay title="Resizable Panels">
                <ResizablePanelGroup
                  direction="horizontal"
                  className="h-48 rounded-lg border"
                >
                  <ResizablePanel defaultSize={25}>
                    <div className="flex h-full items-center justify-center p-6">
                      <span className="font-semibold">Sidebar</span>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={75}>
                    <div className="flex h-full items-center justify-center p-6">
                      <span className="font-semibold">Content</span>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="scrollArea" title="Scroll Area">
              <VariationDisplay title="Log Output">
                <ScrollArea className="h-48 w-full rounded-md border p-4 font-mono text-sm">
                  {"Log entry...".repeat(50)}
                </ScrollArea>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="select" title="Select">
              <VariationDisplay id="select-basic" title="Server Selection">
                <Select>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a server" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Production</SelectLabel>
                      <SelectItem value="prod-1">Production-1</SelectItem>
                      <SelectItem value="prod-2">Production-2</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Staging</SelectLabel>
                      <SelectItem value="stg-1">Staging-1</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="separator" title="Separator">
              <VariationDisplay title="Content Divider">
                <div className="w-full text-center">
                  <p>Section A</p>
                  <Separator className="my-4" />
                  <p>Section B</p>
                </div>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="sheet" title="Sheet">
              <VariationDisplay id="sheet-sides" title="Side Panels">
                <div className="grid grid-cols-2 gap-2">
                  {(["left", "right", "top", "bottom"] as const).map((side) => (
                    <Sheet key={side}>
                      <SheetTrigger asChild>
                        <Button variant="outline">{side}</Button>
                      </SheetTrigger>
                      <SheetContent side={side}>
                        <div className="flex justify-between items-center">
                          <SheetHeader>
                            <SheetTitle>Panel ({side})</SheetTitle>
                          </SheetHeader>
                          <SheetClose asChild>
                            <Button type="button" variant="ghost">
                              <X />
                            </Button>
                          </SheetClose>
                        </div>
                      </SheetContent>
                    </Sheet>
                  ))}
                </div>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="skeleton" title="Skeleton">
              <VariationDisplay title="Loading Placeholder">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="slider" title="Slider">
              <VariationDisplay title="Volume Control">
                <Slider
                  defaultValue={[50]}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="sonner" title="Sonner Toasts">
              <VariationDisplay title="Actionable Notifications">
                <Button
                  onClick={() =>
                    sonnerToast.success("Event has been created.", {
                      description: "Sunday, December 03, 2023 at 9:00 AM",
                    })
                  }
                >
                  Show Success
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => sonnerToast.error("Deployment failed.")}
                >
                  Show Error
                </Button>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="switch" title="Switch">
              <VariationDisplay title="Feature Flag">
                <div className="flex items-center space-x-2">
                  <Switch id="switch-ui" />
                  <Label htmlFor="switch-ui">Enable Beta Features</Label>
                </div>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="table" title="Table">
              <VariationDisplay title="Service Status">
                <Table>
                  <TableCaption>A list of deployed services.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Region</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>API Gateway</TableCell>
                      <TableCell>
                        <Badge>Running</Badge>
                      </TableCell>
                      <TableCell>us-east-1</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Database</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Down</Badge>
                      </TableCell>
                      <TableCell>us-east-1</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="tabs" title="Tabs">
              <VariationDisplay title="Configuration Panels">
                <Tabs defaultValue="account" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account">
                    Account settings panel.
                  </TabsContent>
                  <TabsContent value="password">
                    Password settings panel.
                  </TabsContent>
                </Tabs>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="textarea" title="Textarea">
              <VariationDisplay title="Commit Message">
                <Textarea placeholder="Enter your commit message..." />
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="toastShadcn" title="Toast (Shadcn)">
              <VariationDisplay title="Event Notifications">
                <Button
                  onClick={() =>
                    shadcnToast({
                      title: "Scheduled: Catch up",
                      description: "Friday, February 10, 2023 at 5:57 PM",
                    })
                  }
                >
                  Show Toast
                </Button>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="toggle" title="Toggle">
              <VariationDisplay id="toggle-variants" title="Toggle Buttons">
                <Toggle aria-label="Toggle bold">
                  <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle variant="outline" aria-label="Toggle italic">
                  <Italic className="h-4 w-4" />
                </Toggle>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="toggleGroup" title="Toggle Group">
              <VariationDisplay title="Text Formatting">
                <ToggleGroup type="multiple">
                  <ToggleGroupItem value="bold">
                    <Bold className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="italic">
                    <Italic className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="underline">
                    <Underline className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </VariationDisplay>
            </ComponentDocSection>
            <ComponentDocSection id="tooltip" title="Tooltip">
              <VariationDisplay title="Icon Button Hint">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add new item</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </VariationDisplay>
            </ComponentDocSection>
          </main>
        </div>
      </div>
    </Layout>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
