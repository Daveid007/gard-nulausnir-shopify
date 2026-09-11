import { Link } from "wouter";
import logo from "@/assets/gardinulausnir-logo.png";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Gardínulausnir – fara á forsíðu"
      className={`block shrink-0 overflow-hidden bg-black ${className}`}
    >
      <img
        src={logo}
        alt="Gardínulausnir"
        className="h-full w-full object-contain"
      />
    </Link>
  );
}