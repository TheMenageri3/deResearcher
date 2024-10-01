"use client";
import Image from "next/image";
import { useState } from "react";
import { Wallet } from "./Wallet";
import { NavLinks } from "./Navbar";
import Link from "next/link";
import { Search } from "lucide-react";
import { useUserStore } from "@/app/store/userStore";
import { useWallet } from "@solana/wallet-adapter-react";

interface MobileMenuProps {
  pathname: string;
}

export const MobileMenu = ({ pathname }: MobileMenuProps) => {
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const { isAuthenticated } = useUserStore();
  const { connected } = useWallet();

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
  };

  const filteredNavLinks = NavLinks.filter(
    (link) => link.name !== "Dashboard" || (isAuthenticated && connected)
  );

  return (
    <div className="lg:hidden flex items-center z-50">
      <button className="p-2 mr-2 hover:bg-zinc-100 rounded-md transition-colors duration-200">
        <Search className="h-5 w-5 text-zinc-600" />
      </button>
      <button
        onClick={toggleMenu}
        title="menu"
        className="flex flex-row gap-[3px] items-center"
      >
        <Image src={"/WF Icon Button.svg"} width={35} height={35} alt="logo" />
      </button>
      <div
        className={`${
          openMenu ? "flex" : "hidden"
        } flex-col gap-4 w-full py-4 absolute left-0 top-20 border-2 border-none rounded-md bg-background shadow-lg`}
      >
        {filteredNavLinks.map((link) => (
          <div
            key={link.name}
            className={
              pathname === link.href
                ? "flex bg-muted px-[15px] flex-row gap-[10px] items-center"
                : "flex hover:bg-muted/40 px-[15px] flex-row gap-[10px] items-center"
            }
          >
            <Link
              href={link.href}
              className={`block flex-1 font-bold py-[10px] ${
                pathname === link.href
                  ? "text-primary"
                  : "text-zinc-500 hover:text-primary"
              }`}
              onClick={() => setOpenMenu(false)}
            >
              {link.name}
            </Link>
          </div>
        ))}
        <div className="flex justify-center">
          <Wallet />
        </div>
      </div>
    </div>
  );
};
