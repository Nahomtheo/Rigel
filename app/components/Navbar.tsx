"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import AnimatedLogo from "./AnimatedLogo";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="
      sticky top-0 z-50
      overflow-hidden
      border-b
      border-[#C9A227]/30
      bg-[#120B07]/90
      backdrop-blur-xl
      "
    >

      {/* Ethiopian Tilet Pattern */}
      <div
        className="
        absolute inset-0
        opacity-[0.12]
        pointer-events-none
        "
        style={{
          backgroundImage: `
          linear-gradient(45deg,#C9A227 1px,transparent 1px),
          linear-gradient(-45deg,#C9A227 1px,transparent 1px)
          `,
          backgroundSize:"28px 28px"
        }}
      />


      <div className="
      relative z-10
      max-w-7xl
      mx-auto
      px-4
      h-16
      flex
      items-center
      justify-between
      ">


        {/* Logo */}

        <Link 
        href="/" 
        className="
        flex
        items-center
        gap-3
        "
        >

          <div
          className="
          rounded-full
          p-2
          border
          border-[#C9A227]/50
          bg-black/30
          mt-4
          "
          >
            <AnimatedLogo />
          </div>


          <span
          className="
          font-serif
          font-bold
          text-xl
          tracking-widest
          bg-gradient-to-r
          from-[#F5E6B8]
          via-[#C9A227]
          to-[#8B6B23]
          text-transparent
          bg-clip-text
          "
          >
            Rigel
          </span>

        </Link>




        {/* Desktop */}

        <div className="
        hidden
        md:flex
        items-center
        gap-6
        ">


          {[
            ["Home","/"],
            ["Search","/search"],
            ["My listing","/createlisting"]
          ].map(([name,path])=>(

            <Link
            key={path}
            href={path}
            className="
            text-[#F5EFE6]
            hover:text-[#C9A227]
            transition
            text-sm
            font-medium
            "
            >
              {name}
            </Link>

          ))}



          {!session ? (

          <Link
          href="/login"
          className="
          px-5
          py-2
          rounded-full
          bg-[#C9A227]
          text-black
          font-semibold
          hover:bg-[#e2bd42]
          transition
          "
          >
            Login
          </Link>


          ):(

          <button
          onClick={()=>signOut({callbackUrl:"/"})}
          className="
          px-5
          py-2
          rounded-full
          bg-[#E8D49A]
          text-[#120B07]
          font-semibold
          hover:bg-[#C9A227]
          transition
          "
          >
            Logout
          </button>

          )}



        </div>





        {/* Mobile button */}

        <button

        onClick={()=>setOpen(!open)}

        className="
        md:hidden
        p-2
        rounded-lg
        border
        border-[#C9A227]/50
        text-[#C9A227]
        bg-black/30
        "
        >

          ☰

        </button>



      </div>





      {/* Mobile Menu */}

      {open && (

      <div
      className="
      relative
      z-20
      md:hidden
      px-4
      pb-5
      bg-[#120B07]
      border-t
      border-[#C9A227]/20
      "
      >

      {[
        ["Home","/"],
        ["Search","/search"],
        ["My listing","/createlisting"]
      ].map(([name,path])=>(

        <Link
        key={path}
        onClick={()=>setOpen(false)}
        href={path}
        className="
        block
        py-3
        px-5
        mt-3
        rounded-full
        text-[#F5EFE6]
        hover:bg-[#C9A227]/20
        hover:text-[#C9A227]
        "
        >

          {name}

        </Link>

      ))}



      {!session ?

      <Link
      href="/login"
      className="
      block
      mt-3
      text-center
      bg-[#C9A227]
      text-black
      py-3
      rounded-full
      font-bold
      "
      >
        Login
      </Link>

      :

      <button
      onClick={()=>{
        setOpen(false);
        signOut({callbackUrl:"/"})
      }}
      className="
      w-full
      mt-3
      bg-[#E8D49A]
      text-black
      py-3
      rounded-full
      font-bold
      "
      >
        Logout
      </button>

      }


      </div>

      )}

    </nav>
  );
}