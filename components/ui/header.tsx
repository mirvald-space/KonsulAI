import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="w-full py-4 px-4 md:px-6 flex justify-center">
      <Link href="/" className="relative w-[120px] h-[40px]">
        <Image 
          src="/logo.png" 
          alt="Logo" 
          fill
          className="object-contain"
          priority
        />
      </Link>
    </header>
  );
} 