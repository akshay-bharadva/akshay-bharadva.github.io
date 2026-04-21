import { Wrench, ShieldAlert } from "lucide-react";

export default function MaintenanceScreen({ level }: { level: number }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
      <div className="mb-6 p-6 rounded-full bg-secondary/50 border border-destructive/20 animate-pulse">
        {level === 2 ? (
          <ShieldAlert className="size-16 text-destructive" />
        ) : (
          <Wrench className="size-16 text-primary" />
        )}
      </div>
      <h1 className="text-4xl font-black font-mono tracking-tighter mb-4">
        {level === 2 ? "SYSTEM_LOCKDOWN" : "MAINTENANCE_MODE"}
      </h1>
      <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
        {level === 2
          ? "This site has been temporarily locked for security reasons. Access is restricted."
          : "We are currently performing scheduled upgrades. The site will return shortly."}
      </p>
    </div>
  );
}
