import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import { siteContent } from "@/lib/site-content";
import PageSEO from "@/components/public/PageSEO";
import DynamicPageContent from "@/components/DynamicPageContent";
import PageWrapper from "@/components/public/PageWrapper";
import { motion } from "framer-motion";
import { staggerContainer, fadeSlideUp } from "@/lib/animation-variants";
import { Sparkles } from "lucide-react";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";

export default function ShowcasePage() {
  const { site: siteConfig } = appConfig;
  const { data: siteIdentity } = useGetSiteIdentityQuery();
  const content = siteContent.pages.showcase;
  const siteName = siteIdentity?.profile_data.name || siteConfig.title;

  return (
    <Layout>
      <PageSEO
        title={`${content.title} | ${siteName}`}
        description={content.description}
        url={`${siteConfig.url}/showcase/`}
        ogImage={siteConfig.defaultOgImage}
      />

      <PageWrapper maxWidth="wide">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.header variants={fadeSlideUp} className="mb-16 text-center">
            <div className="mb-4 flex items-center justify-center gap-2 text-primary font-mono text-sm tracking-widest uppercase">
              <Sparkles className="size-4" />
              <span>Showcase</span>
            </div>
            <h1 className="font-display text-5xl font-black tracking-tighter text-foreground md:text-6xl">
              {content.heading}
              <span className="text-primary">.</span>
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              {content.subheading}
            </p>
          </motion.header>
          <motion.div variants={fadeSlideUp}>
            <DynamicPageContent pagePath="/showcase" />
          </motion.div>
        </motion.div>
      </PageWrapper>
    </Layout>
  );
}
