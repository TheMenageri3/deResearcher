"use client";
import Image from "next/image";
import { Logo } from "../Logo";
import { usePathname } from "next/navigation";
import { Wallet } from "./Wallet";
import { MobileMenu } from "./MobileMenu";
import Link from "next/link";
import { SearchBar } from "../Dashboard/Navbar";
import { useUserStore } from "@/app/store/userStore";

export const NavLinks = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Research",
    href: "/research",
  },
  {
    name: "Peer Review",
    href: "/peer-review",
  },
  {
    name: "Dashboard", // TODO: Protect route & state with auth
    href: "/dashboard",
    protected: true,
  },
];

export const Navbar = () => {
  const pathname = usePathname();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  return (
    <nav className="flex items-center justify-between p-4 relative">
      <div className="flex items-center flex-1 max-w-3xl">
        <Link href="/" className="mr-4">
          <Logo />
        </Link>
        <button className="hidden lg:block flex-1">
          <span className="sr-only">Search</span>
          <SearchBar placeholder="Search the universe" />
        </button>
      </div>
      <div className="hidden lg:flex flex-row justify-between gap-[20px]">
        {NavLinks.filter((link) => !link.protected || isAuthenticated).map(
          (link) => (
            <div
              key={link.name}
              className={
                pathname === link.href
                  ? "flex p-[5px] flex-row gap-[10px] items-center border-b-2 border-primary"
                  : "flex p-[5px] flex-row gap-[10px] items-center border-b-2 border-transparent"
              }
            >
              <Link href={link.href} className="text-zinc-800 font-bold">
                {link.name}
              </Link>
            </div>
          )
        )}
        <Wallet />
      </div>
      <MobileMenu pathname={pathname} />
    </nav>
  );
};

export default Navbar;
