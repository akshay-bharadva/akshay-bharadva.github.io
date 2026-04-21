
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmOptions {
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<
  ConfirmDialogContextType | undefined
>(undefined);

export function useConfirm() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  }
  return context.confirm;
}

export const ConfirmDialogProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null,
  );

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions({
      title: "Are you sure?",
      description: "This action cannot be undone.",
      confirmText: "Confirm",
      cancelText: "Cancel",
      variant: "default",
      ...opts,
    });
    setOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    if (resolver) resolver(true);
  };

  const handleCancel = () => {
    setOpen(false);
    if (resolver) resolver(false);
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        {/* 
          RESPONSIVE UPDATE: 
          - w-[95vw]: Takes up 95% of viewport width on mobile (prevents edge touching)
          - max-w-lg: Caps width on desktop for readability
          - rounded-lg: Softer corners for mobile
        */}
        <AlertDialogContent className="w-[95vw] max-w-lg rounded-xl md:rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              {options.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground/90">
              {options.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {/* 
             RESPONSIVE FOOTER:
             - flex-col-reverse: Stacks buttons vertically on mobile (Cancel at bottom)
             - sm:flex-row: Reverts to horizontal on small tablets/desktop
             - gap-3: Adds space between stacked buttons
          */}
          <AlertDialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2 mt-4">
            <AlertDialogCancel
              onClick={handleCancel}
              className="mt-0 w-full sm:w-auto h-12 sm:h-10 text-base"
            >
              {options.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                options.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto h-12 sm:h-10 text-base"
                  : "w-full sm:w-auto h-12 sm:h-10 text-base"
              }
            >
              {options.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  );
};
