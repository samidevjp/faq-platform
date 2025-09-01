import { createServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { SiteTheme, defaultTheme } from "@/lib/types/theme";
export const dynamic = "force-dynamic";
export const revalidate = 0;
interface PageProps {
  params: {
    domain: string;
  };
}

async function getAllFAQSites() {
  try {
    const supabase = createServerClient();
    const { data: sites, error } = await supabase
      .from("faq_sites")
      .select("domain");

    if (error) {
      console.error("Error fetching FAQ sites:", error);
      return [];
    }

    console.log("Found FAQ sites:", sites);
    return sites || [];
  } catch (error) {
    console.error("Error in getAllFAQSites:", error);
    return [];
  }
}

async function getFAQSite(domain: string) {
  try {
    const supabase = createServerClient();

    const { data: site, error } = await supabase
      .from("faq_sites")
      .select(
        `
        *,
        faq_items (
          *
        )
      `
      )
      .eq("domain", domain)
      .single();

    if (error) {
      console.error("Error fetching FAQ site:", error);
      return null;
    }

    if (!site) {
      console.log("No site found for domain:", domain);
      return null;
    }

    return site;
  } catch (error) {
    console.error("Error in getFAQSite:", error);
    return null;
  }
}

// export async function generateStaticParams() {
//   try {
//     const sites = await getAllFAQSites();
//     console.log(
//       "Generating static params for domains:",
//       sites.map((site) => site.domain)
//     );
//     return sites.map((site) => ({
//       domain: site.domain,
//     }));
//   } catch (error) {
//     console.error("Error in generateStaticParams:", error);
//     return [];
//   }
// }

export default async function FAQSitePage({ params }: PageProps) {
  try {
    console.log("Fetching FAQ site for domain:", params.domain);
    const site = await getFAQSite(params.domain);

    if (!site) {
      console.log("No site found, returning 404");
      notFound();
    }

    // テーマの設定（デフォルト値とマージ）
    const theme: SiteTheme = {
      ...defaultTheme,
      ...(site.theme || {}),
    };

    // スタイルの生成
    const styles = {
      container: {
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        minHeight: "100vh",
      },
      header: {
        borderBottom: `1px solid ${theme.primaryColor}20`,
        backgroundColor: `${theme.primaryColor}05`,
      },
      title: {
        color: theme.primaryColor,
      },
      content: {
        maxWidth: theme.maxWidth,
      },
      faqItem: {
        backgroundColor: theme.backgroundColor,
        borderRadius: theme.borderRadius,
        border: `1px solid ${theme.primaryColor}20`,
        transition: "all 0.2s ease-in-out",
        ":hover": {
          borderColor: `${theme.primaryColor}40`,
        },
      },
      question: {
        color: theme.questionColor,
        fontSize: "1.125rem",
        fontWeight: 600,
      },
      answer: {
        color: theme.answerColor,
        marginTop: "0.75rem",
      },
    };

    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div className="container mx-auto px-4 py-6">
            <h1 style={styles.title} className="text-2xl font-bold">
              {site.name}
            </h1>
            {site.description && (
              <p className="mt-2 opacity-80">{site.description}</p>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div style={styles.content} className="mx-auto">
            {site.faq_items && site.faq_items.length > 0 ? (
              <div className="space-y-6">
                {site.faq_items
                  .sort((a: any, b: any) => a.order_index - b.order_index)
                  .filter((item: any) => item.is_published)
                  .map((item: any) => (
                    <div
                      key={item.id}
                      style={styles.faqItem}
                      className="p-6 shadow-sm hover:shadow-md"
                    >
                      <h2 style={styles.question}>{item.question}</h2>
                      <p style={styles.answer}>{item.answer}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p style={{ color: theme.answerColor }}>
                  まだFAQが登録されていません。
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error in FAQSitePage:", error);
    throw error; // Next.jsのエラーページにリダイレクト
  }
}
