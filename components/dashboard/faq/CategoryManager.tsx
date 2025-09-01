"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit3, Trash2, Save } from "lucide-react";

interface CategoryManagerProps {
  categories: string[];
  onAddCategory: (category: string) => Promise<void>;
  onUpdateCategory: (oldName: string, newName: string) => Promise<void>;
  onDeleteCategory: (category: string) => Promise<void>;
}

export default function CategoryManager({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");

  return (
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
              onClick={() => {
                onAddCategory(newCategory);
                setNewCategory("");
              }}
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
                      onChange={(e) => setEditedCategoryName(e.target.value)}
                      placeholder="カテゴリー名"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        onUpdateCategory(category, editedCategoryName);
                        setEditingCategory(null);
                        setEditedCategoryName("");
                      }}
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
                        onClick={() => onDeleteCategory(category)}
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
  );
}
