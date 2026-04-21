import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Terminal,
  CircleDashed,
  Layers,
  Clock,
  Activity,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useMemo } from "react";
import { SOCIAL_ICONS } from "@/lib/social-icons";

const HeroSkeleton = () => (
  <section className="py-12 lg:py-20 grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
    <div className="lg:col-span-7 space-y-8">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-24 w-full max-w-2xl" />
      <Skeleton className="h-8 w-full max-w-lg" />
      <Skeleton className="h-32 w-full max-w-xl" />
      <div className="flex gap-4">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
    <div className="lg:col-span-5">
      <Skeleton className="h-[500px] w-full rounded-xl" />
    </div>
  </section>
);

function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!time) return <span className="tabular-nums">00:00:00</span>;
  return (
    <span className="tabular-nums">
      {time.toLocaleTimeString("en-US", { hour12: false })}
    </span>
  );
}

function Uptime() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return (
    <span className="tabular-nums">
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:
      {String(s).padStart(2, "0")}
    </span>
  );
}

/** Kinetic text — reveals each character with a staggered wave animation */
function KineticText({ text }: { text: string }) {
  const chars = useMemo(() => text.split(""), [text]);

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.3 } },
      }}
      aria-label={text}
    >
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
          variants={{
            hidden: { opacity: 0, y: 40, rotateX: -90 },
            visible: {
              opacity: 1,
              y: 0,
              rotateX: 0,
              transition: {
                type: "spring",
                damping: 12,
                stiffness: 200,
              },
            },
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

/** Rotating subtitle — cycles through titles with a morphing effect */
function RotatingTitle({ titles }: { titles: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (titles.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [titles.length]);

  return (
    <span className="relative inline-flex overflow-hidden h-[1.3em] align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={titles[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {titles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Tiny animated bar chart for visual flair */
function MiniBarChart() {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3, 0.75].map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-primary/60"
          animate={{ height: [`${h * 100}%`, `${(1 - h) * 60 + 20}%`, `${h * 100}%`] }}
          transition={{
            repeat: Infinity,
            duration: 1.5 + Math.random() * 1,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  const { data: content, isLoading } = useGetSiteIdentityQuery();

  if (isLoading || !content) return <HeroSkeleton />;

  const { profile_data: hero, social_links: socials } = content;
  const { status_panel } = hero;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="py-10 md:py-14 relative">
      {/* Decorative blur orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left Content */}
        <div
          className={cn(
            "flex flex-col gap-6 relative z-10",
            status_panel.show
              ? "lg:col-span-7"
              : "lg:col-span-12 text-center items-center",
          )}
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 text-primary font-mono text-sm tracking-widest uppercase"
          >
            <Terminal className="size-4" />
            <span>System Online</span>
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display font-black text-foreground tracking-tighter leading-[0.95]"
            style={{ fontSize: "clamp(3.5rem, 10vw, 5rem)", perspective: "600px" }}
          >
            <KineticText text={hero.name} />
            <motion.span
              className="text-primary font-black inline-block"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + hero.name.length * 0.04, type: "spring", damping: 8, stiffness: 300 }}
            >
              .
            </motion.span>
          </motion.h1>

          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <motion.div
              className="h-px bg-primary/50"
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
            />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading text-muted-foreground">
              {hero.title.includes("|") ? (
                <RotatingTitle titles={hero.title.split("|").map((t) => t.trim())} />
              ) : (
                hero.title
              )}
            </h2>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className={cn(
              "max-w-xl prose prose-lg prose-p:text-muted-foreground prose-a:text-primary prose-p:leading-relaxed",
              !status_panel.show && "mx-auto",
            )}
          >
            <ReactMarkdown>{hero.description}</ReactMarkdown>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className={cn(
              "flex flex-wrap gap-4 pt-4",
              !status_panel.show && "justify-center",
            )}
          >
            {socials
              .filter((s) => s.is_visible)
              .map((social, index) => {
                const Icon = SOCIAL_ICONS[social.id.toLowerCase()];
                if (!Icon) return null;
                const isPrimary = index === 0;
                return (
                  <Button
                    key={social.url}
                    asChild
                    variant={isPrimary ? "default" : "outline"}
                    size="lg"
                    className={cn(
                      "gap-2 transition-all duration-300",
                      isPrimary
                        ? "bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5"
                        : "border-border bg-card hover:bg-primary/5 hover:text-primary hover:border-primary/30",
                    )}
                  >
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="size-4" />
                      {social.label}
                    </a>
                  </Button>
                );
              })}
          </motion.div>
        </div>

        {/* Right: status panel — renders variant chosen in admin settings */}
        {status_panel.show && (
          <motion.div className="lg:col-span-5 w-full" variants={itemVariants}>
            {(status_panel.design ?? "minimal") === "minimal" && (
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <span className="text-sm font-medium text-foreground">
                    {status_panel.title || "Status"}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3" />
                    <LiveClock />
                  </span>
                </div>
                <dl className="divide-y divide-border">
                  <div className="flex items-center justify-between px-5 py-3">
                    <dt className="text-xs text-muted-foreground flex items-center gap-2">
                      <CircleDashed className="size-3" /> Status
                    </dt>
                    <dd className="flex items-center gap-2 text-sm">
                      <span className="size-1.5 rounded-full bg-green-500" />
                      <span className="text-green-600 dark:text-green-400">Online</span>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3">
                    <dt className="text-xs text-muted-foreground flex items-center gap-2">
                      <Activity className="size-3" /> Uptime
                    </dt>
                    <dd className="text-sm font-mono text-foreground">
                      <Uptime />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3">
                    <dt className="text-xs text-muted-foreground flex items-center gap-2">
                      <Zap className="size-3" /> Availability
                    </dt>
                    <dd className="text-sm text-foreground">
                      {status_panel.availability}
                    </dd>
                  </div>
                  <div className="px-5 py-3">
                    <dt className="text-xs text-muted-foreground flex items-center gap-2 mb-2">
                      <Layers className="size-3" />
                      {status_panel.currently_exploring.title}
                    </dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {status_panel.currently_exploring.items.map((item) => (
                        <span
                          key={item}
                          className="text-[11px] text-muted-foreground border border-border rounded px-2 py-0.5"
                        >
                          {item}
                        </span>
                      ))}
                    </dd>
                  </div>
                  <Link
                    href={status_panel.latestProject.href}
                    className="flex items-center justify-between px-5 py-3 group/link hover:bg-secondary/40 transition-colors"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Latest deploy
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {status_panel.latestProject.name}
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground group-hover/link:text-foreground group-hover/link:translate-x-0.5 transition-all" />
                  </Link>
                </dl>
              </div>
            )}

            {status_panel.design === "terminal" && (
              <div className="rounded-lg border border-border bg-zinc-950 text-zinc-100 font-mono text-[13px] leading-relaxed overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 text-zinc-500 text-[11px]">
                  <span>~/{status_panel.title || "status"}</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3" />
                    <LiveClock />
                  </span>
                </div>
                <div className="p-4 space-y-1.5">
                  <div>
                    <span className="text-emerald-400">$</span>{" "}
                    <span className="text-zinc-400">whoami</span>
                  </div>
                  <div className="pl-3 text-zinc-200">
                    {hero.name}{" "}
                    <span className="text-zinc-500">— {hero.title}</span>
                  </div>

                  <div className="pt-1">
                    <span className="text-emerald-400">$</span>{" "}
                    <span className="text-zinc-400">status</span>
                  </div>
                  <div className="pl-3">
                    <span className="text-emerald-400">●</span>{" "}
                    <span className="text-zinc-200">online</span>{" "}
                    <span className="text-zinc-500">
                      · uptime <Uptime />
                    </span>
                  </div>

                  <div className="pt-1">
                    <span className="text-emerald-400">$</span>{" "}
                    <span className="text-zinc-400">availability</span>
                  </div>
                  <div className="pl-3 text-zinc-200">
                    {status_panel.availability}
                  </div>

                  <div className="pt-1">
                    <span className="text-emerald-400">$</span>{" "}
                    <span className="text-zinc-400">exploring --list</span>
                  </div>
                  <div className="pl-3 text-zinc-300">
                    {status_panel.currently_exploring.items.map((item, i) => (
                      <span key={item}>
                        {i > 0 && <span className="text-zinc-600">, </span>}
                        <span className="text-sky-300">{item}</span>
                      </span>
                    ))}
                  </div>

                  <div className="pt-1">
                    <span className="text-emerald-400">$</span>{" "}
                    <span className="text-zinc-400">cat latest-deploy</span>
                  </div>
                  <div className="pl-3">
                    <Link
                      href={status_panel.latestProject.href}
                      className="text-amber-300 hover:underline inline-flex items-center gap-1"
                    >
                      {status_panel.latestProject.name}
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>

                  <div className="pt-2 flex items-center">
                    <span className="text-emerald-400">$</span>
                    <span className="ml-2 inline-block w-2 h-4 bg-zinc-200 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {status_panel.design === "bento" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border-2 border-border bg-card p-4 space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <CircleDashed className="size-3" /> Status
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-green-500" />
                      <span className="text-sm font-semibold text-foreground">
                        Online
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border-2 border-border bg-card p-4 space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Activity className="size-3" /> Uptime
                    </span>
                    <span className="text-sm font-mono font-semibold text-foreground block">
                      <Uptime />
                    </span>
                  </div>
                  <div className="rounded-lg border-2 border-border bg-card p-4 space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Zap className="size-3" /> Load
                    </span>
                    <MiniBarChart />
                  </div>
                  <Link
                    href={status_panel.latestProject.href}
                    className="rounded-lg border-2 border-border bg-card p-4 space-y-1.5 group/link hover:border-primary transition-colors flex flex-col justify-between"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Latest deploy
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {status_panel.latestProject.name}
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground group-hover/link:text-primary group-hover/link:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </div>
                  </Link>
                </div>
                <div className="rounded-lg border-2 border-border bg-card p-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    {status_panel.availability}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Availability
                  </span>
                </div>
                <div className="rounded-lg border-2 border-border bg-card p-4 space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Layers className="size-3" />
                    {status_panel.currently_exploring.title}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {status_panel.currently_exploring.items.map((item) => (
                      <Badge
                        key={item}
                        variant="secondary"
                        className="font-mono text-[11px]"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
