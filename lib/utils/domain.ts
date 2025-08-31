import { createClient } from "@/lib/supabase";

/**
 * ドメイン名を生成する関数
 * @param siteName サイト名
 * @returns 生成されたドメイン名
 */
export const generateDomain = (siteName: string): string => {
  // サイト名をドメイン名に変換（英数字とハイフンのみ）
  return siteName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 63);
};

/**
 * ドメイン名が利用可能かチェックする関数
 * @param domain チェックするドメイン名
 * @returns 利用可能な場合はtrue
 */
export const isDomainAvailable = async (domain: string): Promise<boolean> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("faq_sites")
    .select("domain")
    .eq("domain", domain)
    .single();

  return !data;
};

/**
 * ユニークなドメイン名を生成する関数
 * @param siteName サイト名
 * @returns ユニークなドメイン名
 */
export const generateUniqueDomain = async (
  siteName: string
): Promise<string> => {
  const base = generateDomain(siteName);

  // ベースドメインが利用可能な場合はそのまま返す
  if (await isDomainAvailable(base)) {
    return base;
  }

  // 利用可能なドメインが見つかるまで数字を追加
  let counter = 1;
  while (counter <= 999) {
    const domain = `${base}${counter}`;
    if (await isDomainAvailable(domain)) {
      return domain;
    }
    counter++;
  }

  // 最後の手段として、ランダムな文字列を追加
  return `${base}-${Math.random().toString(36).substring(2, 7)}`;
};
