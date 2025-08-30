'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Type, 
  Layout, 
  Save, 
  RotateCcw, 
  Eye,
  Smartphone,
  Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DesignCustomizerProps {
  site: any;
}

const colorPresets = [
  { name: 'Ocean Blue', primary: '#3b82f6', secondary: '#64748b' },
  { name: 'Forest Green', primary: '#059669', secondary: '#6b7280' },
  { name: 'Sunset Orange', primary: '#ea580c', secondary: '#6b7280' },
  { name: 'Royal Purple', primary: '#7c3aed', secondary: '#6b7280' },
  { name: 'Rose Pink', primary: '#e11d48', secondary: '#6b7280' },
  { name: 'Midnight Dark', primary: '#1f2937', secondary: '#4b5563' },
];

const fontOptions = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Montserrat', value: 'Montserrat' },
];

const layoutOptions = [
  { name: 'Modern', value: 'modern', description: 'Clean and minimal design' },
  { name: 'Classic', value: 'classic', description: 'Traditional layout' },
  { name: 'Compact', value: 'compact', description: 'Space-efficient design' },
  { name: 'Card-based', value: 'cards', description: 'Card-style FAQ items' },
];

export default function DesignCustomizer({ site }: DesignCustomizerProps) {
  const [theme, setTheme] = useState(site.theme || {});
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const supabase = createClient();

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('faq_sites')
        .update({ 
          theme,
          updated_at: new Date().toISOString()
        })
        .eq('id', site.id);

      if (error) throw error;
      toast.success('Design saved successfully');
    } catch (error: any) {
      toast.error('Failed to save design');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultTheme = {
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Inter',
      borderRadius: '8px',
      layout: 'modern'
    };
    setTheme(defaultTheme);
    toast.success('Design reset to default');
  };

  const updateTheme = (key: string, value: any) => {
    setTheme({ ...theme, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Design Customizer</h2>
          <p className="text-gray-600">Customize the appearance of: {site.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Design'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Design Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Colors
              </CardTitle>
              <CardDescription>
                Customize your site's color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Presets */}
              <div className="space-y-3">
                <Label>Color Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {colorPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      className="h-auto p-3 justify-start"
                      onClick={() => {
                        updateTheme('primaryColor', preset.primary);
                        updateTheme('secondaryColor', preset.secondary);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: preset.secondary }}
                          />
                        </div>
                        <span className="text-xs">{preset.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={theme.primaryColor || '#3b82f6'}
                      onChange={(e) => updateTheme('primaryColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={theme.primaryColor || '#3b82f6'}
                      onChange={(e) => updateTheme('primaryColor', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={theme.secondaryColor || '#64748b'}
                      onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={theme.secondaryColor || '#64748b'}
                      onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                      placeholder="#64748b"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bg-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={theme.backgroundColor || '#ffffff'}
                      onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={theme.backgroundColor || '#ffffff'}
                      onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text-color"
                      type="color"
                      value={theme.textColor || '#1f2937'}
                      onChange={(e) => updateTheme('textColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={theme.textColor || '#1f2937'}
                      onChange={(e) => updateTheme('textColor', e.target.value)}
                      placeholder="#1f2937"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Typography
              </CardTitle>
              <CardDescription>
                Choose fonts and text styling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={theme.fontFamily || 'Inter'}
                  onValueChange={(value) => updateTheme('fontFamily', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Layout
              </CardTitle>
              <CardDescription>
                Choose your site's layout style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {layoutOptions.map((layout) => (
                  <div
                    key={layout.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      theme.layout === layout.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateTheme('layout', layout.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{layout.name}</h4>
                        <p className="text-sm text-gray-600">{layout.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        theme.layout === layout.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Border Radius</Label>
                <Select
                  value={theme.borderRadius || '8px'}
                  onValueChange={(value) => updateTheme('borderRadius', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0px">None (0px)</SelectItem>
                    <SelectItem value="4px">Small (4px)</SelectItem>
                    <SelectItem value="8px">Medium (8px)</SelectItem>
                    <SelectItem value="12px">Large (12px)</SelectItem>
                    <SelectItem value="16px">Extra Large (16px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Preview</h3>
            <div className="flex gap-2">
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <motion.div
            layout
            className={`border rounded-lg overflow-hidden ${
              previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
            }`}
          >
            <div
              style={{
                backgroundColor: theme.backgroundColor || '#ffffff',
                color: theme.textColor || '#1f2937',
                fontFamily: theme.fontFamily || 'Inter',
              }}
              className="p-6 min-h-96"
            >
              {/* Preview Header */}
              <div
                style={{
                  backgroundColor: theme.primaryColor || '#3b82f6',
                  borderRadius: theme.borderRadius || '8px',
                }}
                className="p-4 mb-6 text-white"
              >
                <h1 className="text-xl font-bold">{site.name}</h1>
                <p className="opacity-90 text-sm">Frequently Asked Questions</p>
              </div>

              {/* Preview FAQ Items */}
              <div className="space-y-4">
                {[
                  { question: 'What is your return policy?', answer: 'We offer a 30-day return policy for all items.' },
                  { question: 'How long does shipping take?', answer: 'Standard shipping takes 3-5 business days.' },
                  { question: 'Do you offer international shipping?', answer: 'Yes, we ship worldwide with various options.' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      borderRadius: theme.borderRadius || '8px',
                      borderColor: theme.secondaryColor || '#64748b',
                    }}
                    className={`border p-4 ${
                      theme.layout === 'cards' 
                        ? 'bg-white shadow-sm' 
                        : 'bg-transparent'
                    }`}
                  >
                    <h3 className="font-semibold mb-2">{item.question}</h3>
                    <p 
                      style={{ color: theme.secondaryColor || '#64748b' }}
                      className="text-sm"
                    >
                      {item.answer}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}