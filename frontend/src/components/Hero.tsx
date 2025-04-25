import Link from "next/link";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="bg-dark-blue text-white h-screen flex items-center justify-center flex-col text-center">
      <h1 className="text-4xl font-bold mb-4">Study Smarter, Together</h1>
      <p className="text-xl mb-8">
        Join study groups, track your progress, and stay motivated with
        real-time collaboration.
      </p>
      <Link href="#startSection">
        <Button>Get started</Button>
      </Link>
    </section>
  );
};

export default Hero;
