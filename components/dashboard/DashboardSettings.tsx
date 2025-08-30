'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, 
  Palette, 
  Save, 
  Upload,
  Shield,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardSettingsProps {
  user: User;
  dashboardTheme: string;
  onThemeChange: (theme: string) => void;
}

const themeOptions = [
  { name: 'Ocean Blue', value: 'blue', colors: ['#3b82f6', '#1e40af'] },
  { name: 'Royal Purple', value: 'purple', colors: ['#7c3aed', '#5b21b6'] },
  { name: 'Forest Green', value: 'green', colors: ['#059669', '#047857'] },
  { name: 'Sunset Orange', value: 'orange', colors: ['#ea580c', '#c2410c'] },
];

export default function DashboardSettings({ user, dashboardTheme, onThemeChange }: DashboardSettingsProps) {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: user.user_metadata?.full_name || '',
    email: user.email || '',
  });
  const supabase = createClient();

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profile.full_name }
      });

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (theme: string) => {
    onThemeChange(theme);
    localStorage.setItem('dashboard-theme', theme);
    document.documentElement.setAttribute('data-dashboard-theme', theme);
    toast.success('Dashboard theme updated');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">Manage your account and dashboard preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and avatar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-lg">
                        {profile.full_name?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" type="button">
                      <Upload className="w-4 h-4 mr-2" />
                      Change Avatar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="appearance">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Theme</CardTitle>
                <CardDescription>
                  Customize the appearance of your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>Color Scheme</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {themeOptions.map((theme) => (
                      <motion.div
                        key={theme.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          dashboardTheme === theme.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleThemeChange(theme.value)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{theme.name}</h4>
                            <div className="flex gap-1 mt-2">
                              {theme.colors.map((color, index) => (
                                <div
                                  key={index}
                                  className="w-6 h-6 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            dashboardTheme === theme.value
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Notification Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}