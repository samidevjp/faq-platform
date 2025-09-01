"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  HelpCircle,
  Tag,
} from "lucide-react";

interface FAQListProps {
  faqItems: any[];
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (item: any) => void;
  onAddNew: () => void;
}

export default function FAQList({
  faqItems,
  onEdit,
  onDelete,
  onTogglePublish,
  onAddNew,
}: FAQListProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={onAddNew}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ Item
        </Button>
      </div>

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
                        onClick={() => onTogglePublish(item)}
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
                        onClick={() => onEdit(item)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => onDelete(item.id)}
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
            onClick={onAddNew}
            className="bg-gradient-to-r from-green-600 to-emerald-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First FAQ
          </Button>
        </motion.div>
      )}
    </>
  );
}
