"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Star,
  Beaker,
  Menu,
  User2Icon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useUserStore } from "@/app/store/userStore";
import { PAPER_STATUS } from "@/lib/constants";

type LinkDefinition = {
  name: string;
  icon: React.ElementType;
  href: string;
  subItems?: { name: string; href: string }[];
};

export default function Sidebar() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [papersExpanded, setPapersExpanded] = useState(false);
  const pathname = usePathname();

  const isPapersRoute = pathname.startsWith("/dashboard/papers");

  const { researcherProfile, isLoading } = useUserStore();

  const dynamicLinks = useMemo(() => {
    const baseLinks = [
      { name: "Dashboard", icon: Home, href: "/dashboard" },
      {
        name: "Papers",
        icon: FileText,
        href: "/dashboard/papers/overview",
        subItems: [
          { name: "Overview", href: "/dashboard/papers/overview" },
          { name: "Minted", href: `/dashboard/papers/${PAPER_STATUS.MINTED}` },
        ],
      },
      { name: "Reviews", icon: Star, href: "/dashboard/reviews" },
      { name: "Labs", icon: Beaker, href: "/dashboard/labs" },
    ];

    if (researcherProfile === null) {
      baseLinks.splice(1, 0, {
        name: "Profile",
        icon: User2Icon,
        href: "/dashboard/profile",
      });
    }

    return baseLinks;
  }, [researcherProfile]);

  useEffect(() => {
    if (isPapersRoute) {
      setPapersExpanded(true);
    }
  }, [isPapersRoute]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarExpanded(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleItemClick = (item: LinkDefinition, e: React.MouseEvent) => {
    if (item.subItems) {
      if (sidebarExpanded) {
        e.preventDefault();
        setPapersExpanded(!papersExpanded);
      }
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const isActiveLink = (item: LinkDefinition) => {
    if (item.subItems) {
      return false; // Papers tab itself is never directly active
    }
    return pathname === item.href;
  };

  const isActiveSubItem = (href: string) => {
    return pathname.includes(href);
  };

  return (
    <aside
      className={`bg-white shadow-md transition-all duration-300 ${
        sidebarExpanded ? "w-60" : "w-16"
      }`}
    >
      <div className="p-4 flex justify-between items-center">
        {sidebarExpanded && (
          <Link href="/">
            <Logo />
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-zinc-200"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      <nav className="mt-8">
        {dynamicLinks.map((item) => (
          <div key={item.name}>
            <Link
              href={item.href}
              onClick={(e) => handleItemClick(item, e)}
              className={`flex items-center px-4 py-2 text-zinc-700 hover:bg-zinc-100 ${
                isActiveLink(item) ? "bg-zinc-100" : ""
              }`}
            >
              <item.icon className="h-5 w-5" />
              {sidebarExpanded && (
                <>
                  <span className="ml-3">{item.name}</span>
                  {item.subItems && (
                    <span className="ml-auto">
                      {papersExpanded || isPapersRoute ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </>
              )}
            </Link>
            {item.subItems &&
              sidebarExpanded &&
              (papersExpanded || isPapersRoute) && (
                <div className="ml-6">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className={`flex items-center px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 ${
                        isActiveSubItem(subItem.href) ? "bg-zinc-100" : ""
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
