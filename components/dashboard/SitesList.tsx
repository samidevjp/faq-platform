"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateSiteForm from "./CreateSiteForm";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Globe,
  Edit3,
  Trash2,
  ExternalLink,
  Calendar,
  Plus,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SitesListProps {
  sites: any[];
  loading: boolean;
  userId: string;
  onSiteSelect: (site: any) => void;
  onSitesChange: (sites: any[]) => void;
}

export default function SitesList({
  sites,
  loading,
  userId,
  onSiteSelect,
  onSitesChange,
}: SitesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const supabase = createClient();

  const handleDelete = async (siteId: string) => {
    setDeletingId(siteId);
    try {
      const { error } = await supabase
        .from("faq_sites")
        .delete()
        .eq("id", siteId);

      if (error) throw error;

      const updatedSites = sites.filter((site) => site.id !== siteId);
      onSitesChange(updatedSites);
      toast.success("Site deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete site");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No FAQ sites yet
        </h3>
        <p className="text-gray-600 mb-6">
          Create your first FAQ site to get started
        </p>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Site
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New FAQ Site</DialogTitle>
              <DialogDescription>
                Build a beautiful FAQ site for your customers
              </DialogDescription>
            </DialogHeader>
            <CreateSiteForm
              userId={userId}
              onSiteCreated={(newSite) => {
                onSitesChange([...sites, newSite]);
                setIsCreateModalOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your FAQ Sites</h2>
          <p className="text-gray-600">Manage and edit your FAQ sites</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {sites.length} {sites.length === 1 ? "site" : "sites"}
          </Badge>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Add a Site
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New FAQ Site</DialogTitle>
                <DialogDescription>
                  Build a beautiful FAQ site for your customers
                </DialogDescription>
              </DialogHeader>
              <CreateSiteForm
                userId={userId}
                onSiteCreated={(newSite) => {
                  onSitesChange([...sites, newSite]);
                  setIsCreateModalOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site, index) => (
          <motion.div
            key={site.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {site.name}
                      </CardTitle>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(site.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                {site.description && (
                  <CardDescription className="mt-2 line-clamp-2">
                    {site.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-4">
                  {site.domain && (
                    <a
                      href={`/sites/${site.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline"
                    >
                      <Badge
                        variant="outline"
                        className="text-xs hover:bg-gray-100"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {site.domain}
                      </Badge>
                    </a>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    FAQ Site
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onSiteSelect(site)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    size="sm"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deletingId === site.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Site</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{site.name}"? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(site.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
