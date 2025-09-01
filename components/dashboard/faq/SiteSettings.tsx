"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save } from "lucide-react";
import { isDomainAvailable } from "@/lib/utils/domain";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SiteSettingsProps {
  siteName: string;
  domain: string;
  isNameEdited: boolean;
  onSiteNameChange: (name: string) => void;
  onSiteNameSave: () => void;
  onDomainChange: (domain: string) => void;
  onDomainSave: () => void;
}

export default function SiteSettings({
  siteName,
  domain,
  isNameEdited,
  onSiteNameChange,
  onSiteNameSave,
  onDomainChange,
  onDomainSave,
}: SiteSettingsProps) {
  const [isDomainEdited, setIsDomainEdited] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);

  const handleDomainChange = async (newDomain: string) => {
    const formattedDomain = newDomain
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    setIsDomainEdited(true);
    onDomainChange(formattedDomain);

    if (formattedDomain === domain) {
      setIsDomainEdited(false);
      return;
    }

    if (formattedDomain.length < 3) {
      setDomainError("ドメインは3文字以上である必要があります");
      return;
    }

    if (formattedDomain.length > 63) {
      setDomainError("ドメインは63文字以下である必要があります");
      return;
    }

    setIsCheckingDomain(true);
    try {
      const isAvailable = await isDomainAvailable(formattedDomain);
      if (!isAvailable) {
        setDomainError("このドメインは既に使用されています");
      } else {
        setDomainError(null);
      }
    } catch (error) {
      setDomainError("ドメインの確認中にエラーが発生しました");
    } finally {
      setIsCheckingDomain(false);
    }
  };

  const handleDomainSave = () => {
    if (!domainError && isDomainEdited) {
      onDomainSave();
      setIsDomainEdited(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>サイト設定</CardTitle>
        <CardDescription>サイトの基本設定を管理します</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site-name">サイト名</Label>
            <div className="flex items-center gap-2">
              <Input
                id="site-name"
                value={siteName}
                onChange={(e) => onSiteNameChange(e.target.value)}
                className="max-w-xs text-gray-600"
                placeholder="サイト名"
              />
              {isNameEdited && (
                <Button
                  onClick={onSiteNameSave}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">ドメイン</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-xs">
                  <Input
                    id="domain"
                    value={domain}
                    onChange={(e) => handleDomainChange(e.target.value)}
                    className="text-gray-600 pr-24"
                    placeholder="your-site"
                    disabled={isCheckingDomain}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    .faq.com
                  </span>
                </div>
                {isDomainEdited && !domainError && (
                  <Button
                    onClick={handleDomainSave}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isCheckingDomain}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                )}
              </div>
              {domainError && (
                <Alert variant="destructive">
                  <AlertDescription>{domainError}</AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-gray-500">
                ドメインは一意である必要があります。英数字とハイフンのみ使用できます。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
