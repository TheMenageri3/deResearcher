"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, FileText, Star, Beaker, Menu, User2Icon } from "lucide-react";
import { Logo } from "@/components/Logo";

type LinkDefinition = {
  name: string;
  icon: React.ElementType;
  href: string;
};

type SidebarHeaderProps = {
  expanded: boolean;
  onToggle: () => void;
};

type SidebarLinkProps = {
  item: LinkDefinition;
  expanded: boolean;
  active: boolean;
};

// Constants
const links: LinkDefinition[] = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Profile", icon: User2Icon, href: "/dashboard" },
  { name: "Papers", icon: FileText, href: "/dashboard" },
  { name: "Reviews", icon: Star, href: "/dashboard" },
  { name: "Labs", icon: Beaker, href: "/dashboard" },
];

// Sidebar Header Component
function SidebarHeader({ expanded, onToggle }: SidebarHeaderProps) {
  return (
    <div className="p-4 flex justify-between items-center">
      {expanded && (
        <Link href="/">
          <Logo />
        </Link>
      )}
      <button onClick={onToggle} className="p-2 rounded-md hover:bg-zinc-200">
        <Menu className="h-6 w-6" />
      </button>
    </div>
  );
}

// Sidebar Link Component
function SidebarLink({ item, expanded, active }: SidebarLinkProps) {
  return (
    <Link
      href={item.href}
      className={`flex items-center px-4 py-2 text-zinc-700 hover:bg-zinc-100 ${
        active ? "bg-zinc-100" : ""
      }`}
    >
      <item.icon className="h-5 w-5" />
      {expanded && <span className="ml-3">{item.name}</span>}
    </Link>
  );
}

// Main Sidebar Component
export default function Sidebar() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Sidebar resize depending on screen size
  useEffect(() => {
    const handleResize = () => {
      setSidebarExpanded(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <aside
      className={`bg-white shadow-md transition-all duration-300 ${
        sidebarExpanded ? "w-60" : "w-16"
      }`}
    >
      <SidebarHeader expanded={sidebarExpanded} onToggle={toggleSidebar} />
      <nav className="mt-8">
        {links.map((item, index) => (
          <SidebarLink
            key={item.name}
            item={item}
            expanded={sidebarExpanded}
            active={index === 0}
          />
        ))}
      </nav>
    </aside>
  );
}
