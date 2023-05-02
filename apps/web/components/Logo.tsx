import lazy from "next/dynamic";

import type { LogoProps } from "@/types";
import type { FC } from "react";

import icon from "@/app/icon.svg";

const Image = lazy(() => import("next/image"));
const Link = lazy(() => import("next/link"));

const Logo: FC<LogoProps> = ({ bigger }) => (
  <section className={`flex items-center ${bigger && "mt-3"}`}>
    <Link href="/" className="bg-primary mx-2 rounded-full">
      <Image src={icon} alt="Logo" height={bigger ? 30 : 20} width={bigger ? 60 : 50} priority blurDataURL={icon.src} className="cursor-pointer" />
    </Link>
    <p className={bigger ? "text-3xl font-bold" : "hidden md:block"}>Tea Share</p>
  </section>
);

export default Logo;
