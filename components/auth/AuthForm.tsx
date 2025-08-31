"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { HelpCircle, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";

export default function AuthForm() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    try {
      console.log("Attempting sign up with:", { email, fullName });

      // トリガーを使わずにアカウント作成とプロファイル作成を分離
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // ダッシュボードで必要な基本情報のみmetadataに保存
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error("Supabase auth error:", error);
        throw error;
      }

      console.log("Sign up successful:", data);

      // ユーザーが作成された場合、手動でプロファイルを作成
      if (data.user && data.user.id) {
        try {
          console.log("Creating profile manually...");

          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email: data.user.email || email,
              full_name: fullName || "",
              avatar_url: null,
            });

          if (insertError) {
            console.error("Profile creation failed:", insertError);

            // プロファイル作成に失敗した場合でも、アカウント作成は成功とみなす
            // ユーザーは後でプロファイルを完成させることができる
            console.warn(
              "Profile creation failed, but user account was created"
            );
          } else {
            console.log("Profile created successfully");
          }
        } catch (profileError) {
          console.error("Profile creation error:", profileError);
          // プロファイル作成エラーでも継続
        }
      }

      toast.success(
        "Account created successfully! Please check your email for verification."
      );
    } catch (error: any) {
      console.error("Sign up error:", error);

      let errorMessage = "Database error saving new user";
      if (error.message) {
        errorMessage = error.message;
      }

      // より詳細なエラー情報を表示
      if (
        error.message?.includes(
          "duplicate key value violates unique constraint"
        )
      ) {
        errorMessage = "このメールアドレスは既に使用されています";
      } else if (error.message?.includes("trigger")) {
        errorMessage =
          "アカウントの作成でエラーが発生しました。しばらく経ってから再試行してください";
      } else if (error.message?.includes("profiles")) {
        errorMessage = "ユーザープロファイルの作成に失敗しました";
      } else if (error.message?.includes("Internal Server Error")) {
        errorMessage =
          "サーバーエラーが発生しました。しばらく経ってから再試行してください";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success("Signed in successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4"
          >
            <HelpCircle className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FAQ Manager</h1>
          <p className="text-gray-600">Create and manage beautiful FAQ sites</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-name"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
