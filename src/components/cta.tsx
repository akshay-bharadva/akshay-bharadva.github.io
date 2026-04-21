import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";

export default function Cta() {
  const { data: content } = useGetSiteIdentityQuery();
  const emailLink =
    content?.social_links.find((s) => s.id === "email")?.url ||
    "mailto:example@example.com";

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
      className="my-16 md:my-20"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-card to-accent/5 p-10 text-center md:p-16 border border-border/50 shadow-md">
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <h2 className="text-3xl font-black text-foreground md:text-5xl tracking-tight">
            Have a project in <span className="text-primary font-bold">mind?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            I'm always open to discussing new projects, creative ideas, or
            opportunities to be part of an amazing team. Let's build something
            great together.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              asChild
              className="bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all px-8"
            >
              <a href={emailLink}>
                Get In Touch <Mail className="ml-2 size-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-border bg-card hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all px-8"
            >
              <Link href="/contact">
                More Ways to Connect <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
