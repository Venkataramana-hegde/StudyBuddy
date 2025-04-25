import { Mail } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import Image from "next/image";


const Footer = () => {
  return (
    <>
      <div className="border-t border-gray-700 w-full" /> {/* top separator */}
      <footer className="w-full bg-bgDarkViolet text-gray-300 py-3 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Left: Tagline or name */}
          <div className="flex flex-col gap-2.5 text-center md:text-left text-sm">
            <Image
              src="/logo.png"
              alt="StudyBuddy Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <p className="font-semibold text-lg">StudyBuddy</p>
            <p className="text-xs mt-1">Built for students, by students.</p>
          </div>

          {/* Middle: Quick Links */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm ">
            <a href="#" className="hover:text-white transition">
              About
            </a>
            <a href="#" className="hover:text-white transition">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition">
              Contact
            </a>
          </div>

          {/* Right: Socials & Email */}
          <div className="flex flex-col items-center md:items-end gap-2 text-sm">
            <a
              href="mailto:hegdevenkataramana225@email.com"
              className="flex items-center gap-2 hover:text-white transition"
            >
              <Mail className="w-4 h-4" />
              hello@StudyBuddy.web
            </a>
            <a
              href="https://www.linkedin.com/in/venkataramanahegde/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition"
            >
              <FaLinkedin className="w-4 h-4" />
              LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} StudyBuddy. All rights reserved.
        </div>
      </footer>
    </>
  );
};

export default Footer;
