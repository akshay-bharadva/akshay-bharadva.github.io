import { PropsWithChildren } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { staggerContainer, fadeSlideUp } from "@/lib/animation-variants";

type NotFoundProps = PropsWithChildren;

export default function NotFound({ children }: NotFoundProps) {
  return (
    <section className="my-8 py-16 text-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-col items-center"
      >
        <motion.div
          variants={fadeSlideUp}
          className="mb-4 flex items-center gap-2 text-primary font-mono text-sm tracking-widest uppercase"
        >
          <AlertTriangle className="size-4" />
          <span>Not Found</span>
        </motion.div>
        <motion.h1
          variants={fadeSlideUp}
          className="mb-3 font-display text-7xl font-black text-primary md:text-9xl tracking-tighter"
        >
          404<span className="text-foreground">.</span>
        </motion.h1>
        <motion.h2
          variants={fadeSlideUp}
          className="mb-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl"
        >
          Page Not Found
        </motion.h2>
        <motion.p
          variants={fadeSlideUp}
          className="mb-8 max-w-md mx-auto text-muted-foreground leading-relaxed"
        >
          Looks like you've ventured into uncharted territory. The page you're
          looking for doesn't exist or has been moved.
        </motion.p>

        {children && (
          <motion.div variants={fadeSlideUp} className="mb-8">
            {children}
          </motion.div>
        )}

        <motion.div variants={fadeSlideUp}>
          <Button
            asChild
            size="lg"
            className="gap-2 bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Link href="/">
              Return to Homebase <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
