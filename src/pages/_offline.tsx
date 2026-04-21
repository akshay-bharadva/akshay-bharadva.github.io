import Layout from "@/components/layout";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <Layout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-secondary/50 p-6 mb-6">
          <WifiOff className="size-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold font-mono mb-4">You are Offline</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          It looks like you've lost your internet connection. This page isn't
          stored on your device yet.
        </p>
        <Button onClick={() => window.location.reload()}>
          Try Reconnecting
        </Button>
      </div>
    </Layout>
  );
}
