import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-mobile-hero bg-center bg-no-repeat h-full">
      <div className="w-4/6 mx-auto pt-16">
        <div>
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-custom-primary via-middle-gradient to-custom-accent bg-clip-text text-transparent">E-Borrow</h1>
          <h1 className="text-6xl font-extrabold">Where <em>borrowing</em> meets brilliance!</h1>
        </div>
        
        <div className="pt-7">
          <p className="text-lg text-gray-600">
            Your campus borrowing hub! Instantly access and borrow items from textbooks to tech, making student life simpler.
          </p>
        </div>

        <div className="pt-20">
          <button className="bg-custom-button-primary w-full py-3.5 rounded-xl text-white font-medium text-lg">
            Get Started
          </button>
        </div>
      </div>
    </div>
   
  );
}
