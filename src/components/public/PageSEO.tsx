import Head from "next/head";

interface PageSEOProps {
  title: string;
  description: string;
  url: string;
  ogImage: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  articlePublishedTime?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  children?: React.ReactNode;
}

export default function PageSEO({
  title,
  description,
  url,
  ogImage,
  ogTitle,
  ogDescription,
  ogType,
  articlePublishedTime,
  twitterCard,
  twitterTitle,
  twitterDescription,
  twitterImage,
  children,
}: PageSEOProps) {
  return (
    <Head>
      <title key="title">{title}</title>
      <meta key="description" name="description" content={description} />
      <meta key="og:title" property="og:title" content={ogTitle ?? title} />
      <meta key="og:description" property="og:description" content={ogDescription ?? description} />
      <meta key="og:url" property="og:url" content={url} />
      <meta key="og:image" property="og:image" content={ogImage} />
      {ogType && <meta key="og:type" property="og:type" content={ogType} />}
      {articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      <meta key="twitter:card" name="twitter:card" content={twitterCard ?? "summary_large_image"} />
      <meta key="twitter:title" name="twitter:title" content={twitterTitle ?? title} />
      <meta key="twitter:description" name="twitter:description" content={twitterDescription ?? description} />
      <meta key="twitter:image" name="twitter:image" content={twitterImage ?? ogImage} />
      <link rel="canonical" href={url} />
      {children}
    </Head>
  );
}
