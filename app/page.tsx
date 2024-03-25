import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-mobile-hero bg-no-repeat h-full md:bg-right md:grid md:grid-cols-2">
      <div className="w-4/6 mx-auto pt-16 pb-20 md:p-0 md:my-auto">
        <div>
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-custom-primary via-middle-gradient to-custom-accent bg-clip-text text-transparent">E-Borrow</h1>
          <h1 className="text-6xl font-extrabold">Where <em>borrowing</em> meets brilliance!</h1>
        </div>
        
        <div className="pt-7">
          <p className="text-lg text-gray-600">
            Your campus borrowing hub! Instantly access and borrow items from textbooks to tech, making student life simpler.
          </p>
        </div>

        <div className="pt-20 md:hidden">
          <Link href="/login">
            <button className="bg-custom-button-primary w-full py-3.5 rounded-xl text-white font-medium text-lg">
              Get Started
            </button>
          </Link>
        </div>
      </div>
      <div className="hidden md:block mx-auto my-auto">
        <Image
          src="/assets/svg/heroSVG.svg"
          width={500}
          height={500}
          alt="Mobile Lines"
        />
      </div>
    </div>
   
  );
}
