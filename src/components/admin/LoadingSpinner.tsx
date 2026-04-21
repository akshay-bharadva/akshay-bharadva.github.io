import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex h-[calc(100vh-20rem)] items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
    </div>
  );
}
