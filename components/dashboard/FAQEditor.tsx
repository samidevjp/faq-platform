"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  Eye,
  EyeOff,
  GripVertical,
  HelpCircle,
  Tag,
  Settings,
  List,
  Folder,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";

interface FAQEditorProps {
  site: any;
}

export default function FAQEditor({ site }: FAQEditorProps) {
  const [faqItems, setFaqItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [siteName, setSiteName] = useState(site?.name || "");
  const [isNameEdited, setIsNameEdited] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const supabase = createClient();

  // コンポーネント初期化時のデバッグ情報
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
      toast.success("サイト名を更新しました");
    } catch (error: any) {
      toast.error("サイト名の更新に失敗しました");
    }
  };

  const handleAddCategory = async () => {
    try {
      const trimmedCategory = newCategory.trim();
      if (!trimmedCategory) return;

      // 認証確認
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

      // サイトの所有者を確認
      if (!site || !site.id) {
        console.error("サイト情報が不足しています:", site);
        toast.error("サイト情報が不正です");
        return;
      }

      // サイトの所有者情報を取得
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
      setNewCategory("");
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

      // FAQアイテムのカテゴリーも更新
      const { error: faqError } = await supabase
        .from("faq_items")
        .update({ category: trimmedNewName })
        .eq("site_id", site.id)
        .eq("category", oldName);

      if (faqError) throw faqError;

      setCategories(
        categories.map((c) => (c === oldName ? trimmedNewName : c))
      );
      setEditingCategory(null);
      setEditedCategoryName("");
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
        <h2 className="text-2xl font-bold text-gray-900">FAQ Editor</h2>
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
          <div className="flex justify-between items-center mb-6">
            <Button
              onClick={() => setEditingItem({ isNew: true })}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ Item
            </Button>
          </div>
          {/* FAQ Items List */}
          <div className="space-y-4">
            <AnimatePresence>
              {faqItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <h3 className="font-semibold text-gray-900 truncate">
                              {item.question}
                            </h3>
                            {item.category && (
                              <Badge variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {item.category}
                              </Badge>
                            )}
                            <Badge
                              variant={
                                item.is_published ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {item.is_published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {item.answer}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            onClick={() => togglePublished(item)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {item.is_published ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => setEditingItem(item)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(item.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {faqItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No FAQ items yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first FAQ item to get started
              </p>
              <Button
                onClick={() => setEditingItem({ isNew: true })}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First FAQ
              </Button>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="manage-category" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>カテゴリー管理</CardTitle>
              <CardDescription>
                カテゴリーの追加、編集、削除ができます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="新しいカテゴリー"
                  />
                  <Button
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                  >
                    追加
                  </Button>
                </div>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      {editingCategory === category ? (
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            value={editedCategoryName}
                            onChange={(e) =>
                              setEditedCategoryName(e.target.value)
                            }
                            placeholder="カテゴリー名"
                            className="flex-1"
                          />
                          <Button
                            onClick={() =>
                              handleUpdateCategory(category, editedCategoryName)
                            }
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingCategory(null);
                              setEditedCategoryName("");
                            }}
                            variant="ghost"
                            size="sm"
                          >
                            キャンセル
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span>{category}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => {
                                setEditingCategory(category);
                                setEditedCategoryName(category);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteCategory(category)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site-settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>サイト設定</CardTitle>
              <CardDescription>サイトの基本設定を管理します</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">サイト名</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="site-name"
                      value={siteName}
                      onChange={(e) => handleSiteNameChange(e.target.value)}
                      className="max-w-xs text-gray-600"
                      placeholder="サイト名"
                    />
                    {isNameEdited && (
                      <Button
                        onClick={handleSiteNameSave}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        保存
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  <CardDescription>
                    {editingItem.id
                      ? "Update your FAQ item"
                      : "Add a new FAQ item to your site"}
                  </CardDescription>
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

      {/* Category Manager Modal */}
      <AnimatePresence>
        {showCategoryManager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCategoryManager(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader>
                  <CardTitle>カテゴリー管理</CardTitle>
                  <CardDescription>
                    カテゴリーの追加、編集、削除ができます
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="新しいカテゴリー"
                      />
                      <Button
                        onClick={handleAddCategory}
                        disabled={!newCategory.trim()}
                      >
                        追加
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div
                          key={category}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          {editingCategory === category ? (
                            <div className="flex-1 flex items-center gap-2">
                              <Input
                                value={editedCategoryName}
                                onChange={(e) =>
                                  setEditedCategoryName(e.target.value)
                                }
                                placeholder="カテゴリー名"
                                className="flex-1"
                              />
                              <Button
                                onClick={() =>
                                  handleUpdateCategory(
                                    category,
                                    editedCategoryName
                                  )
                                }
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => {
                                  setEditingCategory(null);
                                  setEditedCategoryName("");
                                }}
                                variant="ghost"
                                size="sm"
                              >
                                キャンセル
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span>{category}</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => {
                                    setEditingCategory(category);
                                    setEditedCategoryName(category);
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteCategory(category)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQItemForm({ item, categories, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    question: item.isNew ? "" : item.question || "",
    answer: item.isNew ? "" : item.answer || "",
    category: item.isNew ? "" : item.category || "",
    is_published: item.isNew ? true : item.is_published ?? true,
  });
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const supabase = createClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddCategory = async () => {
    try {
      const trimmedCategory = newCategory.trim();
      if (!trimmedCategory) {
        toast.error("カテゴリー名を入力してください");
        return;
      }

      if (categories.includes(trimmedCategory)) {
        toast.error("同じ名前のカテゴリーが既に存在します");
        return;
      }

      const { error } = await supabase.from("site_categories").insert({
        site_id: item.site_id,
        name: trimmedCategory,
      });

      if (error) throw error;

      // カテゴリーリストを更新
      categories.push(trimmedCategory);

      // 新しく追加したカテゴリーを選択
      setFormData({ ...formData, category: trimmedCategory });

      // モーダルを閉じてフォームをリセット
      setShowAddCategoryModal(false);
      setNewCategory("");

      toast.success("カテゴリーを追加しました");
    } catch (error: any) {
      console.error("カテゴリーの追加エラー:", error);
      toast.error("カテゴリーの追加に失敗しました");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="question">Question *</Label>
          <Input
            id="question"
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
            placeholder="What is your return policy?"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="answer">Answer *</Label>
          <Textarea
            id="answer"
            value={formData.answer}
            onChange={(e) =>
              setFormData({ ...formData, answer: e.target.value })
            }
            placeholder="Our return policy allows..."
            rows={6}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category || "none"}
            onValueChange={(value) => {
              if (value === "add_new") {
                setShowAddCategoryModal(true);
              } else {
                setFormData({
                  ...formData,
                  category: value === "none" ? "" : value,
                });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select or create category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {categories.map((category: string) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
              <SelectItem value="add_new" className="text-blue-600">
                <Plus className="w-4 h-4 mr-2 inline-block" />
                新しいカテゴリーを追加
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={formData.is_published}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_published: checked })
            }
          />
          <Label htmlFor="published">Publish immediately</Label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save FAQ Item
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader>
                  <CardTitle>新しいカテゴリーを追加</CardTitle>
                  <CardDescription>
                    新しいカテゴリーを作成して、FAQアイテムに割り当てることができます
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-category">カテゴリー名</Label>
                      <Input
                        id="new-category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="新しいカテゴリー名"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        onClick={() => setShowAddCategoryModal(false)}
                        variant="outline"
                      >
                        キャンセル
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={!newCategory.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        追加
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
