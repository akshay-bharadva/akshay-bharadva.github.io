import Layout from "@/components/layout";
import Hero from "@/components/hero";
import Cta from "@/components/cta";
import { config as appConfig } from "@/lib/config";
import PageSEO from "@/components/public/PageSEO";
import DynamicPageContent from "@/components/DynamicPageContent";
import PageWrapper from "@/components/public/PageWrapper";
import { useEffect } from "react";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";

export default function HomePage() {
  const { site: siteConfig } = appConfig;
  const { data: siteIdentity } = useGetSiteIdentityQuery();

  const siteTitle = siteIdentity
    ? `${siteIdentity.profile_data.name} | ${siteIdentity.profile_data.title}`
    : siteConfig.title;

  useEffect(() => {
    const webhookUrl = process.env.NEXT_PUBLIC_VISIT_NOTIFIER_URL || "";
    if (process.env.NODE_ENV === "production" && webhookUrl) {
      if (!sessionStorage.getItem("visitNotified")) {
        const userAgent = navigator.userAgent || "Unknown";
        const referrer = document.referrer || "Direct visit";
        const embed = {
          title: "🚀 New Portfolio Visitor!",
          color: 3447003,
          description: "Someone just landed on the portfolio.",
          fields: [
            { name: "🔗 Referrer", value: `\`${referrer}\``, inline: false },
            { name: "🖥️ User Agent", value: `\`\`\`${userAgent}\`\`\`` },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "Visit Notification" },
        };

        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Portfolio Bot",
            avatar_url: "https://i.imgur.com/4M34hi2.png",
            embeds: [embed],
          }),
        })
          .then(() => sessionStorage.setItem("visitNotified", "true"))
          .catch((err) =>
            console.error("Failed to send visit notification:", err),
          );
      }
    }
  }, []);

  return (
    <Layout>
      <PageSEO
        title={siteTitle}
        description={siteIdentity?.profile_data.description || siteConfig.description}
        url={siteConfig.url}
        ogImage={siteConfig.defaultOgImage}
      />
      <PageWrapper maxWidth="full">
        <Hero />
        <DynamicPageContent pagePath="/" />
        <Cta />
      </PageWrapper>
    </Layout>
  );
}
