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

  return (
    <SiteChrome mobileNavMode={variant === "preview_access_notify" ? "hidden" : "default"}>
      <PageTemplate
        topInset="tight"
        withBottomSafeArea={variant === "preview_access_notify" ? false : true}
      >
        <ContactForm variant={variant} />
      </PageTemplate>
    </SiteChrome>
  );
}
