import Image from "next/image";
import Link from "next/link";

// ... existing code ...

<Link href="/" className="flex items-center">
  <div className="flex items-center gap-2">
    <div className="relative w-12 h-12">
      <Image 
        src="/mymcatstudyverseblack.png"
        alt="MyMCAT Study Universe Logo"
        fill
        className="object-contain"
      />
    </div>
    <span className="text-xl text-black hover:text-blue-400 transition-colors font-krungthep">mymcat.ai</span>
  </div>
</Link>