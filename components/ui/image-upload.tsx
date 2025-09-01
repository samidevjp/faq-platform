"use client";

import { useCallback, useState } from "react";
import { Button } from "./button";
import { Upload, X, Camera } from "lucide-react";
import Image from "next/image";
import { uploadProfileImage } from "@/lib/utils/storage";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setIsUploading(true);

        // ファイルサイズチェック（5MB以下）
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("ファイルサイズは5MB以下にしてください");
        }

        // ファイルタイプチェック
        if (!file.type.startsWith("image/")) {
          throw new Error("画像ファイルのみアップロード可能です");
        }

        // Supabaseのストレージにアップロード
        const imageUrl = await uploadProfileImage(file);
        onChange(imageUrl);
      } catch (error) {
        console.error("画像アップロードエラー:", error);
        alert(
          error instanceof Error
            ? error.message
            : "画像のアップロードに失敗しました"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={disabled || isUploading}
        className="hidden"
        id="image-upload"
      />
      {value ? (
        <div className="relative w-40 h-40">
          <Image
            src={value}
            alt="Uploaded image"
            className="object-cover rounded-full"
            fill
          />
          <button
            onClick={onRemove}
            className="absolute top-0 right-0 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="w-40 h-40 border-2 border-dashed rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition">
            <Camera className="w-10 h-10 text-gray-400" />
          </div>
        </label>
      )}
      {!value && (
        <label htmlFor="image-upload" className="cursor-pointer">
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isUploading}
            className="bg-white hover:bg-gray-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "アップロード中..." : "アバターを変更"}
          </Button>
        </label>
      )}
    </div>
  );
}
