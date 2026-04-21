import { ArrowUpRight, Loader2, type LucideIcon } from "lucide-react";
import { PropsWithChildren } from "react";
import { useGetSectionsByPathQuery } from "@/store/api/publicApi";
import type { PortfolioItem } from "@/types";

interface ItemGridProps extends PropsWithChildren {
  sectionTitle: string;
  emptyIcon: LucideIcon;
  emptyText: string;
  errorText?: string;
}

export default function ItemGrid({
  sectionTitle,
  emptyIcon: EmptyIcon,
  emptyText,
  errorText = `Could not load ${sectionTitle.toLowerCase()}.`,
  children,
}: ItemGridProps) {
  const { data: sections, isLoading, error } = useGetSectionsByPathQuery("/");
  const section = sections?.find((s) => s.title === sectionTitle);
  const items: PortfolioItem[] =
    (section?.portfolio_items as PortfolioItem[]) || [];

  return (
    <section className="my-12 py-12">
      <h2 className="mb-8 font-heading text-3xl font-bold text-foreground">
        / {sectionTitle}
      </h2>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="size-8 animate-spin" />
        </div>
      )}
      {!!error && (
        <div className="text-center text-destructive">{errorText}</div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="py-8 text-center text-muted-foreground rounded-lg bg-secondary/30 border border-dashed">
          <EmptyIcon className="mx-auto size-8 mb-2" />
          <p>{emptyText}</p>
        </div>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => {
            const Wrapper = item.link_url ? "a" : "div";
            const linkProps = item.link_url
              ? { href: item.link_url, rel: "noopener noreferrer", target: "_blank" as const }
              : {};
            return (
              <Wrapper
                key={item.id}
                {...linkProps}
                className="group rounded-lg bg-blueprint-bg p-5 transition-all duration-200 hover:border-primary/80 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  {item.link_url && (
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </Wrapper>
            );
          })}
        </div>
      )}
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}
