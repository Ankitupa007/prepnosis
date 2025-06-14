import Image from 'next/image'
import Link from 'next/link'

const Logo = ({ }) => {
  return <div className="flex items-center gap-2">
    <Link href={"/"}>
      <Image
        src={"/logo.png"}
        alt="Prepnosis Logo"
        width={40}
        height={40}
        priority
        draggable={false}
        loading="eager"
        unoptimized={true}
        fetchPriority="high"
        style={{ objectFit: "contain" }}
        className="h-10 w-10 object-cover"
      />
    </Link>
    {/* <h1 className="font-bold text-xl text-[#6FCCCA]">prepnosis</h1> */}
  </div>

}

export default Logo