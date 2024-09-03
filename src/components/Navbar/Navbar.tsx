"use client";
import Image from "next/image";
import { Logo } from "../Logo";
import { useState } from "react";
import { cva } from "class-variance-authority";
import { Wallet } from "./Wallet";
import { MobileMenu } from "./MobileMenu";

export const NavLinks = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Research",
    href: "#",
  },
];

export const Navbar = () => {
  const [active, setActive] = useState<string>("Home");

  const handleClick = (title: string) => {
    setActive(title);
  };
  return (
    <nav className="flex items-center justify-between p-4 relative">
      <Logo />
      <div className="hidden tablet:flex flex-row justify-between gap-[20px]">
        {NavLinks.map((link) => (
          <div
            key={link.name}
            className={
              active === link.name
                ? "flex p-[5px] flex-row gap-[10px] items-center border-b-2 border-primary"
                : "flex p-[5px] flex-row gap-[10px] items-center border-b-2 border-transparent"
            }
          >
            <Image src={"/navbar-link.svg"} width={20} height={20} alt="link" />
            <a
              href={link.href}
              className="text-zinc-800 font-bold"
              onClick={() => handleClick(link.name)}
            >
              {link.name}
            </a>
          </div>
        ))}
        <Wallet />
      </div>
      <MobileMenu active={active} setActive={setActive} />
    </nav>
  );
};

export default Navbar;