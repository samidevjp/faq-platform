"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { generateRandomDomain } from "@/lib/utils";
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
import { motion } from "framer-motion";
import { Globe, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface CreateSiteFormProps {
  onSiteCreated: (site: any) => void;
  userId: string;
}

export default function CreateSiteForm({
  onSiteCreated,
  userId,
}: CreateSiteFormProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    let domain = (formData.get("domain") as string)?.trim();

    // ドメインが未入力の場合、ランダムなドメインを生成
    if (!domain) {
      domain = generateRandomDomain();
    }

    try {
      const defaultTheme = {
        primaryColor: "#3b82f6",
        secondaryColor: "#64748b",
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        fontFamily: "Inter",
        borderRadius: "8px",
        layout: "modern",
      };

      const { data, error } = await supabase
        .from("faq_sites")
        .insert({
          user_id: userId,
          name,
          description: description || null,
          domain,
          theme: defaultTheme,
        })
        .select()
        .single();

      if (error) throw error;

      onSiteCreated(data);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to create site");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Site Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="My Awesome FAQ"
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="A helpful FAQ site for our customers..."
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain">Custom Domain</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="domain"
              name="domain"
              placeholder="domain"
              className="pl-10 h-12"
            />
          </div>
          <p className="text-xs text-gray-500">
            You can set up a custom domain later in the settings
          </p>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          disabled={loading}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
            />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          {loading ? "Creating Site..." : "Create Site"}
        </Button>
      </form>
    </motion.div>
  );
}
