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
  const variant = source === "goals_coaching" ? "goals_coaching" : "contact";

  return (
    <SiteChrome>
      <PageTemplate>
        <ContactForm variant={variant} />
      </PageTemplate>
    </SiteChrome>
  );
}
