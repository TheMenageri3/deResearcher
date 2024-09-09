"use client";
import Image from "next/image";
import { Logo } from "../Logo";
import { useState } from "react";
import { cva } from "class-variance-authority";
import { Wallet } from "./Wallet";
import { MobileMenu } from "./MobileMenu";
import { usePathname, useRouter } from "next/navigation";
import P from "../P";

type NavLink = {
  name: string;
  href: string;
};

export const NavLinks: NavLink[] = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Profile",
    href: "/dashboard",
  },
];

export const Navbar = () => {
  const [active, setActive] = useState<string>("Home");

  let router = useRouter();

  let path = usePathname();

  const handleClick = (routeName: string, routeLink: string): void => {
    console.log(routeName);
    setActive(routeName);
    if (path !== routeLink) {
      router.push(routeLink);
    }
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
                ? "flex p-[5px] flex-row gap-[10px] items-center border-b-2 border-primary cursor-pointer"
                : "flex p-[5px] flex-row gap-[10px] items-center border-b-2 border-transparent cursor-pointer"
            }
          >
            <Image src={"/navbar-link.svg"} width={20} height={20} alt="link" />
            <div onClick={() => handleClick(link.name, link.href)}>
              <P className="font-bold">{link.name}</P>
            </div>
          </div>
        ))}
        <Wallet />
      </div>
      <MobileMenu active={active} setActive={setActive} />
    </nav>
  );
};

export default Navbar;
