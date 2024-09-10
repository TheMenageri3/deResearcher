import Image from "next/image";
import P from "./P";
import { useRouter } from "next/navigation";

export const Logo = () => {
  const router = useRouter();
  const handleClick = () => {
    router.push("/");
  };

  return (
    <div
      className="flex flex-row gap-[3px] items-center cursor-pointer"
      onClick={handleClick}
    >
      <Image src={"/atom3.svg"} width={50} height={50} alt="logo" />
      <P className="font-bold">deResearcher</P>
    </div>
  );
};
