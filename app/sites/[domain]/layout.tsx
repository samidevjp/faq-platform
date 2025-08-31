import { Metadata } from "next";
import { createClient } from "@/lib/supabase";

interface LayoutProps {
  children: React.ReactNode;
  params: {
    domain: string;
  };
}

async function getFAQSite(domain: string) {
  const supabase = createClient();
  const { data: site } = await supabase
    .from("faq_sites")
    .select("name, description, theme")
    .eq("domain", domain)
    .single();

  return site;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const site = await getFAQSite(params.domain);

  if (!site) {
    return {
      title: "FAQ Site Not Found",
    };
  }

  return {
    title: site.name,
    description: site.description,
  };
}

export default function FAQSiteLayout({ children }: LayoutProps) {
  return children;
}
