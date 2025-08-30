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
} from "lucide-react";
import toast from "react-hot-toast";

interface FAQEditorProps {
  site: any;
}

export default function FAQEditor({ site }: FAQEditorProps) {
  const [faqItems, setFaqItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchFAQItems();
  }, [site.id]);

  const fetchFAQItems = async () => {
    try {
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .eq("site_id", site.id)
        .order("order_index", { ascending: true });

      if (error) throw error;

      setFaqItems(data || []);

      // Extract unique categories
      const categorySet = new Set(
        (data || []).map((item) => item.category).filter(Boolean)
      );
      const uniqueCategories = Array.from(categorySet) as string[];
      setCategories(uniqueCategories);
    } catch (error: any) {
      toast.error("Failed to load FAQ items");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (editingItem) {
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
        const { data, error } = await supabase
          .from("faq_items")
          .insert({
            site_id: site.id,
            question: formData.question,
            answer: formData.answer,
            category: formData.category || null,
            order_index: faqItems.length,
            is_published: formData.is_published,
          })
          .select()
          .single();

        if (error) throw error;
        toast.success("FAQ item created successfully");
      }

      setEditingItem(null);
      fetchFAQItems();
    } catch (error: any) {
      toast.error("Failed to save FAQ item");
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">FAQ Editor</h2>
          <p className="text-gray-600">Editing: {site.name}</p>
        </div>
        <Button
          onClick={() => setEditingItem({})}
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
                          variant={item.is_published ? "default" : "secondary"}
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
            onClick={() => setEditingItem({})}
            className="bg-gradient-to-r from-green-600 to-emerald-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First FAQ
          </Button>
        </motion.div>
      )}

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
    </div>
  );
}

function FAQItemForm({ item, categories, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    question: item.question || "",
    answer: item.answer || "",
    category: item.category || "",
    is_published: item.is_published ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
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
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          placeholder="Our return policy allows..."
          rows={6}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select or create category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No category</SelectItem>
            {categories.map((category: string) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Or type new category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="mt-2"
        />
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
  );
}
