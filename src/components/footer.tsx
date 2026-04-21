import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Container from "./container";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";
import { Skeleton } from "./ui/skeleton";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { SOCIAL_ICONS } from "@/lib/social-icons";

export default function Footer() {
  const { data: content, isLoading } = useGetSiteIdentityQuery();
  const currentYear = new Date().getFullYear();
  const router = useRouter();

  const [clickCount, setClickCount] = useState(0);

  const handleSecretClick = () => {
    setClickCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 1000);

      if (clickCount === 5) {
        toast.success("Initializing Admin Sequence...");
        router.push("/admin");
        setClickCount(0);
      }

      return () => clearTimeout(timer);
    }
  }, [clickCount, router]);

  if (isLoading || !content) {
    return (
      <footer className="w-full border-t border-border/50 py-8">
        <Container>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-4">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="size-5 rounded-full" />
            </div>
          </div>
        </Container>
      </footer>
    );
  }

  const { footer_data, social_links, profile_data } = content;

  return (
    <footer className="w-full border-t border-border/50 py-8 text-sm text-muted-foreground z-[1]">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col gap-1 items-center sm:items-start">
            <span className="text-muted-foreground">
              <span
                onClick={handleSecretClick}
                className="cursor-default select-none"
              >
                &copy; {currentYear}
              </span>{" "}
              {profile_data.name}
            </span>
            {footer_data.copyright_text && (
              <div className="[&_p]:m-0 prose prose-sm prose-p:text-muted-foreground prose-a:text-primary hover:prose-a:underline">
                <ReactMarkdown>{footer_data.copyright_text}</ReactMarkdown>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {social_links
              .filter((s) => s.is_visible)
              .map((social) => {
                const Icon = SOCIAL_ICONS[social.id.toLowerCase()];
                return Icon ? (
                  <a
                    key={social.url}
                    href={social.url}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={social.label}
                    title={social.label}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon className="size-4" />
                  </a>
                ) : null;
              })}
          </div>
        </div>
      </Container>
    </footer>
  );
}
