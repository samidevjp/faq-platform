"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Save } from "lucide-react";
import toast from "react-hot-toast";

interface FAQItemFormProps {
  item: any;
  categories: string[];
  onSave: (formData: any) => void;
  onCancel: () => void;
}

export default function FAQItemForm({
  item,
  categories,
  onSave,
  onCancel,
}: FAQItemFormProps) {
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
