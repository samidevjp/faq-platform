'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Plus, 
  Settings, 
  LogOut, 
  Globe, 
  Edit3,
  Palette,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import SitesList from './SitesList';
import CreateSiteForm from './CreateSiteForm';
import FAQEditor from './FAQEditor';
import DesignCustomizer from './DesignCustomizer';
import DashboardSettings from './DashboardSettings';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('sites');
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardTheme, setDashboardTheme] = useState('blue');
  const supabase = createClient();

  useEffect(() => {
    fetchSites();
    loadDashboardTheme();
  }, []);

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('faq_sites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSites(data || []);
    } catch (error: any) {
      toast.error('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardTheme = () => {
    const savedTheme = localStorage.getItem('dashboard-theme') || 'blue';
    setDashboardTheme(savedTheme);
    document.documentElement.setAttribute('data-dashboard-theme', savedTheme);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  };

  const handleSiteCreated = (newSite: any) => {
    setSites([newSite, ...sites]);
    setActiveTab('sites');
    toast.success('Site created successfully!');
  };

  const handleSiteSelect = (site: any) => {
    setSelectedSite(site);
    setActiveTab('editor');
  };

  const themeColors = {
    blue: 'from-blue-600 to-indigo-600',
    purple: 'from-purple-600 to-pink-600',
    green: 'from-green-600 to-emerald-600',
    orange: 'from-orange-600 to-red-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className={`bg-gradient-to-r ${themeColors[dashboardTheme as keyof typeof themeColors]} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <HelpCircle className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-xl font-bold text-white">FAQ Manager</h1>
                <p className="text-blue-100 text-sm">Welcome back, {user.user_metadata?.full_name || user.email}</p>
              </div>
            </motion.div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="sites" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Sites</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-2" disabled={!selectedSite}>
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Editor</span>
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center gap-2" disabled={!selectedSite}>
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Design</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sites">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SitesList 
                sites={sites} 
                loading={loading} 
                onSiteSelect={handleSiteSelect}
                onSitesChange={setSites}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="create">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CreateSiteForm onSiteCreated={handleSiteCreated} userId={user.id} />
            </motion.div>
          </TabsContent>

          <TabsContent value="editor">
            {selectedSite && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <FAQEditor site={selectedSite} />
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="design">
            {selectedSite && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <DesignCustomizer site={selectedSite} />
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DashboardSettings 
                user={user} 
                dashboardTheme={dashboardTheme}
                onThemeChange={setDashboardTheme}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}