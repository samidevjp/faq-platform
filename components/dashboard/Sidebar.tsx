"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Globe, Settings } from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({
  activeSection,
  onSectionChange,
}: SidebarProps) {
  const menuItems = [
    {
      id: "sites",
      label: "Sites",
      icon: Globe,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                activeSection === item.id
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
