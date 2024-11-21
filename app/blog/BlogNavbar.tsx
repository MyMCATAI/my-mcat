import Link from "next/link";
import { FaLinkedin, FaInstagram } from 'react-icons/fa';

export const BlogNavbar = () => {
  return (
    <nav className="flex items-center bg-white justify-between shadow-sm h-24">
      <div className="flex items-center space-x-4 px-4">
        <div className="flex space-x-8">
          <Link href="/" className="flex items-center">
            <span className="text-xl text-black hover:text-blue-400 transition-colors">MyMCAT.ai</span>
          </Link>
        </div>
      </div>
      
      <div className="flex items-center h-full">
        <span
          className="flex items-start h-full bg-black mr-[-1px]"
          style={{
            clipPath: "polygon(100% 0%, 100% 51%, 100% 73%, 18% 72%, 11% 48%, 0 0)",
            opacity: 1,
          }}
        >
          <p className="ms-12 mt-4 pr-1 text-xs text-white">
            designed by <br />&nbsp;&nbsp;&nbsp;&nbsp;a certified baller
          </p>
          <div className="mt-5 mx-3">
            <FaLinkedin 
              size={25} 
              className="text-white transition-colors duration-200 hover:text-blue-400"
            />
          </div>
          <div className="mt-4 mx-2">
            <Link href="https://www.instagram.com/an0thermanicmonday/" target="_blank" rel="noopener noreferrer">
              <FaInstagram 
                size={30} 
                className="text-white transition-colors duration-200 hover:text-blue-400"
              />
            </Link>
          </div>
        </span>
      </div>
    </nav>
  );
}; 