import Image from 'next/image'
import Link from 'next/link'

const Logo = ({ }) => {
  return <div className="flex items-center gap-2">
    <Link href={"/"}>
      <Image
        src={"/logo.svg"}
        alt="Prepnosis Logo"
        width={36}
        height={36}
        priority
        draggable={false}
        loading="eager"
        unoptimized={true}
        fetchPriority="high"
        style={{ objectFit: "contain" }}
        className="h-9 w-9 object-cover"
      />
    </Link>
    {/* <h1 className="font-bold text-xl text-[#6FCCCA]">prepnosis</h1> */}
  </div>

}

export default Logo