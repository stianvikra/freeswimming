import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ContactForm from "@/components/ContactForm";

type ContactPageProps = {
  searchParams?: Promise<{
    source?: string | string[];
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const resolvedSearchParams: { source?: string | string[] } = (await searchParams) ?? {};
  const source =
    typeof resolvedSearchParams.source === "string"
      ? resolvedSearchParams.source
      : Array.isArray(resolvedSearchParams.source)
        ? (resolvedSearchParams.source[0] ?? "")
        : "";
  const variant =
    source === "goals_coaching"
      ? "goals_coaching"
      : source === "preview_access_notify"
        ? "preview_access_notify"
        : "contact";

  if (variant === "contact") {
    return (
      <SiteChrome>
        <section className="mx-auto min-h-screen w-full max-w-[720px] px-4 pt-9 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-16 sm:pb-16">
          <ContactForm variant={variant} />
        </section>
      </SiteChrome>
    );
  }

  return (
    <SiteChrome mobileNavMode={variant === "preview_access_notify" ? "hidden" : "default"}>
      <PageTemplate
        surfaceTone={variant === "preview_access_notify" ? "brand" : "default"}
        topInset={variant === "preview_access_notify" ? "tight" : "flush"}
        withBottomSafeArea={variant === "preview_access_notify" ? false : true}
      >
        <ContactForm variant={variant} />
      </PageTemplate>
    </SiteChrome>
  );
}
