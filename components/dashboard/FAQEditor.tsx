"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, List, Folder, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import FAQItemForm from "./faq/FAQItemForm";
import FAQList from "./faq/FAQList";
import CategoryManager from "./faq/CategoryManager";
import SiteSettings from "./faq/SiteSettings";

interface FAQEditorProps {
  site: any;
  onBack: () => void;
  onSiteUpdate?: (updatedSite: any) => void;
}

export default function FAQEditor({
  site,
  onBack,
  onSiteUpdate,
}: FAQEditorProps) {
  const [faqItems, setFaqItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [siteName, setSiteName] = useState(site?.name || "");
  const [domain, setDomain] = useState(site?.domain || "");
  const [isNameEdited, setIsNameEdited] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    console.log("FAQEditor initialized with site:", {
      id: site?.id,
      name: site?.name,
      fullSite: site,
    });
  }, [site]);

  useEffect(() => {
    fetchFAQItems();
    fetchCategories();
  }, [site.id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("site_categories")
        .select("name")
        .eq("site_id", site.id);

      if (error) throw error;

      const categoryNames = data.map((cat) => cat.name);
      setCategories(categoryNames);
    } catch (error: any) {
      toast.error("カテゴリーの読み込みに失敗しました");
    }
  };

  const fetchFAQItems = async () => {
    try {
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .eq("site_id", site.id)
        .order("order_index", { ascending: true });

      if (error) throw error;

      setFaqItems(data || []);
    } catch (error: any) {
      toast.error("Failed to load FAQ items");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (!editingItem.isNew) {
        const { error } = await supabase
          .from("faq_items")
          .update({
            question: formData.question,
            answer: formData.answer,
            category: formData.category || null,
            is_published: formData.is_published,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("FAQ item updated successfully");
      } else {
        const newFAQItem = {
          site_id: site.id,
          question: formData.question,
          answer: formData.answer,
          category: formData.category || null,
          order_index: faqItems.length,
          is_published: formData.is_published,
        };

        const { data, error } = await supabase
          .from("faq_items")
          .insert(newFAQItem)
          .select()
          .single();

        if (error) throw error;
        toast.success("FAQ item created successfully");
      }

      setEditingItem(null);
      fetchFAQItems();
    } catch (error: any) {
      console.error("Failed to save FAQ item:", error);
      toast.error(`Failed to save FAQ item: ${error.message}`);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("faq_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setFaqItems(faqItems.filter((item) => item.id !== itemId));
      toast.success("FAQ item deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete FAQ item");
    }
  };

  const togglePublished = async (item: any) => {
    try {
      const { error } = await supabase
        .from("faq_items")
        .update({ is_published: !item.is_published })
        .eq("id", item.id);

      if (error) throw error;

      setFaqItems(
        faqItems.map((faq) =>
          faq.id === item.id ? { ...faq, is_published: !faq.is_published } : faq
        )
      );

      toast.success(
        `FAQ item ${!item.is_published ? "published" : "unpublished"}`
      );
    } catch (error: any) {
      toast.error("Failed to update FAQ item");
    }
  };

  const handleSiteNameChange = (newName: string) => {
    setSiteName(newName);
    setIsNameEdited(true);
  };

  const handleSiteNameSave = async () => {
    try {
      const { error } = await supabase
        .from("faq_sites")
        .update({ name: siteName })
        .eq("id", site.id);

      if (error) throw error;

      setIsNameEdited(false);
      const updatedSite = { ...site, name: siteName };
      onSiteUpdate?.(updatedSite);
      toast.success("サイト名を更新しました");
    } catch (error: any) {
      toast.error("サイト名の更新に失敗しました");
    }
  };

  const handleDomainSave = async () => {
    try {
      const { error } = await supabase
        .from("faq_sites")
        .update({ domain })
        .eq("id", site.id);

      if (error) throw error;

      const updatedSite = { ...site, domain };
      onSiteUpdate?.(updatedSite);
      toast.success("ドメインを更新しました");
    } catch (error: any) {
      toast.error("ドメインの更新に失敗しました");
    }
  };

  const handleAddCategory = async (newCategoryName: string) => {
    try {
      const trimmedCategory = newCategoryName.trim();
      if (!trimmedCategory) return;

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("認証エラー:", authError);
        toast.error("認証に失敗しました");
        return;
      }

      if (!user) {
        toast.error("認証が必要です");
        return;
      }

      if (!site || !site.id) {
        console.error("サイト情報が不足しています:", site);
        toast.error("サイト情報が不正です");
        return;
      }

      const { data: sitesData, error: siteError } = await supabase
        .from("faq_sites")
        .select("user_id")
        .eq("id", site.id);

      if (siteError) {
        console.error("サイト情報取得エラー:", siteError);
        toast.error("サイトの情報を取得できませんでした");
        return;
      }

      if (!sitesData || sitesData.length === 0) {
        console.error("サイトが見つかりません - ID:", site.id);
        toast.error("指定されたサイトが見つかりません");
        return;
      }

      const siteData = sitesData[0];

      if (siteData.user_id !== user.id) {
        console.error("権限エラー - ユーザーID不一致:", {
          currentUser: user.id,
          siteOwner: siteData.user_id,
        });
        toast.error("このサイトを編集する権限がありません");
        return;
      }

      const { error } = await supabase.from("site_categories").insert({
        site_id: site.id,
        name: trimmedCategory,
      });

      if (error) throw error;

      setCategories([...categories, trimmedCategory]);
      toast.success("カテゴリーを追加しました");
    } catch (error: any) {
      console.error("カテゴリーの追加エラー:", error);
      toast.error(`カテゴリーの追加に失敗しました: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    try {
      const { error } = await supabase
        .from("site_categories")
        .delete()
        .eq("site_id", site.id)
        .eq("name", categoryName);

      if (error) throw error;

      setCategories(categories.filter((c) => c !== categoryName));
      toast.success("カテゴリーを削除しました");
    } catch (error: any) {
      toast.error("カテゴリーの削除に失敗しました");
    }
  };

  const handleUpdateCategory = async (oldName: string, newName: string) => {
    try {
      const trimmedNewName = newName.trim();
      if (!trimmedNewName) {
        toast.error("カテゴリー名を入力してください");
        return;
      }

      if (categories.includes(trimmedNewName)) {
        toast.error("同じ名前のカテゴリーが既に存在します");
        return;
      }

      const { error } = await supabase
        .from("site_categories")
        .update({ name: trimmedNewName })
        .eq("site_id", site.id)
        .eq("name", oldName);

      if (error) throw error;

      const { error: faqError } = await supabase
        .from("faq_items")
        .update({ category: trimmedNewName })
        .eq("site_id", site.id)
        .eq("category", oldName);

      if (faqError) throw faqError;

      setCategories(
        categories.map((c) => (c === oldName ? trimmedNewName : c))
      );
      toast.success("カテゴリー名を更新しました");
    } catch (error: any) {
      console.error("カテゴリー名の更新エラー:", error);
      toast.error("カテゴリー名の更新に失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              FAQ Editor - {siteName}
            </h2>
          </div>
        </div>
      </div>

      <Tabs defaultValue="manage-faq" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage-faq" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Manage FAQ
          </TabsTrigger>
          <TabsTrigger
            value="manage-category"
            className="flex items-center gap-2"
          >
            <Folder className="w-4 h-4" />
            Manage Category
          </TabsTrigger>
          <TabsTrigger
            value="site-settings"
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Site Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage-faq" className="mt-6">
          <FAQList
            faqItems={faqItems}
            onEdit={setEditingItem}
            onDelete={handleDelete}
            onTogglePublish={togglePublished}
            onAddNew={() => setEditingItem({ isNew: true })}
          />
        </TabsContent>

        <TabsContent value="manage-category" className="mt-6">
          <CategoryManager
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </TabsContent>

        <TabsContent value="site-settings" className="mt-6">
          <SiteSettings
            siteName={siteName}
            domain={domain}
            isNameEdited={isNameEdited}
            onSiteNameChange={handleSiteNameChange}
            onSiteNameSave={handleSiteNameSave}
            onDomainChange={setDomain}
            onDomainSave={handleDomainSave}
            onProfileImageChange={function (imageUrl: string): void {
              throw new Error("Function not implemented.");
            }}
            onProfileImageRemove={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingItem.id ? "Edit FAQ Item" : "Create FAQ Item"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FAQItemForm
                    item={editingItem}
                    categories={categories}
                    onSave={handleSave}
                    onCancel={() => setEditingItem(null)}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
