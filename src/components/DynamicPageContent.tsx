import { useGetSectionsByPathQuery } from "@/store/api/publicApi";
import SectionRenderer from "./SectionRenderer";
import { Loader2 } from "lucide-react";

interface DynamicPageContentProps {
  pagePath: string;
}

export default function DynamicPageContent({
  pagePath,
}: DynamicPageContentProps) {
  const {
    data: sections,
    isLoading,
    error,
  } = useGetSectionsByPathQuery(pagePath);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    console.error(`Error fetching content for ${pagePath}:`, error);
    return null; // Or show an error message
  }

  return (
    <>
      {sections?.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </>
  );
}
