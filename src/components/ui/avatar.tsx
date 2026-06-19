import Image from "next/image";
import { cn, initials } from "@/lib/utils";

export function Avatar({
  src,
  name,
  email,
  className
}: {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-semibold", className)}>
      {src ? <Image src={src} alt={name ?? "User avatar"} fill className="object-cover" /> : initials(name, email)}
    </div>
  );
}
