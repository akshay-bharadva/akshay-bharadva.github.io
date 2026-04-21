import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import PageSEO from "@/components/public/PageSEO";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormValues } from "@/lib/schemas";
import {
  Check,
  Loader2,
  Mail,
  Briefcase,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Send,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useGetSiteIdentityQuery,
  useGetSectionsByPathQuery,
  useSubmitContactFormMutation,
} from "@/store/api/publicApi";
import { Skeleton } from "@/components/ui/skeleton";
import PageWrapper from "@/components/public/PageWrapper";
import { useState } from "react";

import { staggerContainer, fadeSlideUp } from "@/lib/animation-variants";
import { SOCIAL_ICONS } from "@/lib/social-icons";

export default function ContactPage() {
  const { site: siteConfig } = appConfig;
  const { data: content, isLoading: isContentLoading } =
    useGetSiteIdentityQuery();

  const { data: sections, isLoading: isLoadingServices } =
    useGetSectionsByPathQuery("/contact");
  const serviceSection = sections?.find((s) => s.title === "Services");
  const hasServices =
    !isLoadingServices &&
    serviceSection?.portfolio_items &&
    serviceSection.portfolio_items.length > 0;

  const contactSettings = content?.profile_data.contact_page;
  const showForm = contactSettings?.show_contact_form ?? true;
  const showAvailability = contactSettings?.show_availability_badge ?? true;
  const showServices = contactSettings?.show_services ?? true;

  const emailLink = content?.social_links.find(
    (s) => s.id.toLowerCase() === "email" && s.is_visible,
  );
  const otherSocials = content?.social_links.filter(
    (s) => s.id.toLowerCase() !== "email" && s.is_visible,
  );

  const pageStaticContent = {
    title: "Contact Me",
    description: "Let's build something great together. Get in touch.",
  };

  const siteName = content?.profile_data.name || siteConfig.title;
  const pageTitle = `${pageStaticContent.title} | ${siteName}`;
  const pageUrl = `${siteConfig.url}/contact/`;

  // Contact form
  const [submitContact, { isLoading: isSubmitting }] =
    useSubmitContactFormMutation();
  const [formStatus, setFormStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await submitContact(data).unwrap();
      setFormStatus("success");
      reset();
      setTimeout(() => setFormStatus("idle"), 5000);
    } catch {
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 5000);
    }
  };

  return (
    <Layout>
      <PageSEO
        title={pageTitle}
        description={pageStaticContent.description}
        url={pageUrl}
        ogImage={siteConfig.defaultOgImage}
      />
      <PageWrapper maxWidth="default">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* ── HERO ── */}
          <motion.header variants={fadeSlideUp} className="mb-16 text-center">
            <div className="mb-4 flex items-center justify-center gap-2 text-primary font-mono text-sm tracking-widest uppercase">
              <MessageSquare className="size-4" />
              <span>Contact</span>
            </div>
            <h1 className="font-display text-4xl font-black tracking-tighter text-foreground md:text-6xl">
              Get In Touch<span className="text-primary">.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground leading-relaxed">
              Have a project in mind or just want to say hello?
              I&apos;d love to hear from you.
            </p>
          </motion.header>

          {/* ── MAIN CONTENT: Form + Sidebar ── */}
          <motion.div
            variants={fadeSlideUp}
            className="grid grid-cols-1 gap-10 lg:grid-cols-5"
          >
            {/* LEFT: Contact Form */}
            {showForm && (
              <div className="lg:col-span-3">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5 rounded-2xl border border-border/50 bg-card p-6 md:p-8 shadow-sm"
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What's this about?"
                      {...register("subject")}
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell me about your project or idea..."
                      rows={6}
                      {...register("message")}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">
                        {errors.message.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full group gap-2"
                    disabled={isSubmitting || formStatus === "success"}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Sending...
                      </>
                    ) : formStatus === "success" ? (
                      <>
                        <Check className="size-4" />
                        Message Sent!
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        Send Message
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                  {formStatus === "success" && (
                    <p className="text-sm text-center text-primary">
                      Thanks for reaching out! I&apos;ll get back to you soon.
                    </p>
                  )}
                  {formStatus === "error" && (
                    <p className="text-sm text-center text-destructive">
                      Something went wrong. Please try again or email me
                      directly.
                    </p>
                  )}
                </form>
              </div>
            )}

            {/* RIGHT: Info Sidebar */}
            <div className={showForm ? "lg:col-span-2 space-y-6" : "lg:col-span-5 max-w-xl mx-auto space-y-6"}>
              {/* Availability */}
              {showAvailability && (
                <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="relative flex size-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
                    </span>
                    <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                      Available for work
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Open to freelance projects, contract work, and full-time
                    opportunities.
                  </p>
                </div>
              )}

              {/* Direct Contact */}
              {isContentLoading || !content ? (
                <div className="space-y-4">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              ) : (
                <div className="space-y-3">
                  {emailLink && (
                    <a
                      href={emailLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
                    >
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <Mail className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          Email
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {emailLink.url.replace("mailto:", "")}
                        </p>
                      </div>
                    </a>
                  )}

                  {otherSocials?.map((social) => {
                    const Icon = SOCIAL_ICONS[social.id.toLowerCase()];
                    if (!Icon) return null;
                    return (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
                      >
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {social.label}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {social.url
                              .replace(/^https?:\/\//, "")
                              .replace(/\/$/, "")}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── SERVICES ── */}
          {isLoadingServices && showServices && (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {showServices && hasServices && (
            <motion.div variants={fadeSlideUp} className="mt-20">
              <div className="mb-4 flex items-center justify-center gap-2 text-primary font-mono text-sm tracking-widest uppercase">
                <Briefcase className="size-4" />
                <span>Services</span>
              </div>
              <h2 className="mb-4 text-center text-3xl font-black tracking-tighter text-foreground md:text-4xl">
                What I Can Do For You
                <span className="text-primary">.</span>
              </h2>
              <p className="mx-auto mb-12 max-w-lg text-center text-muted-foreground">
                From concept to deployment, here&apos;s how I can help you build
                something great.
              </p>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {serviceSection!.portfolio_items!.map((service, index) => (
                  <motion.div
                    key={service.id}
                    variants={fadeSlideUp}
                    className="group relative flex h-full flex-col rounded-xl bg-card border border-border/50 p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20"
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex flex-col h-full">
                      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      {service.subtitle && (
                        <p className="mb-5 text-sm text-muted-foreground leading-relaxed">
                          {service.subtitle}
                        </p>
                      )}
                      {service.tags && service.tags.length > 0 && (
                        <ul className="mt-auto space-y-2 pt-4 border-t border-border/50">
                          {service.tags.map((tag) => (
                            <li
                              key={tag}
                              className="flex items-start text-sm text-muted-foreground"
                            >
                              <Check className="mr-2.5 mt-0.5 size-4 shrink-0 text-primary" />
                              <span>{tag}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </PageWrapper>
    </Layout>
  );
}
