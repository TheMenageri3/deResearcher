"use client";
import Image from "next/image";
import { Logo } from "../Logo";
import { useState } from "react";
import { cva } from "class-variance-authority";
import { Wallet } from "./Wallet";
import { NavLinks } from "./Navbar";

interface menu{
    active: string,
    setActive: React.Dispatch<React.SetStateAction<string>>
}

export const MobileMenu = ({active, setActive}: menu) => {
    const [openMenu, setOpenMenu] = useState<boolean>(false)
    const toggleMenu = () => {
        setOpenMenu(!openMenu)
    }
    return(
        <div className="tablet:hidden">
            <button onClick={toggleMenu} title="menu" className="flex flex-row gap-[3px] items-center">
                <Image src={"/WF Icon Button.svg"} width={35} height={35} alt="logo" />
            </button>

            <div className={`${openMenu? "right-0" : "-right-80"} transition-all flex flex-col gap-4 w-full max-w-72 h-screen py-5 px-3 absolute top-0 bg-background shadow-lg`}>

                <button onClick={toggleMenu} title="menu" className="flex flex-row gap-[3px] items-center justify-end">
                    <Image src={"/WF Icon Button.svg"} width={35} height={35} alt="logo" />
                </button>
            {NavLinks.map((link) => (
                <div
                    key={link.name}
                    className={
                    active === link.name
                        ? "flex hover:bg-muted hover:cursor-pointer px-[15px] flex-row gap-[10px] items-center" //Change to highlight later
                        : "flex hover:bg-muted hover:cursor-pointer px-[15px] flex-row gap-[10px] items-center"
                    }
                >
                    <Image src={"/navbar-link.svg"} width={20} height={20} alt="link" />
                    <a
                    href={link.href}
                    className="block flex-1 text-primary font-bold py-[10px]"
                    onClick={() => {
                        setActive(link.name)
                        setOpenMenu(false)
                    }}
                    >
                    {link.name}
                    </a>
                </div>
            ))}
                <div className="flex justify-center"> 
                    <Wallet />  
                </div>
            </div>
        </div>
    )
}