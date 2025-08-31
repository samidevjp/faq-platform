"use client";

import { useState } from "react";
import { SiteTheme, defaultTheme } from "@/lib/types/theme";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";

interface ThemeCustomizerProps {
  siteId: string;
  initialTheme?: Partial<SiteTheme>;
  onThemeChange?: (theme: SiteTheme) => void;
}

export default function ThemeCustomizer({
  siteId,
  initialTheme = {},
  onThemeChange,
}: ThemeCustomizerProps) {
  const [theme, setTheme] = useState<SiteTheme>({
    ...defaultTheme,
    ...initialTheme,
  });

  const handleChange = (key: keyof SiteTheme, value: string) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const handleSave = async () => {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("faq_sites")
        .update({ theme })
        .eq("id", siteId);

      if (error) throw error;
      toast.success("テーマを保存しました");
    } catch (error) {
      console.error("Error saving theme:", error);
      toast.error("テーマの保存に失敗しました");
    }
  };

  const handleReset = () => {
    setTheme(defaultTheme);
    onThemeChange?.(defaultTheme);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>デザインのカスタマイズ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">メインカラー</Label>
            <Input
              id="primaryColor"
              type="color"
              value={theme.primaryColor}
              onChange={(e) => handleChange("primaryColor", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backgroundColor">背景色</Label>
            <Input
              id="backgroundColor"
              type="color"
              value={theme.backgroundColor}
              onChange={(e) => handleChange("backgroundColor", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionColor">質問テキストの色</Label>
            <Input
              id="questionColor"
              type="color"
              value={theme.questionColor}
              onChange={(e) => handleChange("questionColor", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answerColor">回答テキストの色</Label>
            <Input
              id="answerColor"
              type="color"
              value={theme.answerColor}
              onChange={(e) => handleChange("answerColor", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="borderRadius">角の丸み</Label>
            <Input
              id="borderRadius"
              type="text"
              value={theme.borderRadius}
              onChange={(e) => handleChange("borderRadius", e.target.value)}
              placeholder="例: 0.5rem"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxWidth">最大幅</Label>
            <Input
              id="maxWidth"
              type="text"
              value={theme.maxWidth}
              onChange={(e) => handleChange("maxWidth", e.target.value)}
              placeholder="例: 48rem"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleReset}>
            デフォルトに戻す
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </div>
      </CardContent>
    </Card>
  );
}
