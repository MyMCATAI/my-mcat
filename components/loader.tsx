import Image from "next/image"

export const Loader = ()=>{
    return(
        <div className="h-full flex flex-col gap-y-4 items-center">
            <div className="h-10 w-10 relative animate-spin">
            <Image
            alt="logo"
            fill
            src ="/logo.png"
            />
            </div>
            <p className="text-m text-muted-foreground">
            Kalypso is thinking...
            </p>
        </div>
    )
}