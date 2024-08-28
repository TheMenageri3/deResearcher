"use client";
import Image from "next/image";
import { Logo } from "./Logo";
import { useState } from "react";

const NavLinks = [
  {
    name: "Home",
    href: "/",
  },
];

export const Navbar = () => {
  const [active, setActive] = useState<string>("Home");

  const handleClick = (title: string) => {
    setActive(title);
  };
  return (
    <nav className="flex items-center gap-[30px] p-4">
      <Logo />
      <div className="flex flex-row justify-between">
        {NavLinks.map((link) => (
          <div
            key={link.name}
            className={
              active === link.name
                ? "flex p-[5px] flex-row gap-[10px] items-center border-b-2 border-primary"
                : "flex p-[5px] flex-row gap-[10px] items-center"
            }
          >
            <Image src={"/navbar-link.svg"} width={20} height={20} alt="link" />
            <a
              href={link.href}
              className="text-primary font-bold"
              onClick={() => handleClick(link.name)}
            >
              {link.name}
            </a>
          </div>
        ))}
      </div>
    </nav>
  );
};
