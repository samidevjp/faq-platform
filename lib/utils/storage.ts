import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
});

export async function uploadProfileImage(file: File): Promise<string> {
  try {
    // ファイル名をユニークにする
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("ユーザーが認証されていません");

    const filePath = `${user.id}/${fileName}`;

    // Supabaseのストレージにアップロード
    const { data, error } = await supabase.storage
      .from("profile-images")
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    // 公開URLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw new Error("プロフィール画像のアップロードに失敗しました");
  }
}

export async function deleteProfileImage(url: string): Promise<void> {
  try {
    // URLからファイル名を抽出
    const fileName = url.split("/").pop();
    if (!fileName) throw new Error("Invalid file URL");

    // Supabaseのストレージから削除
    const { error } = await supabase.storage
      .from("profile-images")
      .remove([fileName]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting profile image:", error);
    throw new Error("プロフィール画像の削除に失敗しました");
  }
}
